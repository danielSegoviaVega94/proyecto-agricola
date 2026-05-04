import { describe, expect, it } from "vitest";

import { createProductSchema } from "@/lib/products/product-schema";

describe("createProductSchema", () => {
  it("rejects price tiers with non-ascending min_quantity", () => {
    const result = createProductSchema.safeParse({
      title: "Tomate orgánico",
      description: "Tomate de Vicuña",
      categoryId: "20000000-0000-0000-0000-000000000001",
      measureUnit: "kg",
      stock: 50,
      comuna: "Vicuña",
      priceTiers: [
        { minQuantity: 10, pricePerUnit: 1300 },
        { minQuantity: 5, pricePerUnit: 1200 },
      ],
      imagePaths: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("ascendente"))).toBe(true);
  });
});
