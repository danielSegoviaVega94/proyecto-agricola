import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("Home landing page", () => {
  it("renders the marketplace hero copy in Spanish", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Del campo");
    expect(html).toContain("a tu cocina");
    expect(html).toContain("Buscar tomate, lechuga, frutas...");
    expect(html).toContain("Empezar a vender");
    expect(html).not.toContain(">Chat<");
  });
});
