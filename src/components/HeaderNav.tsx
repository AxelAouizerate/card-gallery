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
    <header className="border-b border-amber-500/30 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-wider text-amber-300"
          style={{ textShadow: "0 1px 0 #000, 0 0 8px rgba(212,175,55,0.35)" }}
        >
          Card Gallery
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {userEmail ? (
            <>
              <span className="text-amber-100/80">{userEmail}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-amber-100 hover:bg-amber-500/10"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-amber-100 hover:bg-amber-500/10"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-amber-400/60 bg-amber-500/20 px-3 py-1.5 font-medium text-amber-100 hover:bg-amber-500/30"
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
