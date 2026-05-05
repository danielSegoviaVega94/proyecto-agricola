import { beforeEach, describe, expect, it, vi } from "vitest";

import { submitRating } from "@/app/chat/actions";
import { initialSubmitRatingState } from "@/app/chat/state";

const {
  createServerSupabaseClientMock,
  getUserMock,
  maybeSingleConversationMock,
  maybeSingleExistingRatingMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  getUserMock: vi.fn(),
  maybeSingleConversationMock: vi.fn(),
  maybeSingleExistingRatingMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("submitRating", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    getUserMock.mockReset();
    maybeSingleConversationMock.mockReset();
    maybeSingleExistingRatingMock.mockReset();
  });

  it("rejects duplicate ratings for the same conversation", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "buyer-1" } },
      error: null,
    });

    maybeSingleConversationMock.mockResolvedValue({
      data: {
        id: "conversation-1",
        product_id: "product-1",
        buyer_id: "buyer-1",
        seller_id: "seller-1",
        status: "closed",
      },
      error: null,
    });

    maybeSingleExistingRatingMock.mockResolvedValue({
      data: { id: "rating-1" },
      error: null,
    });

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

        if (table === "ratings") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: maybeSingleExistingRatingMock,
                })),
              })),
            })),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const formData = new FormData();
    formData.set("conversationId", "conversation-1");
    formData.set("score", "5");
    formData.set("comment", "Muy buen trato");

    const result = await submitRating(initialSubmitRatingState, formData);

    expect(result.status).toBe("error");
    expect(result.message).toContain("Ya enviaste");
  });
});
