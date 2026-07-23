import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { isOwnerEmail } from "@/lib/site";
import FavLink from "./FavLink";
import MobileMenu from "./MobileMenu";

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
  const owner = isOwnerEmail(userEmail);

  return (
    <header className="border-b border-amber-500/30 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/horus-logo.png"
            alt="Horus"
            className="h-10 w-10 rounded-full ring-2 ring-amber-400/60 transition group-hover:ring-amber-300"
          />
          <span
            className="text-3xl font-black uppercase tracking-[0.2em] text-amber-300 sm:text-4xl"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              textShadow:
                "0 2px 0 #000, 0 0 12px rgba(212,175,55,0.5), 0 0 2px rgba(0,0,0,1)",
            }}
          >
            horuscards
          </span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 text-sm sm:flex">
          <Link
            href="/comment-acheter"
            className="rounded-md px-3 py-1.5 text-amber-100 hover:bg-amber-500/10"
          >
            Comment acheter
          </Link>
          {owner && (
            <Link
              href="/stats"
              className="rounded-md px-3 py-1.5 font-medium text-emerald-200 hover:bg-emerald-500/10"
            >
              📊 Tableau de bord
            </Link>
          )}
          <FavLink />
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

        {/* Mobile : burger + drawer */}
        <MobileMenu userEmail={userEmail} owner={owner} />
      </div>
    </header>
  );
}
