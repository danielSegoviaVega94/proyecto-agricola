"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type OnboardingActionState = {
  status: "idle" | "success" | "error";
  message: string;
  redirectTo: string | null;
};

export const initialOnboardingState: OnboardingActionState = {
  status: "idle",
  message: "",
  redirectTo: null,
};

export async function completeOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: "Debes iniciar sesión para completar tu perfil.",
      redirectTo: null,
    };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const comuna = String(formData.get("comuna") ?? "").trim();
  const businessName = String(formData.get("business_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!fullName || !comuna) {
    return {
      status: "error",
      message: "Nombre completo y comuna son obligatorios.",
      redirectTo: null,
    };
  }

  const { error } = await supabase.from("users").upsert({
    id: user.id,
    full_name: fullName,
    business_name: businessName || null,
    phone: phone || null,
    comuna,
    avatar_url: avatarUrl || null,
  });

  if (error) {
    return {
      status: "error",
      message: "No pudimos guardar tu perfil. Intenta nuevamente.",
      redirectTo: null,
    };
  }

  const redirectTo = `/perfil/${user.id}`;
  revalidatePath(redirectTo);

  return {
    status: "success",
    message: "Perfil guardado correctamente.",
    redirectTo,
  };
}
