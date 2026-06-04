import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function HeaderNav() {
  // Lecture user cote serveur (best-effort : si Supabase pas configure, on tombe gracieusement)
  let userEmail: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userEmail = data.user?.email ?? null;
  } catch {
    // Supabase env vars not set yet — affiche le header en mode anonyme
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Card Gallery
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {userEmail ? (
            <>
              <span className="text-slate-600">{userEmail}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
