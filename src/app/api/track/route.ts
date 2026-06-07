import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/track  { sessionId, path }
// Enregistre une visite (anonyme ou loggée) dans public.page_views.
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return NextResponse.json({ ok: false, reason: "no-supabase" });

  let body: { sessionId?: string; path?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }); }
  const sessionId = String(body.sessionId || "").slice(0, 64);
  const path = String(body.path || "/").slice(0, 200);
  if (!sessionId) return NextResponse.json({ ok: false });

  const ua = (req.headers.get("user-agent") || "").slice(0, 300);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("page_views").insert({
      session_id: sessionId,
      path,
      user_id: user?.id ?? null,
      user_agent: ua,
    });
  } catch {
    return NextResponse.json({ ok: false });
  }
  return NextResponse.json({ ok: true });
}
