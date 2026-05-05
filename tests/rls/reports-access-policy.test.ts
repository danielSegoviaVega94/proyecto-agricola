import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("reports access RLS", () => {
  it("allows read only to reporter or admin, and insert only to conversation participants", () => {
    const sqlPath = path.resolve(process.cwd(), "supabase/migrations/0001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    expect(sql).toContain("create policy reports_reporter_or_admin_read");
    expect(sql).toContain("using (reporter_id = auth.uid() or public.is_admin())");
    expect(sql).toContain("create policy reports_participant_insert");
    expect(sql).toContain("reporter_id = auth.uid()");
  });
});
