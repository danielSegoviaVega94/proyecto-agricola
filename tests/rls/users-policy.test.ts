import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("users RLS policy in migration", () => {
  it("defines self insert and self or admin update policies", () => {
    const migrationPath = path.resolve(process.cwd(), "supabase/migrations/0001_init.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create policy users_self_insert");
    expect(sql).toContain("with check (auth.uid() = id)");
    expect(sql).toContain("create policy users_self_or_admin_update");
    expect(sql).toContain("auth.uid() = id or public.is_admin()");
  });
});
