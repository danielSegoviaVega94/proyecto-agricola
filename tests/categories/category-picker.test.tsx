import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CategoryPicker } from "@/components/category-picker";

describe("CategoryPicker", () => {
  it("renders parent and child categories from the tree", () => {
    const html = renderToStaticMarkup(
      <CategoryPicker
        categories={[
          {
            id: "parent-a",
            name: "Verduras",
            slug: "verduras",
            children: [
              { id: "child-a", name: "Lechuga", slug: "lechuga" },
              { id: "child-b", name: "Tomate", slug: "tomate" },
            ],
          },
        ]}
      />,
    );

    expect(html).toContain("Categoría");
    expect(html).toContain("Verduras");
    expect(html).toContain("Lechuga");
    expect(html).toContain("Tomate");
  });
});
