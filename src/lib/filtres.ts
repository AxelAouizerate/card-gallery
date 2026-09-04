import type { Card } from "@/lib/cards";

/**
 * L'etat des filtres vit dans l'URL, pas dans un useState : une vue filtree
 * doit etre partageable, mettable en favori et rechargeable. Ce module est la
 * source unique de verite, partagee par le serveur (qui filtre) et par l'ilot
 * client (qui ecrit les parametres).
 */
export type Filtres = {
  q: string;
  sets: string[];
  raretes: string[];
  langues: string[];
  prixMin: number | null;
  prixMax: number | null;
  gradation: "" | "gradee" | "non-gradee";
  noteMin: number | null;
  edition1st: boolean;
  pop1: boolean;
  dispo: boolean;
  soldOut: boolean;
  nouveautes: boolean;
  page: number;
};

export const FILTRES_VIDES: Filtres = {
  q: "", sets: [], raretes: [], langues: [],
  prixMin: null, prixMax: null, gradation: "", noteMin: null,
  edition1st: false, pop1: false, dispo: false, soldOut: false, nouveautes: false, page: 1,
};

type Params = Record<string, string | string[] | undefined>;

const liste = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v.join(",") : v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const nombre = (v: string | string[] | undefined): number | null => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) ? n : null;
};

const vrai = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) === "1";

export function lireFiltres(params: Params): Filtres {
  const g = Array.isArray(params.gradation) ? params.gradation[0] : params.gradation;
  return {
    q: (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim(),
    sets: liste(params.set),
    raretes: liste(params.rarete),
    langues: liste(params.langue),
    prixMin: nombre(params.prixMin),
    prixMax: nombre(params.prixMax),
    gradation: g === "gradee" || g === "non-gradee" ? g : "",
    noteMin: nombre(params.note),
    edition1st: vrai(params.edition),
    pop1: vrai(params.pop1),
    dispo: vrai(params.dispo),
    soldOut: vrai(params.soldOut),
    nouveautes: vrai(params.nouveautes),
    page: Math.max(1, nombre(params.page) ?? 1),
  };
}

/** Serialise vers une query string stable (ordre fixe = URLs canoniques stables). */
export function ecrireFiltres(f: Filtres): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.sets.length) p.set("set", f.sets.join(","));
  if (f.raretes.length) p.set("rarete", f.raretes.join(","));
  if (f.langues.length) p.set("langue", f.langues.join(","));
  if (f.prixMin != null) p.set("prixMin", String(f.prixMin));
  if (f.prixMax != null) p.set("prixMax", String(f.prixMax));
  if (f.gradation) p.set("gradation", f.gradation);
  if (f.noteMin != null) p.set("note", String(f.noteMin));
  if (f.edition1st) p.set("edition", "1");
  if (f.pop1) p.set("pop1", "1");
  if (f.dispo) p.set("dispo", "1");
  if (f.soldOut) p.set("soldOut", "1");
  if (f.nouveautes) p.set("nouveautes", "1");
  if (f.page > 1) p.set("page", String(f.page));
  return p.toString();
}

/** Nombre de filtres actifs — affiche sur le bouton "Filtres". */
export function nbFiltresActifs(f: Filtres): number {
  return (
    (f.q ? 1 : 0) + f.sets.length + f.raretes.length + f.langues.length +
    (f.prixMin != null ? 1 : 0) + (f.prixMax != null ? 1 : 0) +
    (f.gradation ? 1 : 0) + (f.noteMin != null ? 1 : 0) +
    (f.edition1st ? 1 : 0) + (f.pop1 ? 1 : 0) +
    (f.dispo ? 1 : 0) + (f.soldOut ? 1 : 0) + (f.nouveautes ? 1 : 0)
  );
}

/** Une vue filtree ne doit pas etre indexee : contenu duplique a l'infini. */
export function estIndexable(f: Filtres): boolean {
  return nbFiltresActifs(f) === 0;
}

function sansAccents(s: string) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const JOURS_NOUVEAUTE = 14;

export function appliquerFiltres(cards: Card[], f: Filtres, maintenant = new Date()): Card[] {
  const q = sansAccents(f.q);
  const sets = new Set(f.sets.map((s) => s.toLowerCase()));
  const raretes = new Set(f.raretes.map((s) => s.toLowerCase()));
  const langues = new Set(f.langues.map((s) => s.toLowerCase()));

  return cards.filter((c) => {
    if (q && !sansAccents(`${c.nom} ${c.set} ${c.rarete}`).includes(q)) return false;
    if (sets.size && !sets.has((c.set || "").toLowerCase())) return false;
    if (raretes.size && !raretes.has((c.rarete || "").toLowerCase())) return false;
    if (langues.size && !langues.has((c.lang || "").toLowerCase())) return false;
    if (f.prixMin != null && (c.prix ?? -1) < f.prixMin) return false;
    if (f.prixMax != null && (c.prix ?? Infinity) > f.prixMax) return false;
    if (f.gradation === "gradee" && !c.grade) return false;
    if (f.gradation === "non-gradee" && c.grade) return false;
    if (f.noteMin != null) {
      const note = c.grade ? parseFloat(c.grade) : null;
      if (note == null || Number.isNaN(note) || note < f.noteMin) return false;
    }
    if (f.edition1st && !c.is_1st) return false;
    if (f.pop1 && c.pop !== 1) return false;
    if (f.dispo && (c.status === "sold" || c.status === "coming_soon")) return false;
    if (f.soldOut && c.status !== "sold") return false;
    if (f.nouveautes) {
      if (!c.first_seen) return false;
      const age = maintenant.getTime() - new Date(`${c.first_seen}T00:00:00Z`).getTime();
      if (age < 0 || age > JOURS_NOUVEAUTE * 864e5) return false;
    }
    return true;
  });
}
