import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  it("defines app metadata and installable icons", () => {
    const result = manifest();

    expect(result.name).toBe("Tierra");
    expect(result.short_name).toBe("Tierra");
    expect(result.display).toBe("standalone");
    expect(result.start_url).toBe("/");
    expect(result.icons?.some((icon) => icon.src === "/icon-192.png")).toBe(true);
    expect(result.icons?.some((icon) => icon.src === "/icon-512.png")).toBe(true);
  });
});
