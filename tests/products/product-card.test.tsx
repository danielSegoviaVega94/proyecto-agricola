import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProductCard } from "@/components/products/product-card";

describe("ProductCard", () => {
  it("renders product data and detail link", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{
          id: "product-1",
          title: "Tomate orgánico",
          comuna: "Vicuña",
          averageScore: 4.9,
          minPricePerUnit: 1300,
          minQuantityLabel: "desde 30kg",
        }}
      />,
    );

    expect(html).toContain("Tomate orgánico");
    expect(html).toContain("4.9");
    expect(html).toContain("Vicuña");
    expect(html).toContain("/producto/product-1");
  });
});
