import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /auth/callback?code=PKCE_CODE&next=/reset-password
// Endpoint d'echange PKCE pour les flux Supabase (reset password, signup
// confirm, magic link, oauth). Echange le code contre une session cookie,
// puis redirige vers `next` (defaut /).

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const reason = encodeURIComponent(error.message);
      return NextResponse.redirect(`${origin}/login?error=${reason}`);
    }
  } catch (e) {
    const reason = encodeURIComponent(e instanceof Error ? e.message : "auth_error");
    return NextResponse.redirect(`${origin}/login?error=${reason}`);
  }

  // Whitelist du parametre `next` pour eviter open redirect
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
