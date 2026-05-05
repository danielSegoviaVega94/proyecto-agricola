import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("PWA icons", () => {
  it("ships 192px and 512px app icons in public", () => {
    const publicDir = path.resolve(process.cwd(), "public");

    expect(fs.existsSync(path.join(publicDir, "icon-192.png"))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, "icon-512.png"))).toBe(true);
  });
});
