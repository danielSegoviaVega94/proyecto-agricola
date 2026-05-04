import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, full_name, business_name, comuna, avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const avatarLabel = profile.full_name.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-[#f0eee8] bg-white p-4">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5ee] text-2xl font-bold text-[#115e2c]">
            {avatarLabel}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f0f0f]">{profile.full_name}</h1>
          {profile.business_name ? <p className="mt-1 text-base text-[#4a4a4a]">{profile.business_name}</p> : null}
          <p className="mt-1 text-sm text-[#8a8a8a]">{profile.comuna}</p>
          {profile.avatar_url ? (
            <a
              href={profile.avatar_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium text-[#16803c] underline"
            >
              Ver avatar
            </a>
          ) : null}
        </section>
      </main>
    </div>
  );
}
