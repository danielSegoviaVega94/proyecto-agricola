import Link from "next/link";
import { redirect } from "next/navigation";

import { openConversation } from "@/app/chat/actions";
import { getConversationInbox } from "@/lib/chat/server-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ChatInboxPageProps = {
  searchParams: Promise<{ productId?: string; error?: string }>;
};

function formatLastMessageDate(timestamp: string | null) {
  if (!timestamp) {
    return "sin mensajes";
  }

  return new Intl.DateTimeFormat("es-CL", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default async function ChatInboxPage({ searchParams }: ChatInboxPageProps) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  let openConversationError = params.error ? decodeURIComponent(params.error) : null;

  if (params.productId) {
    const openResult = await openConversation(params.productId);
    if (openResult.status === "success" && openResult.redirectTo) {
      redirect(openResult.redirectTo);
    }

    openConversationError = openResult.message;
  }

  const conversations = await getConversationInbox(user.id);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-20 pt-4">
        <header className="mb-5 flex items-center justify-between">
          <Link href="/" className="rounded-lg px-2 py-1 text-sm text-[#4a4a4a] hover:bg-[#f0eee8]">
            Volver
          </Link>
          <h1 className="text-lg font-semibold text-[#0f0f0f]">Conversaciones</h1>
          <span className="w-12" />
        </header>

        {openConversationError ? (
          <p className="mb-4 rounded-xl border border-[#f2d5d5] bg-[#fff1f1] px-3 py-2 text-sm text-[#b91c1c]">
            {openConversationError}
          </p>
        ) : null}

        {conversations.length === 0 ? (
          <section className="rounded-2xl border border-[#e8e6e0] bg-[#fafaf7] p-4">
            <p className="text-sm text-[#4a4a4a]">Aún no tienes conversaciones. Contacta un producto para empezar.</p>
          </section>
        ) : (
          <section className="space-y-3">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className="block rounded-2xl border border-[#e8e6e0] p-3 hover:bg-[#fafaf7]"
              >
                <p className="text-sm font-semibold text-[#0f0f0f]">{conversation.counterpartName}</p>
                <p className="mt-1 text-xs text-[#8a8a8a]">Sobre: {conversation.productTitle}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p
                    className={`text-xs font-medium ${
                      conversation.status === "open" ? "text-[#16803c]" : "text-[#8a8a8a]"
                    }`}
                  >
                    {conversation.status === "open" ? "Abierta" : "Cerrada"}
                  </p>
                  <p className="text-xs text-[#8a8a8a]">{formatLastMessageDate(conversation.lastMessageAt)}</p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
