import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") ?? "/supabase-smoke";
  const safeNextPath = nextPath.startsWith("/") ? nextPath : "/supabase-smoke";
  const redirectUrl = new URL(safeNextPath, requestUrl.origin);

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback", requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth_exchange", requestUrl.origin));
  }

  return NextResponse.redirect(redirectUrl);
}
