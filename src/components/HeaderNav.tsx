import Link from "next/link";
// Le header est volontairement statique : l'etat de session est charge par
// HeaderAuth cote client, sinon cookies() rendrait toutes les routes dynamiques.
import HeaderAuth from "./HeaderAuth";
import BandeauAnnonces from "./BandeauAnnonces";

export default function HeaderNav() {
  return (
    <header className="border-b border-amber-500/30 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <BandeauAnnonces />
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
        <HeaderAuth />
      </div>
    </header>
  );
}
