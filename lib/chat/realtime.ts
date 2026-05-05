export type ChatMessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type RealtimeChannel = {
  on: (
    event: "postgres_changes",
    filter: {
      event: "INSERT";
      schema: "public";
      table: "messages";
      filter: string;
    },
    callback: (payload: { new: ChatMessageRecord }) => void,
  ) => RealtimeChannel;
  subscribe: () => unknown;
};

type InsertResult = {
  data?: ChatMessageRecord | null;
  error: { message?: string } | null;
};

type RealtimeSupabaseLike = {
  from: (table: "messages") => {
    insert: (values: {
      conversation_id: string;
      sender_id: string;
      content: string;
    }) => {
      select?: (columns: string) => {
        single: () => PromiseLike<InsertResult> | InsertResult;
      };
    } | (PromiseLike<InsertResult> | InsertResult);
  };
  channel: (name: string) => RealtimeChannel;
  removeChannel: (channel: unknown) => unknown;
};

export function buildChatRealtimeBridge(
  supabase: RealtimeSupabaseLike,
  conversationId: string,
  onIncomingMessage: (message: ChatMessageRecord) => void,
) {
  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onIncomingMessage(payload.new);
      },
    );

  channel.subscribe();

  return {
    async sendMessage(senderId: string, content: string) {
      const trimmed = content.trim();
      if (!trimmed) {
        return { error: "El mensaje está vacío." as const };
      }

      if (conversationId.startsWith("demo-thread-")) {
        onIncomingMessage({
          id: `${conversationId}-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: senderId,
          content: trimmed,
          created_at: new Date().toISOString(),
        });

        return { error: null };
      }

      const insertResult = supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
      });
      const response =
        typeof insertResult === "object" &&
        insertResult &&
        "select" in insertResult &&
        typeof insertResult.select === "function"
          ? await insertResult
              .select("id,conversation_id,sender_id,content,created_at")
              .single()
          : await insertResult;
      const { data, error } = response as InsertResult;

      if (error) {
        return { error: "No fue posible enviar el mensaje." as const };
      }

      if (data) {
        onIncomingMessage(data);
      }

      return { error: null };
    },
    unsubscribe() {
      supabase.removeChannel(channel);
    },
  };
}
