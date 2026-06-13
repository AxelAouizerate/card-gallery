"use server";

import { createClient } from "@/lib/supabase/server";

// Server actions appelees depuis les providers Cart/Favorites pour
// synchroniser l'etat localStorage avec Supabase quand l'utilisateur
// est connecte.

export type CardRef = {
  cardId: number;
  cardSet: string;
  cardNom?: string;
  cardPrix?: number | null;
};

async function uid() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

// ─── LIKES ──────────────────────────────────────────────────────────────
export async function addLike(c: CardRef) {
  const { supabase, userId } = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" as const };
  const { error } = await supabase.from("likes").upsert(
    { user_id: userId, card_id: c.cardId, card_set: c.cardSet, card_nom: c.cardNom ?? null },
    { onConflict: "user_id,card_id,card_set" }
  );
  return { ok: !error, reason: error?.message };
}

export async function removeLike(c: CardRef) {
  const { supabase, userId } = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" as const };
  const { error } = await supabase.from("likes")
    .delete()
    .eq("user_id", userId)
    .eq("card_id", c.cardId)
    .eq("card_set", c.cardSet);
  return { ok: !error, reason: error?.message };
}

export async function clearLikes() {
  const { supabase, userId } = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" as const };
  const { error } = await supabase.from("likes").delete().eq("user_id", userId);
  return { ok: !error, reason: error?.message };
}

export async function listLikes() {
  const { supabase, userId } = await uid();
  if (!userId) return [];
  const { data } = await supabase.from("likes")
    .select("card_id, card_set")
    .eq("user_id", userId);
  return (data ?? []).map(r => `${r.card_id}-${r.card_set}`);
}

// ─── CART ───────────────────────────────────────────────────────────────
export async function addToCart(c: CardRef) {
  const { supabase, userId } = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" as const };
  const { error } = await supabase.from("cart_items").upsert({
    user_id: userId,
    card_id: c.cardId,
    card_set: c.cardSet,
    card_nom: c.cardNom ?? null,
    card_prix: c.cardPrix ?? null,
  }, { onConflict: "user_id,card_id,card_set" });
  return { ok: !error, reason: error?.message };
}

export async function removeFromCart(c: CardRef) {
  const { supabase, userId } = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" as const };
  const { error } = await supabase.from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("card_id", c.cardId)
    .eq("card_set", c.cardSet);
  return { ok: !error, reason: error?.message };
}

export async function clearCart() {
  const { supabase, userId } = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" as const };
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
  return { ok: !error, reason: error?.message };
}

export async function listCart() {
  const { supabase, userId } = await uid();
  if (!userId) return [];
  const { data } = await supabase.from("cart_items")
    .select("card_id, card_set")
    .eq("user_id", userId);
  return (data ?? []).map(r => `${r.card_id}-${r.card_set}`);
}

// ─── PHOTO REQUEST avec contact (modal complet) ──────────────────────────
// Format : @username sur Instagram/Facebook, ou adresse email valide.
// Pas de login requis. Rate-limit 5/jour par session (cote front) + soft
// limit server : 20 demandes/jour par session_id.
type Platform = "instagram" | "facebook" | "email";

export type PhotoReqInput = CardRef & {
  contactHandle: string;
  contactPlatform: Platform;
  sessionId?: string;
};

function validateContact(p: Platform, handle: string): string | null {
  const h = handle.trim();
  if (!h) return "Contact requis.";
  if (p === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h)) return "Adresse email invalide (format attendu : nom@domaine.fr).";
  } else {
    // @username : alphanum + . _ entre 1 et 30 chars, sans @ leading
    const stripped = h.replace(/^@+/, "");
    if (!/^[A-Za-z0-9._-]{1,30}$/.test(stripped)) return "Nom d'utilisateur invalide (lettres, chiffres, . _ - uniquement).";
  }
  return null;
}

export async function requestPhotos(c: PhotoReqInput) {
  const platform = c.contactPlatform;
  const handle = (c.contactHandle || "").trim();
  const err = validateContact(platform, handle);
  if (err) return { ok: false, reason: err };

  const { supabase, userId } = await uid();
  const session = (c.sessionId || "").slice(0, 64) || null;

  // Soft rate-limit serveur : 20 demandes/jour par session_id
  if (session) {
    const since = new Date(); since.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("photo_requests")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session)
      .gte("created_at", since.toISOString());
    if ((count ?? 0) >= 20) {
      return { ok: false, reason: "Trop de demandes aujourd'hui. Reviens demain !" };
    }
  }

  const normalizedHandle = platform === "email" ? handle.toLowerCase() : handle.replace(/^@+/, "");
  const { error } = await supabase.from("photo_requests").insert({
    user_id: userId,
    card_id: c.cardId,
    card_set: c.cardSet,
    card_nom: c.cardNom ?? null,
    contact_handle: normalizedHandle,
    contact_platform: platform,
    session_id: session,
  });
  if (error) return { ok: false, reason: error.message };

  // Notification email au proprio via Resend (best-effort, on n'echoue
  // pas la demande si l'email ne part pas)
  void notifyOwnerPhotoRequest({
    cardId: c.cardId, cardSet: c.cardSet, cardNom: c.cardNom ?? null,
    contactHandle: normalizedHandle, contactPlatform: platform,
  });

  return { ok: true };
}

async function notifyOwnerPhotoRequest(p: {
  cardId: number; cardSet: string; cardNom: string | null;
  contactHandle: string; contactPlatform: Platform;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.STATS_OWNER_EMAIL || process.env.DIGEST_RECIPIENT_EMAIL;
  if (!resendKey || !to) return;
  const from = process.env.DIGEST_FROM_EMAIL || "horuscards <onboarding@resend.dev>";
  const cardLabel = p.cardNom || `${p.cardSet} #${p.cardId}`;
  const platformLabel = p.contactPlatform === "email" ? "Email"
    : p.contactPlatform === "instagram" ? "Instagram" : "Facebook";
  const contactDisplay = p.contactPlatform === "email" ? p.contactHandle : `@${p.contactHandle}`;
  const subject = `📸 Demande de photos : ${cardLabel}`;
  const html = `
    <div style="font-family:-apple-system,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="margin:0 0 12px 0;font-size:18px">Nouvelle demande de photos</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 0;color:#666">Carte</td><td style="padding:6px 0"><b>${cardLabel}</b></td></tr>
        <tr><td style="padding:6px 0;color:#666">Set</td><td style="padding:6px 0">${p.cardSet} (#${p.cardId})</td></tr>
        <tr><td style="padding:6px 0;color:#666">Plateforme</td><td style="padding:6px 0"><b>${platformLabel}</b></td></tr>
        <tr><td style="padding:6px 0;color:#666">Contact</td><td style="padding:6px 0"><b>${contactDisplay}</b></td></tr>
      </table>
    </div>
  `;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch { /* swallow */ }
}
