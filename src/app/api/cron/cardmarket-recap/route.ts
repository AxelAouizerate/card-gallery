import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifierAlerte, type Priorite } from "@/lib/cardmarket-priorite";

// GET /api/cron/cardmarket-recap
// Appele par Vercel Cron toutes les 2h (header Authorization: Bearer ${CRON_SECRET}).
// 1. Se connecte en IMAP (lecture seule) a la boite CardMarket d'Axel, sur le
//    label dedie (CARDMARKET_GMAIL_LABEL), et ne relit que les mails recus
//    depuis le dernier UID traite (cardmarket.imap_state).
// 2. Parse chaque alerte "want disponible" (vendeur/carte/prix/lien) et
//    l'enregistre dans cardmarket.wants_alerts (dedupliquee par Message-ID).
// 3. Si des alertes n'ont pas encore ete notifiees, envoie un recap par mail
//    (Resend) classe en 3 paliers de priorite, et les marque notifiees.
// Si rien de nouveau : ne fait rien (pas de mail vide toutes les 2h).

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type AlerteParsed = {
  messageId: string;
  receivedAt: Date;
  vendeur: string;
  carte: string;
  prix: number | null;
  url: string | null;
};

function parseAlerte(text: string): { vendeur: string; carte: string; prix: number | null; url: string | null } | null {
  const m = text.match(/Le vendeur\s+(.+?)\s+a la carte\s+(.+?)\s+disponible à partir de\s+([\d.,]+)\s*euros/i);
  if (!m) return null;
  const urlMatch = text.match(/(https:\/\/www\.cardmarket\.com\/\S+)/);
  const prixStr = m[3].replace(",", ".");
  return {
    vendeur: m[1].trim(),
    carte: m[2].trim(),
    prix: Number.isNaN(parseFloat(prixStr)) ? null : parseFloat(prixStr),
    url: urlMatch ? urlMatch[1].replace(/[.,]+$/, "") : null,
  };
}

async function fetchNouvellesAlertes(lastUid: number): Promise<{ alertes: AlerteParsed[]; maxUid: number }> {
  const user = process.env.CARDMARKET_GMAIL_USER;
  const pass = process.env.CARDMARKET_GMAIL_APP_PASSWORD;
  const label = process.env.CARDMARKET_GMAIL_LABEL || "CardMarket-Wants";
  if (!user || !pass) throw new Error("CARDMARKET_GMAIL_USER ou CARDMARKET_GMAIL_APP_PASSWORD manquant");

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const alertes: AlerteParsed[] = [];
  let maxUid = lastUid;

  await client.connect();
  try {
    const lock = await client.getMailboxLock(label);
    try {
      const mailbox = client.mailbox;
      if (!mailbox || typeof mailbox === "boolean") return { alertes, maxUid };

      // uidNext - 1 = plus grand UID existant. Rien de neuf si on l'a deja.
      const currentMax = (mailbox.uidNext ?? 1) - 1;
      if (currentMax <= lastUid) return { alertes, maxUid };

      const range = `${lastUid + 1}:*`;
      for await (const msg of client.fetch(range, { uid: true, source: true, envelope: true }, { uid: true })) {
        if (msg.uid > maxUid) maxUid = msg.uid;
        if (!msg.source) continue;
        const parsed = await simpleParser(msg.source);
        const body = parsed.text || "";
        const champs = parseAlerte(body);
        if (!champs) continue;
        alertes.push({
          messageId: parsed.messageId || `uid-${msg.uid}@cardmarket-recap`,
          receivedAt: parsed.date || new Date(),
          ...champs,
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => client.close());
  }

  return { alertes, maxUid };
}

const LIBELLE_PRIORITE: Record<Priorite, string> = {
  tres_grosse: "🔥 Très grosses cartes",
  grosse: "🃏 Grosses cartes",
  basse: "🔹 Reste",
};

function formatPrix(p: number | null): string {
  return p == null ? "prix ?" : `${p.toLocaleString("fr-FR")}€`;
}

function buildHtml(rows: Array<{ vendeur: string; carte: string; prix: number | null; url: string | null; priorite: Priorite }>) {
  const parOrdre: Priorite[] = ["tres_grosse", "grosse", "basse"];
  const sections = parOrdre
    .map((p) => {
      const items = rows.filter((r) => r.priorite === p).sort((a, b) => (b.prix ?? 0) - (a.prix ?? 0));
      if (!items.length) return "";
      const bold = p === "tres_grosse";
      const li = items
        .map((r) => {
          const label = `${r.carte} — ${formatPrix(r.prix)} — ${r.vendeur}`;
          const inner = r.url ? `<a href="${r.url}">${label}</a>` : label;
          return `<li style="margin-bottom:6px;">${bold ? `<b>${inner}</b>` : inner}</li>`;
        })
        .join("");
      return `<h3 style="font-size:15px;margin:20px 0 8px 0;">${LIBELLE_PRIORITE[p]} (${items.length})</h3><ul style="margin:0;padding-left:18px;">${li}</ul>`;
    })
    .join("");

  return `
    <div style="font-family:-apple-system,system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1a1a;">
      <h1 style="font-size:20px;margin:0 0 4px 0;">CardMarket — récap wants</h1>
      <p style="color:#666;margin:0 0 8px 0;">${rows.length} nouvelle(s) alerte(s) depuis le dernier récap</p>
      ${sections}
      <p style="color:#999;font-size:12px;margin-top:32px;">Généré automatiquement toutes les 2h.</p>
    </div>
  `;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  // Les tables vivent dans le schema `cardmarket` (pas `public`) : il faut
  // l'exposer via l'API dans Supabase (Project Settings > Data API >
  // Exposed schemas) sinon PostgREST renvoie une 404/erreur de schema.
  const supabase = createAdminClient().schema("cardmarket");

  const { data: state, error: stateErr } = await supabase
    .from("imap_state")
    .select("last_uid")
    .eq("id", 1)
    .single();
  if (stateErr) {
    return NextResponse.json({ ok: false, step: "read_state", error: stateErr.message }, { status: 500 });
  }

  let alertes: AlerteParsed[] = [];
  let maxUid = state.last_uid;
  try {
    const res = await fetchNouvellesAlertes(state.last_uid);
    alertes = res.alertes;
    maxUid = res.maxUid;
  } catch (e) {
    return NextResponse.json({ ok: false, step: "imap", error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }

  if (alertes.length) {
    const rows = alertes.map((a) => ({
      message_id: a.messageId,
      received_at: a.receivedAt.toISOString(),
      vendeur: a.vendeur,
      carte: a.carte,
      prix: a.prix,
      url: a.url,
      priorite: classifierAlerte(a.carte, a.url || "", a.prix),
    }));
    const { error: insertErr } = await supabase
      .from("wants_alerts")
      .upsert(rows, { onConflict: "message_id", ignoreDuplicates: true });
    if (insertErr) {
      return NextResponse.json({ ok: false, step: "insert", error: insertErr.message }, { status: 500 });
    }
  }

  if (maxUid !== state.last_uid) {
    await supabase.from("imap_state").update({ last_uid: maxUid, updated_at: new Date().toISOString() }).eq("id", 1);
  }

  const { data: aNotifier, error: selErr } = await supabase
    .from("wants_alerts")
    .select("id, vendeur, carte, prix, url, priorite")
    .is("notifie_at", null)
    .order("received_at", { ascending: true });
  if (selErr) {
    return NextResponse.json({ ok: false, step: "select_a_notifier", error: selErr.message }, { status: 500 });
  }

  if (!aNotifier || aNotifier.length === 0) {
    return NextResponse.json({ ok: true, nouvellesAlertes: alertes.length, envoye: false, raison: "rien a notifier" });
  }

  const html = buildHtml(aNotifier as Array<{ vendeur: string; carte: string; prix: number | null; url: string | null; priorite: Priorite }>);
  const nbTresGrosses = aNotifier.filter((r) => r.priorite === "tres_grosse").length;
  const subject = `CardMarket — ${aNotifier.length} want(s) dispo${nbTresGrosses ? ` (dont ${nbTresGrosses} grosse(s))` : ""}`;

  const resendKey = process.env.CARDMARKET_RESEND_API_KEY;
  const to = process.env.CARDMARKET_RECIPIENT_EMAIL;
  const from = process.env.CARDMARKET_FROM_EMAIL || "CardMarket recap <onboarding@resend.dev>";

  let sent = false;
  let sendError: string | undefined;
  if (resendKey && to) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, html }),
      });
      if (res.ok) sent = true;
      else sendError = `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300);
    } catch (e) {
      sendError = e instanceof Error ? e.message : String(e);
    }
  } else {
    sendError = "CARDMARKET_RESEND_API_KEY ou CARDMARKET_RECIPIENT_EMAIL manquant";
  }

  if (sent) {
    await supabase
      .from("wants_alerts")
      .update({ notifie_at: new Date().toISOString() })
      .in("id", aNotifier.map((r) => r.id));
  }

  return NextResponse.json({
    ok: sent,
    nouvellesAlertes: alertes.length,
    aNotifier: aNotifier.length,
    envoye: sent,
    sendError,
  });
}
