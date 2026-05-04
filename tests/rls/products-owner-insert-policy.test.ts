import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("products owner insert RLS policy", () => {
  it("requires seller_id = auth.uid() on products insert", () => {
    const sqlPath = path.resolve(process.cwd(), "supabase/migrations/0001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    expect(sql).toContain("create policy products_owner_insert");
    expect(sql).toContain("with check (seller_id = auth.uid())");
  });
});
