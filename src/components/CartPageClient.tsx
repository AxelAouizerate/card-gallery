"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Card } from "@/lib/cards";
import { useCart, cardKey } from "@/lib/cart";

export default function CartPageClient({ cards }: { cards: Card[] }) {
  const { ids, remove, clear } = useCart();
  const items = useMemo(
    () => cards.filter((c) => ids.has(cardKey(c))),
    [cards, ids]
  );
  const total = items.reduce((s, c) => s + (c.prix ?? 0), 0);
  const nWithoutPrice = items.filter((c) => c.prix === null).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1
          className="font-serif text-3xl font-bold tracking-wide text-amber-300"
          style={{ textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)" }}
        >
          Mon panier
        </h1>
        <Link href="/" className="text-sm text-amber-100/80 underline hover:text-amber-200">
          ← Retour à la galerie
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-black/55 p-12 text-center text-amber-100/80 backdrop-blur">
          <p className="text-lg">Ton panier est vide.</p>
          <p className="mt-2 text-sm text-amber-100/60">
            Clique sur une carte dans la galerie et utilise « Ajouter au panier ».
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-amber-500/20 rounded-lg border border-amber-500/30 bg-black/55 backdrop-blur">
            {items.map((c) => (
              <li key={cardKey(c)} className="flex items-center gap-4 p-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-slate-200">
                  {c.photo_1 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo_1} alt={c.nom} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-[8px] font-bold uppercase text-amber-300">
                      Photo en attente
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-amber-50">{c.nom}</p>
                  <p className="truncate text-xs text-amber-100/60">
                    {c.set} · {c.rarete} · {c.lang}
                    {c.is_1st && " · 1ère édition"}
                  </p>
                </div>
                <p className="shrink-0 text-base font-semibold text-amber-100">
                  {c.prix !== null ? `${c.prix.toFixed(0)} €` : (
                    <span className="text-xs uppercase text-amber-400">Bientôt</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="shrink-0 rounded p-1.5 text-amber-100/70 hover:bg-amber-500/10 hover:text-amber-200"
                  aria-label="Retirer du panier"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 rounded-lg border border-amber-500/30 bg-black/55 p-4 backdrop-blur">
            <div>
              <p className="text-sm text-amber-100/80">
                {items.length} carte{items.length > 1 ? "s" : ""} dans le panier
                {nWithoutPrice > 0 && (
                  <span className="text-amber-100/50">
                    {" "}(dont {nWithoutPrice} sans prix)
                  </span>
                )}
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-200">
                Total : {total.toFixed(0)} €
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clear}
                className="rounded-md border border-amber-500/40 bg-black/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/10"
              >
                Vider le panier
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-500/30 bg-black/40 p-4 text-sm text-amber-100/80 backdrop-blur">
            <p className="font-semibold text-amber-200">Comment finaliser ?</p>
            <p className="mt-2">
              Pour le moment, le paiement en ligne n&apos;est pas activé. Tu peux
              prendre contact avec le vendeur en envoyant la liste de tes cartes
              par message. Le panier est sauvegardé localement dans ton
              navigateur.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
