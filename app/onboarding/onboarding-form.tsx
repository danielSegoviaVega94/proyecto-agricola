"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import type { OnboardingActionState } from "@/app/onboarding/actions";

type OnboardingFormProps = {
  state: OnboardingActionState;
  action: (state: OnboardingActionState, formData: FormData) => Promise<OnboardingActionState>;
};

export function OnboardingForm({ state, action }: OnboardingFormProps) {
  const router = useRouter();
  const [formState, formAction, isPending] = useActionState(action, state);

  useEffect(() => {
    if (formState.status === "success" && formState.redirectTo) {
      router.push(formState.redirectTo);
    }
  }, [formState, router]);

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-[#0f0f0f]">Completa tu perfil</h2>

      <div>
        <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
        />
      </div>

      <div>
        <label htmlFor="business_name" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Nombre de negocio (opcional)
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Teléfono (opcional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
        />
      </div>

      <div>
        <label htmlFor="comuna" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          Comuna
        </label>
        <input
          id="comuna"
          name="comuna"
          type="text"
          required
          className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
        />
      </div>

      <div>
        <label htmlFor="avatar_url" className="mb-1 block text-sm font-medium text-[#4a4a4a]">
          URL de avatar (opcional)
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="url"
          className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl bg-[#16803c] text-base font-semibold text-white disabled:opacity-70"
      >
        Guardar perfil
      </button>

      {formState.message ? (
        <p className={`text-sm ${formState.status === "error" ? "text-[#b91c1c]" : "text-[#115e2c]"}`}>
          {formState.message}
        </p>
      ) : null}
    </form>
  );
}
