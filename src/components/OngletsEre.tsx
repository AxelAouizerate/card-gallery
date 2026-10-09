import Link from "next/link";
import { ERES } from "@/lib/eres";

// Barre d'onglets par ere, sous le header : navigation immediate pour qui ne
// connait pas les codes de set, sans avoir a taper un nom d'extension.
export default function OngletsEre() {
  return (
    <nav className="border-b border-amber-500/20 bg-black/30">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 text-sm">
        {ERES.map((e) => (
          <Link
            key={e.id}
            href={`/cartes/${e.id}`}
            className="whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-amber-100/70 transition hover:bg-amber-500/15 hover:text-amber-200"
          >
            {e.nom}
          </Link>
        ))}
        {/* Japonais, Scelle et Pokemon ne sont pas des eres Yu-Gi-Oh, mais
            partagent la meme barre de navigation — demandes d'Axel du
            2026-09-07, 2026-09-19 et 2026-10-09 (Japonais ajoute avant
            Scelle, qui doit aussi se demarquer des onglets ambre). Chacun a
            sa propre couleur pour bien se detacher des onglets Yu-Gi-Oh
            (ambre) au premier coup d'oeil : rouge/blanc pour Japonais
            (drapeau), emeraude pour Scelle, bleu pour Pokemon. */}
        <Link
          href="/cartes/japonaises"
          className="whitespace-nowrap rounded-md bg-rose-500/15 px-3 py-1.5 font-medium text-rose-200 transition hover:bg-rose-500/25 hover:text-rose-100"
        >
          Japonais
        </Link>
        <Link
          href="/cartes/scelle"
          className="whitespace-nowrap rounded-md bg-emerald-500/15 px-3 py-1.5 font-medium text-emerald-200 transition hover:bg-emerald-500/25 hover:text-emerald-100"
        >
          Scellé
        </Link>
        <Link
          href="/cartes/pokemon"
          className="whitespace-nowrap rounded-md bg-sky-500/15 px-3 py-1.5 font-medium text-sky-200 transition hover:bg-sky-500/25 hover:text-sky-100"
        >
          Pokémon
        </Link>
      </div>
    </nav>
  );
}
