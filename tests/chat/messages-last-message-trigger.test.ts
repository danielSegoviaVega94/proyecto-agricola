import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("messages trigger", () => {
  it("updates conversations.last_message_at when inserting a message", () => {
    const sqlPath = path.resolve(
      process.cwd(),
      "supabase/migrations/0002_messages_last_message_trigger.sql",
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    expect(sql).toContain("create or replace function public.sync_conversation_last_message_at()");
    expect(sql).toContain("set last_message_at = new.created_at");
    expect(sql).toContain("create trigger trg_messages_sync_conversation_last_message_at");
    expect(sql).toContain("after insert on public.messages");
  });
});
