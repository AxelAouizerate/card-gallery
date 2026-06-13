"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Connexion</h1>
        <p className="mb-4 text-sm text-slate-600">
          Pas de compte ?{" "}
          <Link href="/signup" className="font-medium text-slate-900 underline">
            Créer un compte
          </Link>
        </p>
        <form action={formAction} className="space-y-3">
          <Field name="email" label="Email" type="email" required />
          <Field name="password" label="Mot de passe" type="password" required />
          {state?.error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-3 text-center text-xs">
          <Link href="/forgot-password" className="text-slate-600 underline hover:text-slate-900">
            Mot de passe oublié ?
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  name, label, type = "text", required = false,
}: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}
