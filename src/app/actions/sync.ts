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

// ─── PHOTO REQUEST (rate-limit 5/jour) ──────────────────────────────────
export async function requestPhotos(c: CardRef) {
  const { supabase, userId } = await uid();
  if (!userId) return { ok: false, reason: "not-authenticated" as const };

  // Compte les demandes du jour pour ce user
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("photo_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());
  if ((count ?? 0) >= 5) {
    return { ok: false, reason: "rate-limited" as const };
  }
  const { error } = await supabase.from("photo_requests").insert({
    user_id: userId,
    card_id: c.cardId,
    card_set: c.cardSet,
    card_nom: c.cardNom ?? null,
  });
  return { ok: !error, reason: error?.message };
}
