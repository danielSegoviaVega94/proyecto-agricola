"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthTab = "phone" | "google";

const chilePrefix = "+56";

export default function LoginPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [tab, setTab] = useState<AuthTab>("phone");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback?next=/supabase-smoke`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setErrorMessage("No fue posible iniciar sesión con Google.");
      setIsLoading(false);
    }
  }

  async function handlePhoneOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsLoading(true);

    const sanitizedPhone = phone.replace(/\s+/g, "");
    const fullPhone = `${chilePrefix}${sanitizedPhone}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) {
      setErrorMessage("No pudimos enviar el código SMS. Revisa tu número.");
      setIsLoading(false);
      return;
    }

    setStatusMessage("Código enviado por SMS.");
    setIsLoading(false);
  }

  async function handleVerifySmsCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsLoading(true);

    const sanitizedPhone = phone.replace(/\s+/g, "");
    const fullPhone = `${chilePrefix}${sanitizedPhone}`;

    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: smsCode,
      type: "sms",
    });

    if (error) {
      setErrorMessage("El código ingresado no es válido.");
      setIsLoading(false);
      return;
    }

    window.location.href = "/supabase-smoke";
  }

  async function handleEmailFallback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsLoading(true);

    const emailRedirectTo = `${window.location.origin}/auth/confirm?next=/supabase-smoke`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      setErrorMessage("No pudimos enviar el enlace por email.");
      setIsLoading(false);
      return;
    }

    setStatusMessage("Revisa tu correo para continuar.");
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <main className="mx-auto min-h-screen w-full max-w-[420px] bg-white px-4 pb-10 pt-6">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="rounded-lg px-2 py-1 text-sm text-[#4a4a4a] hover:bg-[#f0eee8]">
            Volver
          </Link>
          <h1 className="text-lg font-semibold text-[#0f0f0f]">Entrar</h1>
          <span className="w-12" />
        </header>

        <section className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0f0f0f]">Bienvenido</h2>
          <p className="mt-2 text-base text-[#4a4a4a]">Entra a Tierra para comprar o vender.</p>
        </section>

        <div
          role="tablist"
          aria-label="Métodos de acceso"
          className="mb-6 grid grid-cols-2 rounded-xl bg-[#f0eee8] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "phone"}
            onClick={() => setTab("phone")}
            className={`h-11 rounded-lg text-sm font-semibold ${
              tab === "phone" ? "bg-white text-[#0f0f0f]" : "text-[#8a8a8a]"
            }`}
          >
            Teléfono
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "google"}
            onClick={() => setTab("google")}
            className={`h-11 rounded-lg text-sm font-semibold ${
              tab === "google" ? "bg-white text-[#0f0f0f]" : "text-[#8a8a8a]"
            }`}
          >
            Google
          </button>
        </div>

        {tab === "phone" ? (
          <div className="space-y-4">
            <form onSubmit={handlePhoneOtp} className="space-y-3">
              <label htmlFor="phone" className="block text-sm font-medium text-[#4a4a4a]">
                Tu número de celular
              </label>
              <div className="flex gap-2">
                <span className="inline-flex h-12 items-center rounded-xl border border-[#e8e6e0] px-3 text-base">
                  {chilePrefix}
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="9 1234 5678"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
                  required
                />
              </div>
              <p className="text-xs text-[#8a8a8a]">Te enviamos un código por SMS.</p>
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-[#16803c] text-base font-semibold text-white disabled:opacity-70"
              >
                Enviar código
              </button>
            </form>

            <form onSubmit={handleVerifySmsCode} className="space-y-3">
              <label htmlFor="smsCode" className="block text-sm font-medium text-[#4a4a4a]">
                Código SMS
              </label>
              <input
                id="smsCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={smsCode}
                onChange={(event) => setSmsCode(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl border border-[#e8e6e0] bg-white text-base font-semibold text-[#0f0f0f] disabled:opacity-70"
              >
                Verificar código
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowEmailFallback((current) => !current)}
              className="w-full text-sm font-medium text-[#16803c] underline"
            >
              Usar email de prueba
            </button>

            {showEmailFallback ? (
              <form onSubmit={handleEmailFallback} className="space-y-3">
                <label htmlFor="email-fallback" className="block text-sm font-medium text-[#4a4a4a]">
                  Email para prueba
                </label>
                <input
                  id="email-fallback"
                  type="email"
                  placeholder="comprador@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border border-[#e8e6e0] bg-white text-base font-semibold text-[#0f0f0f] disabled:opacity-70"
                >
                  Enviar enlace por email
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="h-12 w-full rounded-xl border border-[#e8e6e0] bg-white text-base font-semibold text-[#0f0f0f] disabled:opacity-70"
            >
              Continuar con Google
            </button>
          </div>
        )}

        {statusMessage ? <p className="mt-4 text-sm text-[#115e2c]">{statusMessage}</p> : null}
        {errorMessage ? <p className="mt-4 text-sm text-[#b91c1c]">{errorMessage}</p> : null}
      </main>
    </div>
  );
}
