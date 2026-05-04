import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type OtpType = "email" | "recovery" | "invite" | "email_change";

function isOtpType(value: string | null): value is OtpType {
  return value === "email" || value === "recovery" || value === "invite" || value === "email_change";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextPath = requestUrl.searchParams.get("next") ?? "/supabase-smoke";
  const safeNextPath = nextPath.startsWith("/") ? nextPath : "/supabase-smoke";
  const successRedirectUrl = new URL(safeNextPath, requestUrl.origin);

  if (!tokenHash || !isOtpType(type)) {
    return NextResponse.redirect(new URL("/login?error=otp_params", requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(new URL("/login?error=otp_verify", requestUrl.origin));
  }

  return NextResponse.redirect(successRedirectUrl);
}
