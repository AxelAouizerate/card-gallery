"use client";

import { useEffect, useState } from "react";
import type { Card } from "@/lib/cards";
import RequestPhotosModal from "./RequestPhotosModal";
import PhotoLightbox, { type Shot } from "./PhotoLightbox";
import { useFavorites } from "@/lib/favorites";
import { sellerInstagramUrl, sellerVintedUrl } from "@/lib/site";

export default function CardModal({ card, onClose }: { card: Card; onClose: () => void }) {
  // Visionneuse plein écran (index de la photo ouverte, ou null)
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Photos réellement affichables (recto/verso avec image) = zoomables
  const shots: Shot[] = [];
  if (card.status !== "coming_soon") {
    if (card.photo_1) shots.push({ src: card.photo_1, label: "Recto" });
    if (card.photo_2) shots.push({ src: card.photo_2, label: "Verso" });
  }
  const openShot = (src: string | null) => {
    if (!src) return;
    const i = shots.findIndex((s) => s.src === src);
    if (i >= 0) setLightbox(i);
  };

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
          <Photo src={card.photo_1} alt={`${card.nom} - recto`} label="Recto" status={card.status} onOpen={openShot} />
          <Photo src={card.photo_2} alt={`${card.nom} - verso`} label="Verso" status={card.status} onOpen={openShot} />
        </div>

        {/* Infos */}
        <div className="flex flex-col">
          <h2 className="pr-10 text-xl font-semibold text-slate-900">{card.nom}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {card.set} · {card.rarete} · {card.lang}
          </p>
          {card.pop != null && card.pop <= 2 && (
            <span
              className={
                "mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm " +
                (card.pop === 1
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                  : "bg-gradient-to-r from-slate-400 to-slate-500")
              }
            >
              ★ Pop {card.pop}
              <span className="font-semibold normal-case tracking-normal opacity-90">
                {card.pop === 1 ? "— unique à ce grade" : "— 2 exemplaires à ce grade"}
              </span>
            </span>
          )}

          <div className="mt-4">
            {card.status === "sold" ? (
              <p className="text-2xl font-black uppercase tracking-widest text-red-600">Vendue</p>
            ) : card.prix !== null ? (
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
            {card.status !== "coming_soon" && card.status !== "sold" && <RequestPhotosButton card={card} />}
          </div>
        </div>
      </div>

      {lightbox !== null && shots.length > 0 && (
        <PhotoLightbox
          shots={shots}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function InstagramBuyButton({ card }: { card: Card }) {
  const url = sellerInstagramUrl(card.vendeur);
  // Masqué tant qu'on ne connaît pas le compte Instagram du vendeur, ou si vendue.
  if (!url || card.status === "coming_soon" || card.status === "sold") return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full rounded-md bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow transition hover:opacity-90"
    >
      Acheter via Instagram — DM le vendeur
    </a>
  );
}

function VintedBuyButton({ card }: { card: Card }) {
  const url = sellerVintedUrl(card.vendeur);
  // Achat indirect : on redirige vers la page Vinted du vendeur (pas de paiement
  // sur le site). Masqué si vendeur inconnu, carte pas encore en boutique, ou vendue.
  if (!url || card.status === "coming_soon" || card.status === "sold") return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full rounded-md bg-[#007782] px-4 py-2.5 text-center text-sm font-semibold text-white shadow transition hover:opacity-90"
    >
      Acheter sur Vinted — DM le vendeur
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

function Photo({ src, alt, label, status, onOpen }: {
  src: string | null; alt: string; label: string;
  status?: Card["status"];
  onOpen?: (src: string | null) => void;
}) {
  const zoomable = status !== "coming_soon" && Boolean(src);
  return (
    <div
      className={
        "group relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100 " +
        (zoomable ? "cursor-zoom-in" : "")
      }
      onClick={zoomable ? (e) => { e.stopPropagation(); onOpen?.(src); } : undefined}
    >
      {status === "coming_soon" ? (
        <ComingSoon />
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <PhotoPending />
      )}
      {status === "sold" && <SoldOutBadge />}
      <span className="absolute left-2 top-2 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
        {label}
      </span>
      {zoomable && (
        <span className="pointer-events-none absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
          Zoom
        </span>
      )}
    </div>
  );
}

// Bandeau rouge "SOLD OUT" superposé (photo assombrie + ruban incliné).
export function SoldOutBadge() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/45" />
      <span
        className="relative -rotate-12 select-none rounded-md border-2 border-white/85 bg-gradient-to-r from-red-700 via-red-500 to-red-700 px-4 py-1.5 text-lg font-black uppercase tracking-[0.2em] text-white"
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.7)", boxShadow: "0 6px 18px rgba(220,38,38,0.6)" }}
      >
        Sold Out
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
