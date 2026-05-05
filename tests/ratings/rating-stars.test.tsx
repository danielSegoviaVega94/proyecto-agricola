import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RatingStars } from "@/components/rating/rating-stars";

describe("RatingStars", () => {
  it("renders the expected number of filled stars", () => {
    const html = renderToStaticMarkup(<RatingStars value={4} />);

    expect(html).toContain('aria-label="4 de 5 estrellas"');
    expect(html.match(/data-filled="true"/g)?.length ?? 0).toBe(4);
    expect(html.match(/data-filled="false"/g)?.length ?? 0).toBe(1);
  });
});
