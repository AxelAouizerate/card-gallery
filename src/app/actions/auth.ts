"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; needsConfirmation?: boolean };

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email et mot de passe requis." };
  if (password.length < 6) return { error: "Mot de passe trop court (min 6 caractères)." };

  const supabase = await createClient();
  // emailRedirectTo : le lien de confirmation doit passer par /auth/callback
  // (echange PKCE -> session cookie), sinon le clic ne connecte pas. L'URL doit
  // etre whitelistee dans Supabase > Authentication > URL Configuration.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/` },
  });
  if (error) return { error: error.message };

  // Email deja enregistre : Supabase renvoie un user avec identities vide
  // (pour ne pas divulguer l'existence du compte). On oriente l'utilisateur.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe." };
  }

  // Confirmation d'email activee : pas de session tant que le lien n'est pas
  // clique. On affiche "verifiez vos emails" au lieu de faire comme si c'etait bon.
  if (!data.session) {
    return { needsConfirmation: true };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email et mot de passe requis." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Mot de passe oublie ──────────────────────────────────────────────────
// Envoie un email de reinitialisation. L'URL de redirection doit etre
// whitelistee dans Supabase Dashboard > Authentication > URL Configuration.
export type ResetState = { error?: string; ok?: boolean };

function siteUrl(): string {
  // Hardcode prod domain. NE PAS utiliser VERCEL_URL : il pointe vers
  // l'URL de deploiement Vercel (card-gallery-xxx.vercel.app) au lieu du
  // domaine custom, ce qui cassait le lien de reset.
  const u = process.env.NEXT_PUBLIC_SITE_URL || "https://horuscards.fr";
  return u.replace(/^(?!https?:)/, "https://").replace(/\/$/, "");
}

export async function requestPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Email requis." };
  const supabase = await createClient();
  // On passe par /auth/callback (qui fait l'echange PKCE -> cookie session)
  // puis redirige vers /reset-password. Sans le callback, la session
  // n'est pas etablie cote serveur et updateUser echoue.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updatePassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 6) return { error: "Mot de passe trop court (min 6 caractères)." };
  if (password !== confirm) return { error: "Les deux mots de passe ne correspondent pas." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/?pwd_reset=1");
}
