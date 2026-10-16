"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function readNextParam(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  const raw = new URLSearchParams(window.location.search).get("next");
  if (raw && raw.startsWith("/")) {
    return raw;
  }

  return "/";
}

function describeOAuthError(message: string | undefined): string {
  if (!message) {
    return "No fue posible iniciar sesión con Google.";
  }

  const lower = message.toLowerCase();
  if (lower.includes("provider is not enabled") || lower.includes("validation_failed")) {
    return "Google aún no está habilitado en este proyecto. Avisa al administrador para activarlo en Supabase.";
  }

  return "No fue posible iniciar sesión con Google. Intenta nuevamente en unos minutos.";
}

export default function LoginPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setErrorMessage(null);
    setIsLoading(true);

    const nextPath = readNextParam();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setErrorMessage(describeOAuthError(error.message));
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-10 pt-6 md:max-w-md md:rounded-2xl md:shadow-sm">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="rounded-lg px-2 py-1 text-sm text-[#4a4a4a] hover:bg-[#f0eee8]">
            Volver
          </Link>
          <h1 className="text-lg font-semibold text-[#0f0f0f]">Entrar</h1>
          <span className="w-12" />
        </header>

        <section className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0f0f0f]">Bienvenido</h2>
          <p className="mt-2 text-base text-[#4a4a4a]">
            Entra con tu cuenta de Google para comprar o vender en Tierra.
          </p>
        </section>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e8e6e0] bg-white text-base font-semibold text-[#0f0f0f] shadow-sm transition hover:bg-[#fafaf7] disabled:opacity-70"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#EA4335"
              d="M12 11.5v3.27h4.61c-.2 1.21-1.4 3.55-4.61 3.55-2.77 0-5.04-2.29-5.04-5.12s2.27-5.12 5.04-5.12c1.58 0 2.64.67 3.25 1.25l2.22-2.14C16.06 5.86 14.21 5 12 5 7.86 5 4.5 8.36 4.5 12.5S7.86 20 12 20c6.93 0 7.5-6.46 6.86-9.5H12z"
            />
            <path
              fill="#4285F4"
              d="M21.5 12.23c0-.71-.06-1.4-.18-2.05H12v3.86h5.34c-.23 1.21-.93 2.24-1.99 2.93l3.21 2.49c1.88-1.74 2.94-4.3 2.94-7.23z"
            />
            <path
              fill="#FBBC05"
              d="M5.5 14.07A7.49 7.49 0 0 1 5.1 12c0-.72.13-1.42.36-2.07L2.18 7.36A11.49 11.49 0 0 0 .5 12c0 1.85.45 3.6 1.24 5.13l3.76-3.06z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.96-1.07 7.94-2.91l-3.78-2.93c-1.05.71-2.43 1.13-4.16 1.13-3.2 0-5.91-2.16-6.88-5.06L1.36 16.3C3.31 20.27 7.31 23 12 23z"
            />
          </svg>
          {isLoading ? "Conectando…" : "Continuar con Google"}
        </button>

        <p className="mt-4 text-center text-xs text-[#8a8a8a]">
          Solo usamos tu cuenta para identificarte. Nunca publicamos en tu nombre.
        </p>

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-[#f2d5d5] bg-[#fff1f1] px-3 py-2 text-sm text-[#b91c1c]">
            {errorMessage}
          </p>
        ) : null}
      </main>
    </div>
  );
}
