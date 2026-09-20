"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CorpsFiltres, useFiltres, type OptionsFiltres } from "./FiltresCatalogue";

// Sur l'accueil, pas de sidebar permanente comme /cartes : un bouton
// "Filtrer" (entonnoir) deplie le meme panneau, qui renvoie vers /cartes
// une fois un filtre choisi. Objectif : ne pas avoir a explorer 833 cartes
// pour trouver un premier point d'entree.
export default function FiltreAccueilDepliable({ options }: { options: OptionsFiltres }) {
  const [ouvert, setOuvert] = useState(false);
  // Recherche par nom : le seul controle absent de CorpsFiltres (partage avec
  // /cartes, ou il vit deja dans BarreFiltres) - demande d'Axel du 2026-09-20.
  const { f, naviguer } = useFiltres("/cartes");

  return (
    <section className="rounded-lg border border-amber-500/20 bg-black/30">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-amber-200">
          <IconeEntonnoir />
          Filtrer le catalogue
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={"text-amber-300 transition-transform " + (ouvert ? "rotate-180" : "")}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {ouvert && (
        <div className="space-y-4 border-t border-amber-500/20 p-4">
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              naviguer({ ...f, q: String(new FormData(e.currentTarget).get("q") ?? "") });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-100/40" />
            <input
              name="q"
              defaultValue={f.q}
              placeholder="Rechercher une carte…"
              className="w-full rounded-md border border-amber-500/30 bg-black/50 py-2 pl-9 pr-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-400 focus:outline-none"
            />
          </form>
          <CorpsFiltres options={options} base="/cartes" />
        </div>
      )}
    </section>
  );
}

function IconeEntonnoir() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="4 4 20 4 14 12.5 14 19 10 21 10 12.5 4 4" />
    </svg>
  );
}
