"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type OpenConversationResult = {
  status: "success" | "error";
  message: string;
  conversationId: string | null;
  redirectTo: string | null;
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
