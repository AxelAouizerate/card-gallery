"use client";

import { useEffect, useMemo, useState } from "react";
import { isNewArrival, isBeySet, BEY_FILTER_VALUE, type Card } from "@/lib/cards";
import { useFavorites } from "@/lib/favorites";
import CardModal, { PhotoPending, ComingSoon, SoldOutBadge } from "./CardModal";

type Props = { cards: Card[] };

export default function CardGallery({ cards }: Props) {
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState<string>("");
  const [rareteFilter, setRareteFilter] = useState<string>("");
  const [langFilter, setLangFilter] = useState<string>("");
  const [only1st, setOnly1st] = useState(false);
  const [onlyGraded, setOnlyGraded] = useState(false);
  const [onlyComingSoon, setOnlyComingSoon] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlySold, setOnlySold] = useState(false);
  const [onlyDispo, setOnlyDispo] = useState(false);
  const [onlyPop1, setOnlyPop1] = useState(false);
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"price_desc" | "price_asc" | "name">("price_desc");

  // Build unique lists for select options
  const sets = useMemo(() => uniq(cards.map((c) => c.set).filter(Boolean)).sort(), [cards]);
  // "bey" est un groupe de sets (voir lib/cards) proposé en tête de liste.
  const setOptions = useMemo(() => [BEY_FILTER_VALUE, ...sets], [sets]);
  const raretes = useMemo(() => uniq(cards.map((c) => c.rarete).filter(Boolean)).sort(), [cards]);
  const langs = useMemo(() => uniq(cards.map((c) => c.lang).filter(Boolean)).sort(), [cards]);

  const filtered = useMemo(() => {
    let out = cards.filter((c) => {
      if (search && !c.nom.toLowerCase().includes(search.toLowerCase())) return false;
      if (setFilter) {
        if (setFilter === BEY_FILTER_VALUE) { if (!isBeySet(c.set)) return false; }
        else if (c.set !== setFilter) return false;
      }
      if (rareteFilter && c.rarete !== rareteFilter) return false;
      if (langFilter && c.lang !== langFilter) return false;
      if (only1st && !c.is_1st) return false;
      if (onlyGraded && !c.grade) return false;
      if (onlyComingSoon && c.status !== "coming_soon") return false;
      if (onlyNew && !isNewArrival(c)) return false;
      if (onlySold && c.status !== "sold") return false;
      if (onlyDispo && (c.status === "sold" || c.status === "coming_soon")) return false;
      if (onlyPop1 && c.pop !== 1) return false;
      // Filtres prix : excluent les cartes sans prix ("Bientot en boutique")
      if (priceMin !== "") {
        if (c.prix === null || c.prix < Number(priceMin)) return false;
      }
      if (priceMax !== "") {
        if (c.prix === null || c.prix > Number(priceMax)) return false;
      }
      return true;
    });
    // Tris : null toujours en fin
    const cmpPrice = (a: Card, b: Card, desc: boolean) => {
      if (a.prix === null && b.prix === null) return 0;
      if (a.prix === null) return 1;
      if (b.prix === null) return -1;
      return desc ? b.prix - a.prix : a.prix - b.prix;
    };
    if (sortBy === "price_desc") out = [...out].sort((a, b) => cmpPrice(a, b, true));
    if (sortBy === "price_asc") out = [...out].sort((a, b) => cmpPrice(a, b, false));
    if (sortBy === "name") out = [...out].sort((a, b) => a.nom.localeCompare(b.nom));
    return out;
  }, [cards, search, setFilter, rareteFilter, langFilter, only1st, onlyGraded, onlyComingSoon, onlyNew, onlySold, onlyDispo, onlyPop1, priceMin, priceMax, sortBy]);

  const totalValue = filtered.reduce((s, c) => s + (c.prix ?? 0), 0);
  const nWithoutPrice = filtered.filter((c) => c.prix === null).length;

  const [selected, setSelected] = useState<Card | null>(null);

  // Pagination
  const PAGE_SIZE = 40;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Reset a la page 1 quand les filtres changent (filtered change de longueur)
  useEffect(() => { setPage(1); }, [
    search, setFilter, rareteFilter, langFilter,
    only1st, onlyGraded, onlyComingSoon, onlyNew, onlySold, onlyDispo, onlyPop1, priceMin, priceMax, sortBy,
  ]);
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageEnd);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          className="text-3xl font-bold tracking-wide text-amber-300"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)",
          }}
        >
          Cartes à l&apos;unité
        </h2>
        <p className="text-sm text-amber-100/80">
          {filtered.length} cartes
          {nWithoutPrice > 0 && (
            <span className="text-amber-100/50"> (+{nWithoutPrice} bientôt en boutique)</span>
          )}
        </p>
      </header>

      {/* Filtres : panneau "papyrus" sombre */}
      <div className="mb-6 rounded-lg border border-amber-500/30 bg-black/55 p-4 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Rechercher" placeholder="Nom de la carte..." value={search} onChange={setSearch} />
        <Select
          label="Set / Extension"
          value={setFilter}
          onChange={setSetFilter}
          options={setOptions}
          renderOption={(o) => (o === BEY_FILTER_VALUE ? "bey (groupe de sets)" : o)}
        />
        <Select label="Rareté" value={rareteFilter} onChange={setRareteFilter} options={raretes} />
        <Select label="Langue" value={langFilter} onChange={setLangFilter} options={langs} />
        <div>
          <label className="mb-1 block text-xs font-medium text-amber-100/80">Prix (€)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-md border border-amber-500/40 bg-black/40 px-2 py-1.5 text-sm text-amber-50 placeholder:text-amber-100/40 focus:border-amber-300 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-md border border-amber-500/40 bg-black/40 px-2 py-1.5 text-sm text-amber-50 placeholder:text-amber-100/40 focus:border-amber-300 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-amber-100/80">Tri</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full rounded-md border border-amber-500/40 bg-black/40 px-2 py-1.5 text-sm text-amber-50 placeholder:text-amber-100/40 focus:border-amber-300 focus:outline-none"
          >
            <option value="price_desc">Prix décroissant</option>
            <option value="price_asc">Prix croissant</option>
            <option value="name">Nom A-Z</option>
          </select>
        </div>
        </div>

        {/* Filtres rapides : chips toggles, propre et aéré */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-amber-500/15 pt-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-amber-100/40">Filtres</span>
          <ToggleChip active={only1st} onClick={() => setOnly1st(!only1st)} tone="amber">1ère Édition</ToggleChip>
          <ToggleChip active={onlyGraded} onClick={() => setOnlyGraded(!onlyGraded)} tone="amber">Gradée</ToggleChip>
          <ToggleChip active={onlyPop1} onClick={() => setOnlyPop1(!onlyPop1)} tone="amber">★ Pop 1</ToggleChip>
          <ToggleChip active={onlyDispo} onClick={() => setOnlyDispo(!onlyDispo)} tone="emerald">Disponible</ToggleChip>
          <ToggleChip active={onlyComingSoon} onClick={() => setOnlyComingSoon(!onlyComingSoon)} tone="cyan">Bientôt dispo</ToggleChip>
          <ToggleChip active={onlySold} onClick={() => setOnlySold(!onlySold)} tone="red">Sold out</ToggleChip>
          <ToggleChip active={onlyNew} onClick={() => setOnlyNew(!onlyNew)} tone="rose">
            Nouveautés
            <span className="ml-1 inline-block rounded-sm bg-gradient-to-r from-rose-500 to-rose-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
              ‹ 14j
            </span>
          </ToggleChip>
        </div>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {pageItems.map((c, i) => (
          <CardTile key={`${c.id}-${c.set}-${pageStart + i}`} c={c} onOpen={() => setSelected(c)} />
        ))}
      </div>

      {filtered.length > 0 && (
        <Pagination
          page={safePage}
          pageCount={pageCount}
          pageStart={pageStart}
          pageEnd={Math.min(pageEnd, filtered.length)}
          total={filtered.length}
          onPage={setPage}
        />
      )}

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-amber-100/60">
          Aucune carte ne correspond à ces filtres.
        </p>
      )}

      {selected && <CardModal card={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Pagination({
  page, pageCount, pageStart, pageEnd, total, onPage,
}: {
  page: number; pageCount: number; pageStart: number; pageEnd: number;
  total: number; onPage: (p: number) => void;
}) {
  const btn = "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-amber-500/40 bg-black/40 px-3 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black/40";
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-amber-100/70">
        Cartes {pageStart + 1}-{pageEnd} sur {total} - Page {page} / {pageCount}
      </p>
      <div className="flex items-center gap-1.5">
        <button className={btn} onClick={() => onPage(1)} disabled={page <= 1} aria-label="Première page">«</button>
        <button className={btn} onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Page précédente">‹ Précédente</button>
        <button className={btn} onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Page suivante">Suivante ›</button>
        <button className={btn} onClick={() => onPage(pageCount)} disabled={page >= pageCount} aria-label="Dernière page">»</button>
      </div>
    </nav>
  );
}

function CardTile({ c, onOpen }: { c: Card; onOpen: () => void }) {
  const { has: hasFav, toggle: toggleFav } = useFavorites();
  const liked = hasFav(c);
  return (
    // <div> au lieu de <button> pour pouvoir imbriquer le bouton like
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      <div className="relative aspect-[3/4] w-full bg-slate-100">
        {/* Bouton Like en haut a gauche */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleFav(c); }}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow transition hover:scale-110 hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
        {c.status === "coming_soon" ? (
          <ComingSoon />
        ) : c.photo_1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.photo_1} alt={c.nom} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <PhotoPending />
        )}
        {c.status === "sold" && <SoldOutBadge />}
        {c.reserve && (
          <span className="absolute right-2 top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
            Réservée
          </span>
        )}
        {c.is_1st && (
          <span className="absolute left-2 top-2 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
            1st
          </span>
        )}
        {c.grade && (
          <span className="absolute bottom-2 left-2 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {c.grade_org ?? "Grade"} {c.grade}
          </span>
        )}
        {isNewArrival(c) && (
          <span
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 overflow-hidden rounded-sm bg-gradient-to-r from-rose-600 via-red-500 to-rose-500 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md ring-1 ring-rose-300/40 animate-pulse"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.15) inset, 0 4px 12px rgba(244,63,94,0.45)",
              textShadow: "0 1px 0 rgba(0,0,0,0.45)",
            }}
            title={`Ajoutée le ${c.first_seen ?? "récemment"}`}
          >
            ★ NEW
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium text-slate-900" title={c.nom}>
          {c.nom}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {c.set} · {c.rarete} · {c.lang}
          {c.is_1st && " · 1ère édition"}
        </p>
        <div className="mt-2 flex items-center justify-between">
          {c.status === "sold" ? (
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">Vendue</p>
          ) : c.prix !== null ? (
            <p className="text-base font-semibold text-slate-900">{c.prix.toFixed(0)} €</p>
          ) : (
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Bientôt en boutique
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Tons des chips de filtre (classes complètes -> compatibles purge Tailwind).
const CHIP_TONES = {
  amber:   { on: "border-amber-400 bg-amber-400/20 text-amber-50",   off: "border-amber-500/25 text-amber-100/70 hover:border-amber-400/60 hover:text-amber-100" },
  cyan:    { on: "border-cyan-400 bg-cyan-400/20 text-cyan-50",      off: "border-amber-500/25 text-cyan-200/70 hover:border-cyan-400/60 hover:text-cyan-100" },
  rose:    { on: "border-rose-400 bg-rose-400/20 text-rose-50",      off: "border-amber-500/25 text-rose-200/70 hover:border-rose-400/60 hover:text-rose-100" },
  emerald: { on: "border-emerald-400 bg-emerald-400/20 text-emerald-50", off: "border-amber-500/25 text-emerald-200/70 hover:border-emerald-400/60 hover:text-emerald-100" },
  red:     { on: "border-red-400 bg-red-500/25 text-red-50",         off: "border-amber-500/25 text-red-300/70 hover:border-red-400/60 hover:text-red-100" },
} as const;

function ToggleChip({
  active, onClick, tone = "amber", children,
}: {
  active: boolean; onClick: () => void;
  tone?: keyof typeof CHIP_TONES; children: React.ReactNode;
}) {
  const t = CHIP_TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium transition " +
        (active ? `${t.on} shadow-sm` : t.off)
      }
    >
      {children}
    </button>
  );
}

function Input({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-amber-100/80">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-amber-500/40 bg-black/40 px-2 py-1.5 text-sm text-amber-50 placeholder:text-amber-100/40 focus:border-amber-300 focus:outline-none"
      />
    </div>
  );
}

function Select({
  label, value, onChange, options, renderOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderOption?: (o: string) => string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-amber-100/80">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-amber-500/40 bg-black/40 px-2 py-1.5 text-sm text-amber-50 placeholder:text-amber-100/40 focus:border-amber-300 focus:outline-none"
      >
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {renderOption ? renderOption(o) : o}
          </option>
        ))}
      </select>
    </div>
  );
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
