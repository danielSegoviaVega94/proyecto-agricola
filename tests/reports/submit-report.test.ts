import { beforeEach, describe, expect, it, vi } from "vitest";

import { submitReport } from "@/app/chat/actions";
import { initialSubmitReportState } from "@/app/chat/state";

const {
  createServerSupabaseClientMock,
  getUserMock,
  maybeSingleConversationMock,
  insertReportMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  getUserMock: vi.fn(),
  maybeSingleConversationMock: vi.fn(),
  insertReportMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("submitReport", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    getUserMock.mockReset();
    maybeSingleConversationMock.mockReset();
    insertReportMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("creates a pending report against the counterpart in the conversation", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "buyer-1" } },
      error: null,
    });

    maybeSingleConversationMock.mockResolvedValue({
      data: {
        id: "conversation-1",
        buyer_id: "buyer-1",
        seller_id: "seller-1",
      },
      error: null,
    });

    insertReportMock.mockResolvedValue({ error: null });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
      from: vi.fn((table: string) => {
        if (table === "conversations") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: maybeSingleConversationMock,
              })),
            })),
          };
        }

        if (table === "reports") {
          return {
            insert: insertReportMock,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const formData = new FormData();
    formData.set("conversationId", "conversation-1");
    formData.set("reason", "Insultos en el chat");

    const result = await submitReport(initialSubmitReportState, formData);

    expect(result.status).toBe("success");
    expect(insertReportMock).toHaveBeenCalledWith({
      reporter_id: "buyer-1",
      reported_id: "seller-1",
      conversation_id: "conversation-1",
      reason: "Insultos en el chat",
      status: "pending",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/chat/conversation-1");
  });
});
