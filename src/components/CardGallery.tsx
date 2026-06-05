"use client";

import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/cards";

type Props = { cards: Card[] };

// Libelles fins (affiches sur les cartes) — "joué" remplace par "played"
const ETAT_LABELS: Record<string, string> = {
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

// Groupes pour le FILTRE : on regroupe les variantes (+, -, etc.) sous une
// meme etiquette. La grille / le modal continuent d'afficher l'etat precis
// via ETAT_LABELS.
const ETAT_GROUP: Record<string, string> = {
  "GEM MINT": "MINT",  "MINT": "MINT",  "MINT+": "MINT",
  "NM": "NEAR MINT",   "NM+": "NEAR MINT",  "NM-": "NEAR MINT",
  "EX": "EXCELLENT",   "EX+": "EXCELLENT",  "EX-": "EXCELLENT",
  "EXC": "EXCELLENT",  "EXC+": "EXCELLENT", "EXC-": "EXCELLENT",
  "LP": "LIGHTLY PLAYED", "LP+": "LIGHTLY PLAYED", "LP-": "LIGHTLY PLAYED",
  "GOOD": "GOOD",      "GOOD+": "GOOD",     "GOOD-": "GOOD",
  "PL": "PLAYED",      "PL+": "PLAYED",     "PL-": "PLAYED",
  "POOR": "POOR",
};
const etatGroup = (e: string) => ETAT_GROUP[e] ?? e;

export default function CardGallery({ cards }: Props) {
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState<string>("");
  const [rareteFilter, setRareteFilter] = useState<string>("");
  const [langFilter, setLangFilter] = useState<string>("");
  const [etatFilter, setEtatFilter] = useState<string>("");
  const [only1st, setOnly1st] = useState(false);
  const [onlyGraded, setOnlyGraded] = useState(false);
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"price_desc" | "price_asc" | "name">("price_desc");

  // Build unique lists for select options
  const sets = useMemo(() => uniq(cards.map((c) => c.set).filter(Boolean)).sort(), [cards]);
  const raretes = useMemo(() => uniq(cards.map((c) => c.rarete).filter(Boolean)).sort(), [cards]);
  const langs = useMemo(() => uniq(cards.map((c) => c.lang).filter(Boolean)).sort(), [cards]);
  // Pour le dropdown, on liste les GROUPES uniques (MINT, NEAR MINT, etc.)
  const etats = useMemo(
    () => uniq(cards.map((c) => etatGroup(c.etat)).filter(Boolean)).sort(),
    [cards]
  );

  const filtered = useMemo(() => {
    let out = cards.filter((c) => {
      if (search && !c.nom.toLowerCase().includes(search.toLowerCase())) return false;
      if (setFilter && c.set !== setFilter) return false;
      if (rareteFilter && c.rarete !== rareteFilter) return false;
      if (langFilter && c.lang !== langFilter) return false;
      if (etatFilter && etatGroup(c.etat) !== etatFilter) return false;
      if (only1st && !c.is_1st) return false;
      if (onlyGraded && !c.grade) return false;
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
  }, [cards, search, setFilter, rareteFilter, langFilter, etatFilter, only1st, onlyGraded, priceMin, priceMax, sortBy]);

  const totalValue = filtered.reduce((s, c) => s + (c.prix ?? 0), 0);
  const nWithoutPrice = filtered.filter((c) => c.prix === null).length;

  const [selected, setSelected] = useState<Card | null>(null);

  // Pagination
  const PAGE_SIZE = 40;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Reset a la page 1 quand les filtres changent (filtered change de longueur)
  useEffect(() => { setPage(1); }, [
    search, setFilter, rareteFilter, langFilter, etatFilter,
    only1st, onlyGraded, priceMin, priceMax, sortBy,
  ]);
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageEnd);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1
          className="font-serif text-3xl font-bold tracking-wide text-amber-300"
          style={{ textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)" }}
        >
          Ma collection
        </h1>
        <p className="text-sm text-amber-100/80">
          {filtered.length} cartes - {totalValue.toFixed(0)} €
          {nWithoutPrice > 0 && (
            <span className="text-amber-100/50"> (+{nWithoutPrice} bientôt en boutique)</span>
          )}
        </p>
      </header>

      {/* Filtres : panneau "papyrus" sombre */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-amber-500/30 bg-black/55 p-4 backdrop-blur supports-[backdrop-filter]:bg-black/40 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Rechercher" placeholder="Nom de la carte..." value={search} onChange={setSearch} />
        <Select label="Set / Extension" value={setFilter} onChange={setSetFilter} options={sets} />
        <Select label="Rareté" value={rareteFilter} onChange={setRareteFilter} options={raretes} />
        <Select label="Langue" value={langFilter} onChange={setLangFilter} options={langs} />
        <Select
          label="État"
          value={etatFilter}
          onChange={setEtatFilter}
          options={etats}
        />
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
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-amber-100/90">
            <input
              type="checkbox"
              checked={only1st}
              onChange={(e) => setOnly1st(e.target.checked)}
              className="h-4 w-4"
            />
            1ère Édition
          </label>
          <label className="flex items-center gap-2 text-sm text-amber-100/90">
            <input
              type="checkbox"
              checked={onlyGraded}
              onChange={(e) => setOnlyGraded(e.target.checked)}
              className="h-4 w-4"
            />
            Gradée
          </label>
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
  return (
    <button
      type="button"
      onClick={onOpen}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400"
    >
      <div className="relative aspect-[3/4] w-full bg-slate-100">
        {c.photo_1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.photo_1} alt={c.nom} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <PhotoPending />
        )}
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
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium text-slate-900" title={c.nom}>
          {c.nom}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {c.set} · {c.rarete} · {c.lang}
        </p>
        <div className="mt-2 flex items-center justify-between">
          {c.prix !== null ? (
            <p className="text-base font-semibold text-slate-900">{c.prix.toFixed(0)} €</p>
          ) : (
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Bientôt en boutique
            </p>
          )}
          {c.etat && <span className="text-[10px] text-slate-500">{ETAT_LABELS[c.etat] ?? c.etat}</span>}
        </div>
      </div>
    </button>
  );
}

function CardModal({ card, onClose }: { card: Card; onClose: () => void }) {
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
          <Photo src={card.photo_1} alt={`${card.nom} - recto`} label="Recto" />
          <Photo src={card.photo_2} alt={`${card.nom} - verso`} label="Verso" />
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
            <Row label="État">{ETAT_LABELS[card.etat] ?? card.etat ?? "-"}</Row>
            <Row label="Édition">{card.set || "-"}</Row>
            <Row label="1ère édition">{card.is_1st ? "Oui" : "Non"}</Row>
            <Row label="Grade">{card.grade ? `${card.grade_org ?? ""} ${card.grade}`.trim() : "-"}</Row>
            <Row label="Réservée">{card.reserve ? "Oui" : "Non"}</Row>
          </dl>
        </div>
      </div>
    </div>
  );
}

function Photo({ src, alt, label }: { src: string | null; alt: string; label: string }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100">
      {src ? (
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

function PhotoPending() {
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
    </div>
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
