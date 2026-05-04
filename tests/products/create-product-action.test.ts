import { beforeEach, describe, expect, it, vi } from "vitest";

import { createProduct, initialCreateProductState } from "@/app/publicar/actions";

const {
  createServerSupabaseClientMock,
  getUserMock,
  insertProductMock,
  insertTierMock,
  insertImageMock,
  selectProductMock,
  singleProductMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  getUserMock: vi.fn(),
  insertProductMock: vi.fn(),
  insertTierMock: vi.fn(),
  insertImageMock: vi.fn(),
  selectProductMock: vi.fn(),
  singleProductMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("createProduct action", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    getUserMock.mockReset();
    insertProductMock.mockReset();
    insertTierMock.mockReset();
    insertImageMock.mockReset();
    selectProductMock.mockReset();
    singleProductMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("creates product with tiers and images for authenticated vendedor", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "11111111-1111-1111-1111-111111111111",
        },
      },
      error: null,
    });

    singleProductMock.mockResolvedValue({
      data: { id: "product-1" },
      error: null,
    });
    selectProductMock.mockReturnValue({ single: singleProductMock });
    insertProductMock.mockReturnValue({ select: selectProductMock });
    insertTierMock.mockResolvedValue({ error: null });
    insertImageMock.mockResolvedValue({ error: null });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
      from: vi.fn((table: string) => {
        if (table === "products") {
          return { insert: insertProductMock };
        }

        if (table === "price_tiers") {
          return { insert: insertTierMock };
        }

        if (table === "product_images") {
          return { insert: insertImageMock };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const formData = new FormData();
    formData.set("title", "Tomate orgánico");
    formData.set("description", "Tomate de Vicuña");
    formData.set("categoryId", "20000000-0000-0000-0000-000000000001");
    formData.set("measureUnit", "kg");
    formData.set("stock", "50");
    formData.set("comuna", "Vicuña");
    formData.append("tier_min_quantity", "0");
    formData.append("tier_price_per_unit", "1500");
    formData.append("tier_min_quantity", "10");
    formData.append("tier_price_per_unit", "1300");
    formData.append("image_path", "products/product-1/1.jpg");

    const result = await createProduct(initialCreateProductState, formData);

    expect(result.status).toBe("success");
    expect(insertProductMock).toHaveBeenCalled();
    expect(insertTierMock).toHaveBeenCalled();
    expect(insertImageMock).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/perfil/11111111-1111-1111-1111-111111111111");
  });
});
