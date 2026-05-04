import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCategoryTree } from "@/lib/categories/get-category-tree";

const { createServerSupabaseClientMock, selectMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  selectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("getCategoryTree", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    selectMock.mockReset();
  });

  it("returns a two-level category tree sorted by sort_order", async () => {
    selectMock.mockResolvedValue({
      data: [
        {
          id: "child-b",
          name: "Tomate",
          slug: "tomate",
          parent_id: "parent-a",
          sort_order: 20,
        },
        {
          id: "parent-a",
          name: "Verduras",
          slug: "verduras",
          parent_id: null,
          sort_order: 10,
        },
        {
          id: "child-a",
          name: "Lechuga",
          slug: "lechuga",
          parent_id: "parent-a",
          sort_order: 15,
        },
      ],
      error: null,
    });

    createServerSupabaseClientMock.mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: selectMock,
      }),
    });

    const result = await getCategoryTree();

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("verduras");
    expect(result[0]?.children.map((child) => child.slug)).toEqual(["lechuga", "tomate"]);
  });
});
