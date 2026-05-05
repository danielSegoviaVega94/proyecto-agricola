import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ChatThread } from "@/components/chat/chat-thread";
import { DisclaimerBanner } from "@/components/chat/disclaimer-banner";
import { getConversationThread } from "@/lib/chat/server-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ChatThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const conversation = await getConversationThread(id, user.id);
  if (!conversation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-8 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <Link href="/chat" className="rounded-lg px-2 py-1 text-sm text-[#4a4a4a] hover:bg-[#f0eee8]">
            Volver
          </Link>
          <h1 className="text-base font-semibold text-[#0f0f0f]">{conversation.counterpartName}</h1>
          <span className="w-12" />
        </header>

        <section className="mb-3 rounded-xl border border-[#e8e6e0] p-3">
          <p className="text-xs text-[#8a8a8a]">Publicación</p>
          <p className="text-sm font-semibold text-[#0f0f0f]">{conversation.productTitle}</p>
        </section>

        <div className="sticky top-2 z-10 mb-3">
          <DisclaimerBanner />
        </div>

        <ChatThread
          conversationId={conversation.id}
          currentUserId={conversation.currentUserId}
          initialMessages={conversation.messages}
        />
      </main>
    </div>
  );
}
