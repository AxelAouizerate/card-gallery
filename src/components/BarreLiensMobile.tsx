"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import FavLink from "./FavLink";

type Session = { email: string | null; owner: boolean };

/**
 * Bandeau mobile avec les liens (Comment acheter, Favoris, compte...) visibles
 * directement, sous la barre d'eres - plutot que caches derriere le menu
 * hamburger. Retour utilisateur du 2026-09-08 : les visiteurs ne trouvaient
 * pas ces options assez facilement. Remplace MobileMenu (retire de
 * HeaderAuth). Duplique le fetch de session de HeaderAuth (petit cout,
 * evite de faire remonter l'etat client a travers le header serveur).
 */
export default function BarreLiensMobile() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let vivant = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { email: null, owner: false }))
      .then((s: Session) => { if (vivant) setSession(s); })
      .catch(() => { if (vivant) setSession({ email: null, owner: false }); });
    return () => { vivant = false; };
  }, []);

  const email = session?.email ?? null;
  const owner = session?.owner ?? false;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-amber-500/20 bg-black/30 px-4 py-1.5 text-sm sm:hidden">
      <Link href="/comment-acheter" className="whitespace-nowrap rounded-md px-2.5 py-1 text-amber-100 hover:bg-amber-500/10">
        Comment acheter
      </Link>
      {owner && (
        <Link href="/stats" className="whitespace-nowrap rounded-md px-2.5 py-1 font-medium text-emerald-200 hover:bg-emerald-500/10">
          📊 Tableau de bord
        </Link>
      )}
      <FavLink />
      {email ? (
        <>
          <span className="whitespace-nowrap px-2 text-xs text-amber-100/70">{email}</span>
          <form action={logout}>
            <button type="submit" className="whitespace-nowrap rounded-md px-2.5 py-1 text-amber-100 hover:bg-amber-500/10">
              Déconnexion
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/login" className="whitespace-nowrap rounded-md px-2.5 py-1 text-amber-100 hover:bg-amber-500/10">
            Connexion
          </Link>
          <Link href="/signup" className="whitespace-nowrap rounded-md border border-amber-400/60 bg-amber-500/20 px-2.5 py-1 font-medium text-amber-100 hover:bg-amber-500/30">
            Créer un compte
          </Link>
        </>
      )}
    </nav>
  );
}
