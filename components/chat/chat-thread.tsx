"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { buildChatRealtimeBridge, type ChatMessageRecord } from "@/lib/chat/realtime";

type ChatThreadProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>;
};

function formatMessageTime(timestamp: string) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function toUiMessage(message: ChatMessageRecord) {
  return {
    id: message.id,
    senderId: message.sender_id,
    content: message.content,
    createdAt: message.created_at,
  };
}

export function ChatThread({ conversationId, currentUserId, initialMessages }: ChatThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bridgeRef = useRef<ReturnType<typeof buildChatRealtimeBridge> | null>(null);

  useEffect(() => {
    const supabase =
      createBrowserSupabaseClient() as unknown as Parameters<typeof buildChatRealtimeBridge>[0];
    const bridge = buildChatRealtimeBridge(supabase, conversationId, (incomingMessage) => {
      setMessages((current) => {
        if (current.some((item) => item.id === incomingMessage.id)) {
          return current;
        }

        return [...current, toUiMessage(incomingMessage)];
      });
    });

    bridgeRef.current = bridge;

    return () => {
      bridgeRef.current = null;
      bridge.unsubscribe();
    };
  }, [conversationId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();

    if (!content) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const bridge = bridgeRef.current;
      if (!bridge) {
        setErrorMessage("No hay conexión de chat disponible.");
        return;
      }

      const result = await bridge.sendMessage(currentUserId, content);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      setDraft("");
    });
  }

  return (
    <section className="flex min-h-[60vh] flex-col rounded-2xl border border-[#e8e6e0] bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-[#8a8a8a]">Todavía no hay mensajes. Inicia la conversación.</p>
        ) : null}

        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          return (
            <article
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                isMine
                  ? "ml-auto bg-[#16803c] text-white"
                  : "mr-auto border border-[#e8e6e0] bg-[#fafaf7] text-[#0f0f0f]"
              }`}
            >
              <p>{message.content}</p>
              <p className={`mt-1 text-[11px] ${isMine ? "text-[#dcfce7]" : "text-[#8a8a8a]"}`}>
                {formatMessageTime(message.createdAt)}
              </p>
            </article>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#f0eee8] p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            name="message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe un mensaje..."
            className="h-11 flex-1 rounded-xl border border-[#e8e6e0] px-3 text-sm outline-none focus:border-[#16803c]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#16803c] px-4 text-sm font-semibold text-white disabled:opacity-70"
          >
            Enviar
          </button>
        </div>
        {errorMessage ? <p className="mt-2 text-xs text-[#b91c1c]">{errorMessage}</p> : null}
      </form>
    </section>
  );
}
