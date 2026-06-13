"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword, type ResetState } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

// Page d'arrivee depuis l'email Supabase. Supabase a deja pose un cookie
// de session via le lien magique ; on demande juste le nouveau mot de passe.

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(updatePassword, {});
  const [authChecking, setAuthChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  // Verifie qu'on a bien une session active (l'utilisateur vient de cliquer
  // sur le lien email). Si pas de session : on renvoie vers /forgot-password.
  useEffect(() => {
    let supabase;
    try { supabase = createClient(); } catch {
      setAuthChecking(false); return;
    }
    // Supabase v2 : le hash type=recovery est traite automatiquement par
    // detectSessionInUrl (defaut), il pose les cookies puis on peut lire la
    // session normalement. On attend un cycle pour laisser ce traitement.
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getUser();
      setHasSession(!!data.user);
      setAuthChecking(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Vérification du lien…</p>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-semibold text-slate-900">Lien expiré</h1>
          <p className="mb-4 text-sm text-slate-600">
            Le lien de réinitialisation est invalide ou a expiré (limite 1h).
            Demande-en un nouveau.
          </p>
          <Link
            href="/forgot-password"
            className="block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Nouveau mot de passe</h1>
        <p className="mb-4 text-sm text-slate-600">
          Choisis ton nouveau mot de passe (6 caractères minimum).
        </p>
        <form action={formAction} className="space-y-3">
          <Field name="password" label="Nouveau mot de passe" type="password" />
          <Field name="confirm" label="Confirmer" type="password" />
          {state?.error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Mise à jour…" : "Définir le mot de passe"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete="new-password"
        minLength={6}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}
