create or replace function public.sync_conversation_last_message_at()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists trg_messages_sync_conversation_last_message_at on public.messages;

create trigger trg_messages_sync_conversation_last_message_at
after insert on public.messages
for each row
execute function public.sync_conversation_last_message_at();
