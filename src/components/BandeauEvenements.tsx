"use client";

import { useState } from "react";
import Image from "next/image";
import { EVENEMENTS, type Evenement } from "@/lib/evenements";

// Banderole "a la une" de l'accueil : receptions et lives a venir. Navigation
// manuelle (fleches + points), glissement horizontal droite -> gauche au
// clic — pas de defilement automatique. Une seule annonce -> pas de fleches
// (rien a naviguer).
export default function BandeauEvenements() {
  const [index, setIndex] = useState(0);
  if (EVENEMENTS.length === 0) return null;

  const plusieurs = EVENEMENTS.length > 1;
  const suivant = () => setIndex((i) => (i + 1) % EVENEMENTS.length);
  const precedent = () => setIndex((i) => (i - 1 + EVENEMENTS.length) % EVENEMENTS.length);

  return (
    <section className="relative overflow-hidden rounded-lg border border-amber-500/25 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900">
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {EVENEMENTS.map((e, i) => (
          <div key={i} className="w-full shrink-0">
            <Slide evenement={e} />
          </div>
        ))}
      </div>

      {plusieurs && (
        <>
          <button
            type="button"
            onClick={precedent}
            aria-label="Annonce précédente"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-amber-100 backdrop-blur transition hover:bg-black/60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            onClick={suivant}
            aria-label="Annonce suivante"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-amber-100 backdrop-blur transition hover:bg-black/60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {EVENEMENTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Annonce ${i + 1}`}
                className={"h-1.5 w-1.5 rounded-full transition " + (i === index ? "bg-amber-300" : "bg-amber-100/30")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Slide({ evenement }: { evenement: Evenement }) {
  if (evenement.type === "reception") {
    return (
      <div className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between sm:p-6">
        <div className="text-center sm:text-left">
          <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
            {evenement.recue ? "Nouvelle réception" : "Réception à venir"}
          </span>
          <h2
            className="mt-2 text-xl font-bold text-amber-100 sm:text-2xl"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {evenement.titre}
          </h2>
          <p className="mt-1 text-sm text-amber-100/70">{evenement.date}</p>
          {evenement.logoGradeur && (
            <div className="relative mt-3 h-7 w-28">
              <Image src={evenement.logoGradeur} alt="Gradeur" fill className="object-contain object-left invert" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {evenement.photos.map((src, i) => (
            <div key={i} className="relative h-28 w-20 overflow-hidden rounded-md border border-amber-500/20 shadow-lg sm:h-32 sm:w-24">
              <Image src={src} alt="" fill sizes="100px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <a
      href={evenement.lien}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-4 p-5 transition hover:bg-white/5 sm:p-6"
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-red-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          Live {evenement.plateforme}
        </span>
        <h2
          className="mt-2 text-xl font-bold text-amber-100 sm:text-2xl"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          {evenement.titre}
        </h2>
        <p className="mt-1 text-sm text-amber-100/70">{evenement.date}</p>
      </div>
      <span className="whitespace-nowrap rounded-md bg-amber-500/90 px-4 py-2 text-sm font-semibold text-black">
        Voir le live →
      </span>
    </a>
  );
}
