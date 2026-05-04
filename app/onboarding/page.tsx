import { redirect } from "next/navigation";

import { completeOnboarding, initialOnboardingState } from "@/app/onboarding/actions";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();

  if (profile) {
    redirect(`/perfil/${user.id}`);
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-10 pt-6">
        <OnboardingForm state={initialOnboardingState} action={completeOnboarding} />
      </main>
    </div>
  );
}
