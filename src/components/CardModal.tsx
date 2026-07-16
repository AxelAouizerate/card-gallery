"use client";

import { useEffect, useState } from "react";
import type { Card } from "@/lib/cards";
import RequestPhotosModal from "./RequestPhotosModal";
import { useFavorites } from "@/lib/favorites";
import { sellerInstagramUrl, sellerVintedUrl } from "@/lib/site";

// Libelles fins (affiches sur les cartes) — "joué" remplace par "played"
export const ETAT_LABELS: Record<string, string> = {
  "MINT": "Mint",
  "MINT+": "Mint+",
  "GEM MINT": "Gem Mint",
  "NM": "Near Mint",
  "NM+": "Near Mint+",
  "NM-": "Near Mint-",
  "EX": "Excellent",
  "EX+": "Excellent+",
  "EX-": "Excellent-",
  "EXC": "Excellent",
  "EXC+": "Excellent+",
  "EXC-": "Excellent-",
  "LP": "Légèrement played",
  "LP+": "Légèrement played+",
  "LP-": "Légèrement played-",
  "GOOD": "Bon",
  "GOOD+": "Bon+",
  "GOOD-": "Bon-",
  "PL": "Played",
  "PL+": "Played+",
  "PL-": "Played-",
  "POOR": "Très played",
};

export default function CardModal({ card, onClose }: { card: Card; onClose: () => void }) {
  // Echap pour fermer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-4xl gap-4 overflow-y-auto rounded-xl bg-white p-4 shadow-2xl md:grid-cols-2 md:p-6"
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-slate-600 shadow hover:bg-white hover:text-slate-900"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Photos */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <Photo src={card.photo_1} alt={`${card.nom} - recto`} label="Recto" status={card.status} />
          <Photo src={card.photo_2} alt={`${card.nom} - verso`} label="Verso" status={card.status} />
        </div>

        {/* Infos */}
        <div className="flex flex-col">
          <h2 className="pr-10 text-xl font-semibold text-slate-900">{card.nom}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {card.set} · {card.rarete} · {card.lang}
          </p>

          <div className="mt-4">
            {card.prix !== null ? (
              <p className="text-3xl font-semibold text-slate-900">{card.prix.toFixed(0)} €</p>
            ) : (
              <p className="text-base font-medium uppercase tracking-wide text-amber-700">
                Bientôt en boutique
              </p>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Row label="État">Visible sur les photos</Row>
            <Row label="Édition">{card.set || "-"}</Row>
            <Row label="1ère édition">{card.is_1st ? "Oui" : "Non"}</Row>
            <Row label="Grade">{card.grade ? `${card.grade_org ?? ""} ${card.grade}`.trim() : "-"}</Row>
            <Row label="Réservée">{card.reserve ? "Oui" : "Non"}</Row>
          </dl>

          <div className="mt-6 flex flex-col gap-2">
            <VintedBuyButton card={card} />
            <InstagramBuyButton card={card} />
            <FavoriteButton card={card} />
            {card.status !== "coming_soon" && <RequestPhotosButton card={card} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramBuyButton({ card }: { card: Card }) {
  const url = sellerInstagramUrl(card.vendeur);
  // Masqué tant qu'on ne connaît pas le compte Instagram du vendeur.
  if (!url || card.status === "coming_soon") return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full rounded-md bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow transition hover:opacity-90"
    >
      Acheter via Instagram{card.vendeur ? ` — ${card.vendeur}` : ""}
    </a>
  );
}

function VintedBuyButton({ card }: { card: Card }) {
  const url = sellerVintedUrl(card.vendeur);
  // Achat indirect : on redirige vers la page Vinted du vendeur (pas de paiement
  // sur le site). Masqué si vendeur inconnu ou carte pas encore en boutique.
  if (!url || card.status === "coming_soon") return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full rounded-md bg-[#007782] px-4 py-2.5 text-center text-sm font-semibold text-white shadow transition hover:opacity-90"
    >
      Acheter sur Vinted{card.vendeur ? ` — ${card.vendeur}` : ""}
    </a>
  );
}

function FavoriteButton({ card }: { card: Card }) {
  const { has, toggle } = useFavorites();
  const liked = has(card);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); toggle(card); }}
      className={"w-full rounded-md border px-4 py-2.5 text-sm font-semibold transition " + (
        liked
          ? "border-rose-500 bg-rose-100 text-rose-700 hover:bg-rose-200"
          : "border-rose-300 bg-white text-rose-600 hover:bg-rose-50"
      )}
    >
      {liked ? "❤ Aimé - Retirer des favoris" : "♡ Ajouter aux favoris"}
    </button>
  );
}

function RequestPhotosButton({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  // Libelle different si la carte a deja des photos (= demande supplementaire)
  const hasPhoto = card.status === "available" && (card.photo_1 || card.photo_2);
  const label = hasPhoto ? "📸 Demander des photos supplémentaires" : "📸 Demander des photos";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md border border-cyan-400 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
      >
        {label}
      </button>
      {open && <RequestPhotosModal card={card} onClose={() => setOpen(false)} />}
    </>
  );
}

function Photo({ src, alt, label, status }: {
  src: string | null; alt: string; label: string;
  status?: "available" | "photo_pending" | "coming_soon";
}) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100">
      {status === "coming_soon" ? (
        <ComingSoon />
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <PhotoPending />
      )}
      <span className="absolute left-2 top-2 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
        {label}
      </span>
    </div>
  );
}

export function PhotoPending() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center bg-slate-900 bg-cover bg-center"
      style={{ backgroundImage: "url(/photo-en-attente.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/55" />
      <span
        className="relative px-2 text-center text-sm font-extrabold uppercase tracking-widest text-yellow-300"
        style={{ textShadow: "0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)" }}
      >
        Photo en attente
      </span>
    </div>
  );
}

export function ComingSoon() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)",
      }}
    >
      <span
        className="px-2 text-center text-sm font-extrabold uppercase tracking-widest text-cyan-200"
        style={{ textShadow: "0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)" }}
      >
        Bientôt en boutique
      </span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
    </div>
  );
}
