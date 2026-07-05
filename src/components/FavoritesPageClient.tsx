"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Card } from "@/lib/cards";
import { cardKey } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import CardModal from "./CardModal";

export default function FavoritesPageClient({ cards }: { cards: Card[] }) {
  const { ids, remove, clear } = useFavorites();
  const [selected, setSelected] = useState<Card | null>(null);
  const items = useMemo(
    () => cards.filter((c) => ids.has(cardKey(c))),
    [cards, ids]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1
          className="font-serif text-3xl font-bold tracking-wide text-amber-300"
          style={{ textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)" }}
        >
          Mes favoris
        </h1>
        <Link href="/" className="text-sm text-amber-100/80 underline hover:text-amber-200">
          ← Retour à la galerie
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-black/55 p-12 text-center text-amber-100/80 backdrop-blur">
          <p className="text-lg">Pas encore de favoris.</p>
          <p className="mt-2 text-sm text-amber-100/60">
            Clique sur ♡ dans une carte pour l&apos;ajouter.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-amber-500/20 rounded-lg border border-amber-500/30 bg-black/55 backdrop-blur">
            {items.map((c) => (
              <li
                key={cardKey(c)}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(c)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(c); } }}
                className="flex cursor-pointer items-center gap-4 p-3 transition hover:bg-amber-500/10 focus:bg-amber-500/10 focus:outline-none"
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-slate-200">
                  {c.photo_1 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo_1} alt={c.nom} className="h-full w-full object-cover" />
                  ) : (
                    <div className={"flex h-full w-full items-center justify-center text-[8px] font-bold uppercase " +
                      (c.status === "coming_soon" ? "bg-indigo-900 text-cyan-300" : "bg-slate-900 text-amber-300")}>
                      {c.status === "coming_soon" ? "Bientôt" : "Photo att."}
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
                    <span className="text-xs uppercase text-cyan-300">À venir</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(c); }}
                  className="shrink-0 rounded p-1.5 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                  aria-label="Retirer des favoris"
                  title="Retirer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-amber-100/70">{items.length} carte{items.length > 1 ? "s" : ""}</p>
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-amber-500/40 bg-black/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/10"
            >
              Tout retirer
            </button>
          </div>
        </>
      )}

      {selected && <CardModal card={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
