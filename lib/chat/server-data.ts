import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoProducts } from "@/lib/products/demo-data";

type ConversationRow = {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: "open" | "closed";
  last_message_at: string | null;
  created_at: string;
  product: { id: string; title: string } | Array<{ id: string; title: string }> | null;
  buyer:
    | { id: string; full_name: string | null; business_name: string | null }
    | Array<{ id: string; full_name: string | null; business_name: string | null }>
    | null;
  seller:
    | { id: string; full_name: string | null; business_name: string | null }
    | Array<{ id: string; full_name: string | null; business_name: string | null }>
    | null;
};

export type ConversationListItem = {
  id: string;
  productId: string;
  productTitle: string;
  status: "open" | "closed";
  lastMessageAt: string | null;
  counterpartName: string;
};

export type ThreadMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type ConversationThread = {
  id: string;
  productId: string;
  productTitle: string;
  status: "open" | "closed";
  currentUserId: string;
  counterpartId: string;
  counterpartName: string;
  currentUserHasRated: boolean;
  isDemo: boolean;
  messages: ThreadMessage[];
};

function pickDisplayName(profile: { full_name: string | null; business_name: string | null } | null) {
  if (!profile) {
    return "Usuario";
  }

  return profile.business_name ?? profile.full_name ?? "Usuario";
}

function firstRelation<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeConversationRow(row: ConversationRow, currentUserId: string): ConversationListItem {
  const isBuyer = row.buyer_id === currentUserId;
  const counterpart = firstRelation(isBuyer ? row.seller : row.buyer);
  const product = firstRelation(row.product);

  return {
    id: row.id,
    productId: row.product_id,
    productTitle: product?.title ?? "Producto",
    status: row.status,
    lastMessageAt: row.last_message_at,
    counterpartName: pickDisplayName(counterpart),
  };
}

export async function getConversationInbox(currentUserId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
        id,
        product_id,
        buyer_id,
        seller_id,
        status,
        last_message_at,
        created_at,
        product:products!conversations_product_id_fkey(id, title),
        buyer:users!conversations_buyer_id_fkey(id, full_name, business_name),
        seller:users!conversations_seller_id_fkey(id, full_name, business_name)
      `,
    )
    .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as ConversationRow[]).map((row) =>
    normalizeConversationRow(row, currentUserId),
  );
}

export async function getConversationThread(conversationId: string, currentUserId: string) {
  if (conversationId.startsWith("demo-thread-")) {
    const productId = conversationId.replace("demo-thread-", "");
    const demoProduct = demoProducts.find((product) => product.id === productId);

    if (!demoProduct) {
      return null;
    }

    return {
      id: conversationId,
      productId: demoProduct.id,
      productTitle: demoProduct.title,
      status: "open",
      currentUserId,
      counterpartId: demoProduct.sellerId,
      counterpartName: demoProduct.sellerBusinessName ?? demoProduct.sellerName,
      currentUserHasRated: false,
      isDemo: true,
      messages: [
        {
          id: `${conversationId}-1`,
          senderId: demoProduct.sellerId,
          content: `Hola, soy ${demoProduct.sellerName}. Esta es una conversación demo sobre ${demoProduct.title}.`,
          createdAt: new Date("2026-05-05T10:00:00.000Z").toISOString(),
        },
        {
          id: `${conversationId}-2`,
          senderId: demoProduct.sellerId,
          content: "Puedes escribir para ver cómo se sentiría el chat, pero no se enviará a una persona real.",
          createdAt: new Date("2026-05-05T10:01:00.000Z").toISOString(),
        },
      ],
    } satisfies ConversationThread;
  }

  const supabase = await createServerSupabaseClient();
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select(
      `
        id,
        product_id,
        buyer_id,
        seller_id,
        status,
        last_message_at,
        created_at,
        product:products!conversations_product_id_fkey(id, title),
        buyer:users!conversations_buyer_id_fkey(id, full_name, business_name),
        seller:users!conversations_seller_id_fkey(id, full_name, business_name)
      `,
    )
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError || !conversation) {
    return null;
  }

  const normalized = normalizeConversationRow(conversation as unknown as ConversationRow, currentUserId);
  const counterpartId =
    conversation.buyer_id === currentUserId ? conversation.seller_id : conversation.buyer_id;

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError || !messages) {
    return null;
  }

  const { data: ratings } = await supabase
    .from("ratings")
    .select("id, rater_id")
    .eq("conversation_id", conversationId);

  const currentUserHasRated =
    ratings?.some((rating) => rating.rater_id === currentUserId) ?? false;

  return {
    id: normalized.id,
    productId: normalized.productId,
    productTitle: normalized.productTitle,
    status: normalized.status,
    counterpartName: normalized.counterpartName,
    currentUserId,
    counterpartId,
    currentUserHasRated,
    isDemo: false,
    messages: messages.map((message) => ({
      id: message.id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
    })),
  } satisfies ConversationThread;
}
