import Link from "next/link";
// Le header est volontairement statique : l'etat de session est charge par
// HeaderAuth cote client, sinon cookies() rendrait toutes les routes dynamiques.
import HeaderAuth from "./HeaderAuth";
import BandeauAnnonces from "./BandeauAnnonces";
import OngletsEre from "./OngletsEre";
import LogoHorus from "./LogoHorus";

export default function HeaderNav() {
  return (
    <header className="border-b border-amber-500/30 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <BandeauAnnonces />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <LogoHorus className="h-10 w-10 text-amber-300 transition group-hover:text-amber-200" />
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
        <HeaderAuth />
      </div>
      <OngletsEre />
    </header>
  );
}
