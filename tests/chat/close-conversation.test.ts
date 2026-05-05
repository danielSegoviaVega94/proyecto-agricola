import { beforeEach, describe, expect, it, vi } from "vitest";

import { closeConversation } from "@/app/chat/actions";

const {
  createServerSupabaseClientMock,
  getUserMock,
  updateMock,
  eqConversationIdMock,
  selectClosedConversationMock,
  singleClosedConversationMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  getUserMock: vi.fn(),
  updateMock: vi.fn(),
  eqConversationIdMock: vi.fn(),
  selectClosedConversationMock: vi.fn(),
  singleClosedConversationMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("closeConversation", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    getUserMock.mockReset();
    updateMock.mockReset();
    eqConversationIdMock.mockReset();
    selectClosedConversationMock.mockReset();
    singleClosedConversationMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("closes the conversation for an authenticated participant", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "buyer-1" } },
      error: null,
    });

    singleClosedConversationMock.mockResolvedValue({
      data: { id: "conversation-1", product_id: "product-1" },
      error: null,
    });
    selectClosedConversationMock.mockReturnValue({ single: singleClosedConversationMock });
    eqConversationIdMock.mockReturnValue({ select: selectClosedConversationMock });
    updateMock.mockReturnValue({ eq: eqConversationIdMock });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
      from: vi.fn((table: string) => {
        if (table === "conversations") {
          return { update: updateMock };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await closeConversation("conversation-1");

    expect(result.status).toBe("success");
    expect(updateMock).toHaveBeenCalledWith({ status: "closed" });
    expect(revalidatePathMock).toHaveBeenCalledWith("/chat");
    expect(revalidatePathMock).toHaveBeenCalledWith("/chat/conversation-1");
  });
});
