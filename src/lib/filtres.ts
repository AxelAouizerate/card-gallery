import type { Card } from "@/lib/cards";
import { TRADUCTIONS_NOM } from "@/lib/traductions-cartes";
import { rangSortie } from "@/lib/chronologie-sets";

/** Options de tri du catalogue - demande d'Axel du 2026-10-10. "" = ordre
 * par defaut (valeur decroissante, deja applique en amont par
 * cartesAvecSlug). "ajout_recent" trie par date de mise en vente
 * (first_seen) - pas de champ "date de vente" distinct dans les donnees. */
export type TriCatalogue =
  | ""
  | "prix_asc" | "prix_desc"
  | "ajout_recent"
  | "sortie_ancien" | "sortie_recent"
  | "nom_asc" | "nom_desc";

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
  /** Grades exacts selectionnes (multi-select) - pas un seuil minimum :
   * choisir "7" ne ramene plus les 8/9/10 - demande d'Axel du 2026-09-26. */
  notes: number[];
  edition1st: boolean;
  pop1: boolean;
  dispo: boolean;
  soldOut: boolean;
  nouveautes: boolean;
  tri: TriCatalogue;
  page: number;
};

export const FILTRES_VIDES: Filtres = {
  q: "", sets: [], raretes: [], langues: [],
  prixMin: null, prixMax: null, gradation: "", notes: [],
  edition1st: false, pop1: false, dispo: false, soldOut: false, nouveautes: false,
  tri: "", page: 1,
};

const TRIS_VALIDES = new Set<TriCatalogue>([
  "prix_asc", "prix_desc", "ajout_recent", "sortie_ancien", "sortie_recent", "nom_asc", "nom_desc",
]);

type Params = Record<string, string | string[] | undefined>;

const liste = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v.join(",") : v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const nombre = (v: string | string[] | undefined): number | null => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) ? n : null;
};

const listeNombres = (v: string | string[] | undefined): number[] =>
  liste(v).map(Number).filter(Number.isFinite);

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
    notes: listeNombres(params.note),
    edition1st: vrai(params.edition),
    pop1: vrai(params.pop1),
    dispo: vrai(params.dispo),
    soldOut: vrai(params.soldOut),
    nouveautes: vrai(params.nouveautes),
    tri: (() => {
      const t = Array.isArray(params.tri) ? params.tri[0] : params.tri;
      return TRIS_VALIDES.has(t as TriCatalogue) ? (t as TriCatalogue) : "";
    })(),
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
  if (f.notes.length) p.set("note", f.notes.join(","));
  if (f.edition1st) p.set("edition", "1");
  if (f.pop1) p.set("pop1", "1");
  if (f.dispo) p.set("dispo", "1");
  if (f.soldOut) p.set("soldOut", "1");
  if (f.nouveautes) p.set("nouveautes", "1");
  if (f.tri) p.set("tri", f.tri);
  if (f.page > 1) p.set("page", String(f.page));
  return p.toString();
}

/** Nombre de filtres actifs — affiche sur le bouton "Filtres". */
export function nbFiltresActifs(f: Filtres): number {
  return (
    (f.q ? 1 : 0) + f.sets.length + f.raretes.length + f.langues.length +
    (f.prixMin != null ? 1 : 0) + (f.prixMax != null ? 1 : 0) +
    (f.gradation ? 1 : 0) + f.notes.length +
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

/** Normalise une recherche : accents retires, virgules -> espaces, espaces
 * multiples ecrases. Sert a rendre "dragon, blanc" et "blanc dragon"
 * equivalents a "dragon blanc" - demande d'Axel du 2026-09-20. */
function normaliserRecherche(s: string): string {
  return sansAccents(s).replace(/,/g, " ").replace(/\s+/g, " ").trim();
}

const JOURS_NOUVEAUTE = 14;

export function appliquerFiltres(cards: Card[], f: Filtres, maintenant = new Date()): Card[] {
  // Tolerant a l'ordre des mots et aux virgules : "dragon, blanc" et "blanc
  // dragon" matchent tous les deux "Dragon Blanc aux Yeux Bleus" (chaque mot
  // de la recherche doit apparaitre quelque part, peu importe l'ordre).
  const qMots = normaliserRecherche(f.q).split(" ").filter(Boolean);
  const sets = new Set(f.sets.map((s) => s.toLowerCase()));
  const raretes = new Set(f.raretes.map((s) => s.toLowerCase()));
  const langues = new Set(f.langues.map((s) => s.toLowerCase()));

  const filtrees = cards.filter((c) => {
    if (qMots.length) {
      // Ajoute le(s) nom(s) dans l'autre langue quand on les connait, pour
      // que "Dark Magician" retrouve "Magicien Sombre" et vice-versa, y
      // compris sur les exemplaires japonais - demande d'Axel du 2026-09-29.
      const alt = TRADUCTIONS_NOM[c.nom];
      const cible = normaliserRecherche(
        `${c.nom} ${c.set} ${c.rarete}${alt ? " " + alt.join(" ") : ""}`,
      );
      if (!qMots.every((m) => cible.includes(m))) return false;
    }
    if (sets.size && !sets.has((c.set || "").toLowerCase())) return false;
    if (raretes.size && !raretes.has((c.rarete || "").toLowerCase())) return false;
    if (langues.size && !langues.has((c.lang || "").toLowerCase())) return false;
    if (f.prixMin != null && (c.prix ?? -1) < f.prixMin) return false;
    if (f.prixMax != null && (c.prix ?? Infinity) > f.prixMax) return false;
    if (f.gradation === "gradee" && !c.grade) return false;
    if (f.gradation === "non-gradee" && c.grade) return false;
    if (f.notes.length) {
      const note = c.grade ? parseFloat(c.grade) : null;
      if (note == null || Number.isNaN(note) || !f.notes.includes(note)) return false;
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

  if (!f.tri) return filtrees;

  // Valeurs "inconnues" toujours en fin de liste, quel que soit le sens du
  // tri (jamais intercalees au hasard parmi des valeurs connues).
  const trie = [...filtrees];
  switch (f.tri) {
    case "prix_asc":
      trie.sort((a, b) => (a.prix ?? Infinity) - (b.prix ?? Infinity));
      break;
    case "prix_desc":
      trie.sort((a, b) => (b.prix ?? -Infinity) - (a.prix ?? -Infinity));
      break;
    case "ajout_recent":
      trie.sort((a, b) => (b.first_seen ?? "").localeCompare(a.first_seen ?? ""));
      break;
    case "sortie_ancien":
      trie.sort((a, b) => {
        const ra = rangSortie(a.set), rb = rangSortie(b.set);
        if (ra == null && rb == null) return 0;
        if (ra == null) return 1;
        if (rb == null) return -1;
        return ra - rb;
      });
      break;
    case "sortie_recent":
      trie.sort((a, b) => {
        const ra = rangSortie(a.set), rb = rangSortie(b.set);
        if (ra == null && rb == null) return 0;
        if (ra == null) return 1;
        if (rb == null) return -1;
        return rb - ra;
      });
      break;
    case "nom_asc":
      trie.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      break;
    case "nom_desc":
      trie.sort((a, b) => b.nom.localeCompare(a.nom, "fr"));
      break;
  }
  return trie;
}
