"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import FavLink from "./FavLink";
import MobileMenu from "./MobileMenu";

type Session = { email: string | null; owner: boolean };

/**
 * Ilot client du header. Le reste de l'en-tete est statique : lire les cookies
 * pendant le rendu serveur rendrait toutes les routes dynamiques et
 * empecherait l'ISR sur les fiches produit.
 * Tant que la session n'est pas connue, on reserve la place (pas de saut de
 * mise en page) et on affiche les liens anonymes, majoritaires.
 */
export default function HeaderAuth() {
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
    <>
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
        {email ? (
          <>
            <span className="text-amber-100/80">{email}</span>
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

      <MobileMenu userEmail={email} owner={owner} />
    </>
  );
}
