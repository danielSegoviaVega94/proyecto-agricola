import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("ratings RLS and constraints", () => {
  it("keeps ratings immutable and unique per rater/conversation", () => {
    const sqlPath = path.resolve(process.cwd(), "supabase/migrations/0001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    expect(sql).toContain("unique(rater_id, conversation_id)");
    expect(sql).toContain("create policy ratings_participant_insert");
    expect(sql).toContain("create policy ratings_admin_delete");
    expect(sql).not.toContain("on public.ratings for update");
  });
});
