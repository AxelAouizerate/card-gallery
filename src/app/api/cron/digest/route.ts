import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/cron/digest
// Appele par Vercel Cron (header Authorization: Bearer ${CRON_SECRET}).
// Agrege la veille (J-1 00:00 → J 00:00 Europe/Paris) et envoie un mail.

export const dynamic = "force-dynamic";

function parisDayBounds(now = new Date()) {
  // Approximatif : on prend 00h00 UTC de la veille → aujourd'hui 00h00 UTC.
  // C'est legerement decale par rapport a Paris mais suffisant pour un digest.
  const end = new Date(now); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

type Row = { card_id: number; card_set: string; card_nom: string | null };

function topCards(rows: Row[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, { name: string; count: number }>();
  for (const r of rows) {
    const key = `${r.card_id}-${r.card_set}`;
    const name = r.card_nom || `${r.card_set} #${r.card_id}`;
    const existing = counts.get(key);
    if (existing) existing.count++;
    else counts.set(key, { name, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { start, end } = parisDayBounds();

  // ─── Visites ────────────────────────────────────────────────────────
  const { data: views, count: viewsCount } = await supabase
    .from("page_views")
    .select("session_id, path", { count: "exact" })
    .gte("created_at", start)
    .lt("created_at", end);
  const uniqueSessions = new Set((views ?? []).map(v => v.session_id)).size;
  const topPaths = (() => {
    const m = new Map<string, number>();
    (views ?? []).forEach(v => m.set(v.path, (m.get(v.path) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  // ─── Likes ─────────────────────────────────────────────────────────
  const { data: likes, count: likesCount } = await supabase
    .from("likes")
    .select("card_id, card_set, card_nom", { count: "exact" })
    .gte("created_at", start)
    .lt("created_at", end);
  const topLikes = topCards((likes ?? []) as Row[]);

  // ─── Cart ──────────────────────────────────────────────────────────
  const { data: carts, count: cartCount } = await supabase
    .from("cart_items")
    .select("card_id, card_set, card_nom", { count: "exact" })
    .gte("created_at", start)
    .lt("created_at", end);
  const topCart = topCards((carts ?? []) as Row[]);

  // ─── Photo requests ────────────────────────────────────────────────
  const { data: photoReqs, count: photoCount } = await supabase
    .from("photo_requests")
    .select("card_id, card_set, card_nom", { count: "exact" })
    .gte("created_at", start)
    .lt("created_at", end);
  const topPhoto = topCards((photoReqs ?? []) as Row[]);

  const dateStr = new Date(start).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h1 style="font-size: 22px; margin: 0 0 4px 0;">horuscards — digest du ${dateStr}</h1>
      <p style="color: #666; margin: 0 0 24px 0;">Activite des dernieres 24h sur horuscards.fr</p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Visites</b></td><td align="right" style="padding: 8px 0; border-bottom: 1px solid #eee;">${viewsCount ?? 0} (${uniqueSessions} uniques)</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Likes</b></td><td align="right" style="padding: 8px 0; border-bottom: 1px solid #eee;">${likesCount ?? 0}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Paniers</b></td><td align="right" style="padding: 8px 0; border-bottom: 1px solid #eee;">${cartCount ?? 0}</td></tr>
        <tr><td style="padding: 8px 0;"><b>Demandes de photos</b></td><td align="right" style="padding: 8px 0;">${photoCount ?? 0}</td></tr>
      </table>

      ${topLikes.length ? `<h3 style="font-size: 14px; margin: 0 0 8px 0;">Top cartes likees</h3><ul style="margin: 0 0 24px 0; padding-left: 18px;">${topLikes.map(t => `<li>${t.name} (${t.count})</li>`).join("")}</ul>` : ""}
      ${topCart.length ? `<h3 style="font-size: 14px; margin: 0 0 8px 0;">Top cartes ajoutees au panier</h3><ul style="margin: 0 0 24px 0; padding-left: 18px;">${topCart.map(t => `<li>${t.name} (${t.count})</li>`).join("")}</ul>` : ""}
      ${topPhoto.length ? `<h3 style="font-size: 14px; margin: 0 0 8px 0;">Demandes de photos</h3><ul style="margin: 0 0 24px 0; padding-left: 18px;">${topPhoto.map(t => `<li>${t.name} (${t.count})</li>`).join("")}</ul>` : ""}
      ${topPaths.length ? `<h3 style="font-size: 14px; margin: 0 0 8px 0;">Pages les plus vues</h3><ul style="margin: 0 0 24px 0; padding-left: 18px;">${topPaths.map(([p, n]) => `<li><code>${p}</code> (${n})</li>`).join("")}</ul>` : ""}

      <p style="color: #999; font-size: 12px; margin-top: 32px;">Genere automatiquement par horuscards.fr</p>
    </div>
  `;

  const subject = `horuscards — ${viewsCount ?? 0} visites, ${likesCount ?? 0} likes, ${cartCount ?? 0} paniers (${dateStr})`;

  // ─── Envoi via Resend ──────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.DIGEST_RECIPIENT_EMAIL;
  const from = process.env.DIGEST_FROM_EMAIL || "horuscards <onboarding@resend.dev>";

  let sent = false;
  let sendError: string | undefined;
  if (resendKey && to) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html }),
      });
      if (res.ok) sent = true;
      else sendError = `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300);
    } catch (e) {
      sendError = e instanceof Error ? e.message : String(e);
    }
  } else {
    sendError = "RESEND_API_KEY ou DIGEST_RECIPIENT_EMAIL manquant";
  }

  return NextResponse.json({
    ok: sent,
    range: { start, end },
    counts: { views: viewsCount, uniqueSessions, likes: likesCount, cart: cartCount, photoReqs: photoCount },
    sent,
    sendError,
  });
}
