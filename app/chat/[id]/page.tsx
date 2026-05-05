import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  closeConversation,
  submitReport,
  submitRating,
} from "@/app/chat/actions";
import { ChatThread } from "@/components/chat/chat-thread";
import { DisclaimerBanner } from "@/components/chat/disclaimer-banner";
import { ReportButton } from "@/components/chat/report-button";
import { RatingForm } from "@/components/rating/rating-form";
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
  const thread = conversation;

  async function closeDealAction() {
    "use server";
    await closeConversation(thread.id);
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-8 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <Link href="/chat" className="rounded-lg px-2 py-1 text-sm text-[#4a4a4a] hover:bg-[#f0eee8]">
            Volver
          </Link>
          <h1 className="text-base font-semibold text-[#0f0f0f]">{thread.counterpartName}</h1>
          <span className="w-12" />
        </header>

        <section className="mb-3 rounded-xl border border-[#e8e6e0] p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8a8a8a]">Publicación</p>
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                thread.status === "closed"
                  ? "bg-[#f0eee8] text-[#4a4a4a]"
                  : "bg-[#e8f5ee] text-[#115e2c]"
              }`}
            >
              {thread.status === "closed" ? "Trato cerrado" : "Trato abierto"}
            </span>
          </div>
          <p className="text-sm font-semibold text-[#0f0f0f]">{thread.productTitle}</p>
        </section>

        <div className="sticky top-2 z-10 mb-3">
          <DisclaimerBanner />
        </div>

        {thread.status === "open" ? (
          <form action={closeDealAction} className="mb-3">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d8eadf] bg-[#eef8f2] px-4 text-sm font-semibold text-[#115e2c]"
            >
              Cerrar trato
            </button>
          </form>
        ) : null}

        <ChatThread
          conversationId={thread.id}
          currentUserId={thread.currentUserId}
          isDemo={thread.isDemo}
          initialMessages={thread.messages}
        />

        {thread.status === "closed" && !thread.isDemo ? (
          <div className="mt-4">
            {thread.currentUserHasRated ? (
              <p className="rounded-xl border border-[#e8e6e0] bg-[#fafaf7] px-3 py-3 text-sm text-[#4a4a4a]">
                Ya dejaste tu valoración para este trato.
              </p>
            ) : (
              <RatingForm
                action={submitRating}
                conversationId={thread.id}
                counterpartName={thread.counterpartName}
              />
            )}
          </div>
        ) : null}

        {!thread.isDemo ? (
          <ReportButton
            action={submitReport}
            conversationId={thread.id}
            counterpartName={thread.counterpartName}
          />
        ) : null}
      </main>
    </div>
  );
}
