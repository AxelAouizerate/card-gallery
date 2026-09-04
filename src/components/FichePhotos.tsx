"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoLightbox, { type Shot } from "./PhotoLightbox";

// Bloc photos de la fiche produit /carte/[slug] : zoomable au clic, comme la
// popup rapide de la grille (CardModal). Isole en composant client pour ne
// pas rendre toute FicheCarte "use client" et casser son rendu serveur/SEO.
export default function FichePhotos({
  photos, nom, bientot,
}: {
  photos: string[];
  nom: string;
  bientot: boolean;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const shots: Shot[] = photos.map((src, i) => ({ src, label: i === 0 ? "Recto" : "Verso" }));

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-900/60 text-center">
        <span className="px-4 font-mono text-xs uppercase tracking-widest text-amber-100/60">
          {bientot ? "Bientôt en boutique" : "Photos sur demande"}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className={"grid gap-3 " + (photos.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightbox(i)}
            aria-label={`Agrandir la photo ${i === 0 ? "recto" : "verso"}`}
            className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-lg bg-slate-900"
          >
            <Image
              src={src}
              alt={`${nom} — ${i === 0 ? "recto" : "verso"}`}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 50vw, 320px"
              className="object-contain"
            />
            <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">
              {i === 0 ? "Recto" : "Verso"}
            </span>
            <span className="pointer-events-none absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Zoom
            </span>
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <PhotoLightbox
          shots={shots}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
