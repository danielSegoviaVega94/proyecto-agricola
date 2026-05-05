"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type OpenConversationResult = {
  status: "success" | "error";
  message: string;
  conversationId: string | null;
  redirectTo: string | null;
};

export type ConversationActionResult = {
  status: "success" | "error";
  message: string;
};

export type SubmitRatingState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialSubmitRatingState: SubmitRatingState = {
  status: "idle",
  message: "",
};

export async function openConversation(productId: string): Promise<OpenConversationResult> {
  if (!productId) {
    return {
      status: "error",
      message: "No encontramos la publicación a contactar.",
      conversationId: null,
      redirectTo: null,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Debes iniciar sesión para contactar al vendedor.",
      conversationId: null,
      redirectTo: "/login",
    };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    return {
      status: "error",
      message: "No encontramos la publicación solicitada.",
      conversationId: null,
      redirectTo: null,
    };
  }

  if (product.seller_id === user.id) {
    return {
      status: "error",
      message: "No puedes abrir chat con tu propia publicación.",
      conversationId: null,
      redirectTo: null,
    };
  }

  const { data: existingConversation, error: existingConversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existingConversationError) {
    return {
      status: "error",
      message: "No fue posible abrir la conversación.",
      conversationId: null,
      redirectTo: null,
    };
  }

  if (existingConversation?.id) {
    return {
      status: "success",
      message: "Conversación existente.",
      conversationId: existingConversation.id,
      redirectTo: `/chat/${existingConversation.id}`,
    };
  }

  const { data: createdConversation, error: createConversationError } = await supabase
    .from("conversations")
    .insert({
      product_id: productId,
      buyer_id: user.id,
      seller_id: product.seller_id,
    })
    .select("id")
    .single();

  if (createConversationError || !createdConversation) {
    return {
      status: "error",
      message: "No fue posible crear la conversación.",
      conversationId: null,
      redirectTo: null,
    };
  }

  revalidatePath("/chat");
  revalidatePath(`/chat/${createdConversation.id}`);

  return {
    status: "success",
    message: "Conversación creada.",
    conversationId: createdConversation.id,
    redirectTo: `/chat/${createdConversation.id}`,
  };
}

export async function closeConversation(
  conversationId: string,
): Promise<ConversationActionResult> {
  if (!conversationId) {
    return {
      status: "error",
      message: "No encontramos la conversación a cerrar.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Debes iniciar sesión para cerrar el trato.",
    };
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .update({ status: "closed" })
    .eq("id", conversationId)
    .select("id, product_id")
    .single();

  if (error || !conversation) {
    return {
      status: "error",
      message: "No fue posible cerrar la conversación.",
    };
  }

  revalidatePath("/chat");
  revalidatePath(`/chat/${conversation.id}`);

  return {
    status: "success",
    message: "Trato cerrado correctamente.",
  };
}

export async function submitRating(
  _prevState: SubmitRatingState,
  formData: FormData,
): Promise<SubmitRatingState> {
  const conversationId = String(formData.get("conversationId") ?? "").trim();
  const score = Number(formData.get("score") ?? NaN);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!conversationId || !Number.isInteger(score) || score < 1 || score > 5) {
    return {
      status: "error",
      message: "Selecciona una valoración válida.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Debes iniciar sesión para valorar.",
    };
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, product_id, buyer_id, seller_id, status")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError || !conversation) {
    return {
      status: "error",
      message: "No encontramos la conversación a valorar.",
    };
  }

  const isParticipant =
    conversation.buyer_id === user.id || conversation.seller_id === user.id;

  if (!isParticipant) {
    return {
      status: "error",
      message: "No puedes valorar esta conversación.",
    };
  }

  if (conversation.status !== "closed") {
    return {
      status: "error",
      message: "Primero debes cerrar el trato.",
    };
  }

  const { data: existingRating } = await supabase
    .from("ratings")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("rater_id", user.id)
    .maybeSingle();

  if (existingRating?.id) {
    return {
      status: "error",
      message: "Ya enviaste tu valoración para este trato.",
    };
  }

  const ratedId =
    conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;

  const { error: insertError } = await supabase.from("ratings").insert({
    rater_id: user.id,
    rated_id: ratedId,
    conversation_id: conversationId,
    score,
    comment: comment.length > 0 ? comment : null,
  });

  if (insertError) {
    return {
      status: "error",
      message: "No fue posible guardar la valoración.",
    };
  }

  revalidatePath(`/chat/${conversationId}`);
  revalidatePath(`/perfil/${ratedId}`);
  revalidatePath("/productos");
  revalidatePath(`/producto/${conversation.product_id}`);

  return {
    status: "success",
    message: "Valoración enviada correctamente.",
  };
}
