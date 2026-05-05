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
  error: { message?: string } | null;
};

type RealtimeSupabaseLike = {
  from: (table: "messages") => {
    insert: (values: {
      conversation_id: string;
      sender_id: string;
      content: string;
    }) => PromiseLike<InsertResult> | InsertResult;
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

      const { error } = (await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
      })) as InsertResult;

      if (error) {
        return { error: "No fue posible enviar el mensaje." as const };
      }

      return { error: null };
    },
    unsubscribe() {
      supabase.removeChannel(channel);
    },
  };
}
