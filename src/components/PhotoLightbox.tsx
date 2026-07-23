"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type Shot = { src: string; label: string };

// Visionneuse plein écran : affiche une photo (recto/verso), navigation entre
// les photos, et zoom au clic (transform-origin suit le pointeur -> pan au
// glissement, y compris tactile). Rendue via portail sur document.body pour
// passer au-dessus de la fiche carte.
export default function PhotoLightbox({
  shots, index, onIndex, onClose,
}: {
  shots: Shot[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  useEffect(() => setMounted(true), []);
  // Reset du zoom quand on change de photo
  useEffect(() => { setZoom(false); setOrigin("50% 50%"); }, [index]);

  const many = shots.length > 1;
  const prev = useCallback(
    () => onIndex((index - 1 + shots.length) % shots.length),
    [index, shots.length, onIndex],
  );
  const next = useCallback(
    () => onIndex((index + 1) % shots.length),
    [index, shots.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && many) prev();
      else if (e.key === "ArrowRight" && many) next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next, many]);

  if (!mounted) return null;
  const shot = shots[index];
  if (!shot) return null;

  const originFrom = (e: React.MouseEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    return `${x}% ${y}%`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 select-none"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      {/* Fermer */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur hover:bg-white/20"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Précédent / Suivant */}
      {many && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Photo précédente"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur hover:bg-white/20"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Photo suivante"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur hover:bg-white/20"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shot.src}
        alt={shot.label}
        draggable={false}
        onClick={(e) => { e.stopPropagation(); setOrigin(originFrom(e)); setZoom((z) => !z); }}
        onPointerMove={(e) => { if (zoom) setOrigin(originFrom(e)); }}
        className="max-h-[92vh] max-w-[94vw] touch-none object-contain transition-transform duration-150 ease-out"
        style={{
          transform: zoom ? "scale(2.6)" : "scale(1)",
          transformOrigin: origin,
          cursor: zoom ? "zoom-out" : "zoom-in",
        }}
      />

      {/* Légende + compteur + astuce */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-center text-xs font-medium text-white/90">
        {shot.label}{many ? ` · ${index + 1}/${shots.length}` : ""}
        <span className="ml-2 opacity-60">{zoom ? "cliquer pour dézoomer" : "cliquer pour zoomer"}</span>
      </div>
    </div>,
    document.body,
  );
}
