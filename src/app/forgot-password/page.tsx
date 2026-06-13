"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(requestPasswordReset, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Mot de passe oublié</h1>
        <p className="mb-4 text-sm text-slate-600">
          Renseigne ton email, on t&apos;envoie un lien pour réinitialiser ton mot de passe.
        </p>

        {state?.ok ? (
          <div className="space-y-3">
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              ✓ Email envoyé. Clique sur le lien dans l&apos;email reçu pour choisir un nouveau mot de passe.
              <p className="mt-2 text-xs text-emerald-700">
                (Vérifie aussi tes spams. Le lien expire après 1h.)
              </p>
            </div>
            <Link
              href="/login"
              className="block rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <form action={formAction} className="space-y-3">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
              {state?.error && (
                <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
            <p className="mt-3 text-center text-xs">
              <Link href="/login" className="text-slate-600 underline hover:text-slate-900">
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
