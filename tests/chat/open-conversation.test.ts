import { beforeEach, describe, expect, it, vi } from "vitest";

import { openConversation } from "@/app/chat/actions";

const {
  createServerSupabaseClientMock,
  getUserMock,
  productMaybeSingleMock,
  conversationsFromMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  getUserMock: vi.fn(),
  productMaybeSingleMock: vi.fn(),
  conversationsFromMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("openConversation", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    getUserMock.mockReset();
    productMaybeSingleMock.mockReset();
    conversationsFromMock.mockReset();
  });

  it("rejects when buyer tries to open conversation with their own product", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "11111111-1111-1111-1111-111111111111" } },
      error: null,
    });

    productMaybeSingleMock.mockResolvedValue({
      data: { id: "product-1", seller_id: "11111111-1111-1111-1111-111111111111" },
      error: null,
    });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
      from: vi.fn((table: string) => {
        if (table === "products") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: productMaybeSingleMock,
              })),
            })),
          };
        }

        if (table === "conversations") {
          conversationsFromMock();
        }

        return {};
      }),
    });

    const result = await openConversation("product-1");

    expect(result.status).toBe("error");
    expect(result.message).toContain("propia publicación");
    expect(conversationsFromMock).not.toHaveBeenCalled();
  });
});
