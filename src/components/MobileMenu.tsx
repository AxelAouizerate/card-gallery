"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import FavLink from "./FavLink";

export default function MobileMenu({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Ferme le menu quand on change de page
  useEffect(() => { setOpen(false); }, [pathname]);

  // Bloque le scroll body quand ouvert
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-amber-200 hover:bg-amber-500/10 sm:hidden"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm sm:hidden"
          />
          <nav
            className="fixed right-0 top-0 z-50 h-full w-[78%] max-w-xs overflow-y-auto border-l border-amber-500/30 bg-[#0e0a18] p-5 shadow-2xl sm:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-center justify-between">
              <span
                className="text-2xl uppercase tracking-[0.18em] text-amber-300"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-amber-200 hover:bg-amber-500/10"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <ul className="space-y-1.5 text-base">
              <li>
                <Link href="/" className="block rounded-md px-3 py-2.5 text-amber-100 hover:bg-amber-500/10">
                  Galerie
                </Link>
              </li>
              <li>
                <Link href="/comment-acheter" className="block rounded-md px-3 py-2.5 text-amber-100 hover:bg-amber-500/10">
                  Comment acheter
                </Link>
              </li>
              <li className="px-3 py-1"><FavLink /></li>
            </ul>

            <hr className="my-5 border-amber-500/20" />

            {userEmail ? (
              <>
                <p className="px-3 text-xs text-amber-100/70">Connecté</p>
                <p className="px-3 pb-3 text-sm font-medium text-amber-100 break-all">{userEmail}</p>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full rounded-md border border-amber-500/40 px-3 py-2.5 text-sm text-amber-100 hover:bg-amber-500/10"
                  >
                    Déconnexion
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-md border border-amber-500/40 px-3 py-2.5 text-center text-sm text-amber-100 hover:bg-amber-500/10"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md border border-amber-400/60 bg-amber-500/20 px-3 py-2.5 text-center text-sm font-medium text-amber-100 hover:bg-amber-500/30"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </nav>
        </>
      )}
    </>
  );
}
