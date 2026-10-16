import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/products/catalog", () => ({
  getLatestCatalogProducts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/categories/get-category-tree", () => ({
  getCategoryTree: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}));

import HomePage from "@/app/page";

describe("Home landing page", () => {
  it("renders the marketplace hero copy in Spanish", async () => {
    const element = await HomePage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Del campo");
    expect(html).toContain("a tu cocina");
    expect(html).toContain("Buscar tomate, lechuga, frutas...");
    expect(html).toContain("Empezar a vender");
    expect(html).not.toContain(">Chat<");
  });
});
