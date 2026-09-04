"use client";

import { useState } from "react";
import { CorpsFiltres, type OptionsFiltres } from "./FiltresCatalogue";

// Sur l'accueil, pas de sidebar permanente comme /cartes : un bouton
// "Filtrer" (entonnoir) deplie le meme panneau, qui renvoie vers /cartes
// une fois un filtre choisi. Objectif : ne pas avoir a explorer 833 cartes
// pour trouver un premier point d'entree.
export default function FiltreAccueilDepliable({ options }: { options: OptionsFiltres }) {
  const [ouvert, setOuvert] = useState(false);

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
        <div className="border-t border-amber-500/20 p-4">
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
