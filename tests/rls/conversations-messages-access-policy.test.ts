import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("conversations/messages access RLS", () => {
  it("restricts reads to participants (or admin), preventing third-party access", () => {
    const sqlPath = path.resolve(process.cwd(), "supabase/migrations/0001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    expect(sql).toContain("create policy conversations_participants_or_admin_read");
    expect(sql).toContain("using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin())");
    expect(sql).toContain("create policy messages_participants_or_admin_read");
    expect(sql).toContain("using (public.is_conversation_participant(conversation_id) or public.is_admin())");
  });
});
