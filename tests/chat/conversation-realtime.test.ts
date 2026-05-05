import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildChatRealtimeBridge } from "@/lib/chat/realtime";

type InsertPayload = {
  conversation_id: string;
  sender_id: string;
  content: string;
};

describe("buildChatRealtimeBridge", () => {
  let insertMock: ReturnType<typeof vi.fn>;
  let onCallback: ((payload: { new: InsertPayload & { id: string; created_at: string } }) => void) | null;

  beforeEach(() => {
    insertMock = vi.fn().mockResolvedValue({ error: null });
    onCallback = null;
  });

  it("sends messages and receives realtime inserts for the active conversation", async () => {
    const channelStub = {
      on: vi.fn((_event: string, _filter: unknown, callback: typeof onCallback) => {
        onCallback = callback;
        return channelStub;
      }),
      subscribe: vi.fn(),
    };

    const supabase = {
      from: vi.fn(() => ({
        insert: insertMock,
      })),
      channel: vi.fn(() => channelStub),
      removeChannel: vi.fn(),
    };

    const received: string[] = [];
    const bridge = buildChatRealtimeBridge(
      supabase as unknown as Parameters<typeof buildChatRealtimeBridge>[0],
      "conversation-1",
      (message) => {
        received.push(message.content);
      },
    );

    await bridge.sendMessage("buyer-1", "  Hola, ¿sigue disponible?  ");

    expect(insertMock).toHaveBeenCalledWith({
      conversation_id: "conversation-1",
      sender_id: "buyer-1",
      content: "Hola, ¿sigue disponible?",
    });

    expect(onCallback).not.toBeNull();
    onCallback?.({
      new: {
        id: "message-2",
        conversation_id: "conversation-1",
        sender_id: "seller-1",
        content: "Sí, tengo stock.",
        created_at: "2026-05-05T00:00:00.000Z",
      },
    });

    expect(received).toEqual(["Sí, tengo stock."]);
  });
});
