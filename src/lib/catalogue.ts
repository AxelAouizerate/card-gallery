import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Card } from "@/lib/cards";

/**
 * Acces au catalogue cote serveur. Source : public/cards.json.
 * `cache()` dedupe la lecture pendant un meme rendu : la page produit, son
 * opengraph-image et le sitemap peuvent l'appeler sans relire le fichier.
 */
export const getCards = cache(async (): Promise<Card[]> => {
  const file = path.join(process.cwd(), "public", "cards.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Card[];
});

// ─── Slugs ──────────────────────────────────────────────────────────────────

function sansAccents(s: string): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** "Dragon Blanc Aux Yeux Bleus" -> "dragon-blanc-aux-yeux-bleus" */
function morceau(s: string): string {
  return sansAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slug lisible d'une carte, sans son id :
 *   dragon-blanc-aux-yeux-bleus-mama-ultra-fr-1ere-edition-psa-10
 * L'unicite est assuree par `indexerSlugs`, qui suffixe les collisions.
 */
export function slugDeCarte(c: Card): string {
  const bouts = [c.nom, c.set, c.rarete, c.lang];
  if (c.is_1st) bouts.push("1ere edition");
  if (c.grade) bouts.push(`${c.grade_org ?? "grade"} ${c.grade}`);
  return bouts.map(morceau).filter(Boolean).join("-");
}

/**
 * Construit la table slug -> carte. Deux exemplaires identiques produisent le
 * meme slug de base : on suffixe -2, -3... dans l'ordre des id, pour que le
 * slug d'une carte donnee ne change jamais d'un build a l'autre.
 */
export const indexerSlugs = cache(async (): Promise<Map<string, Card>> => {
  const cards = await getCards();
  const parBase = new Map<string, Card[]>();
  for (const c of cards) {
    const base = slugDeCarte(c);
    const liste = parBase.get(base);
    if (liste) liste.push(c);
    else parBase.set(base, [c]);
  }
  const index = new Map<string, Card>();
  for (const [base, liste] of parBase) {
    liste.sort((a, b) => String(a.id).localeCompare(String(b.id), "en", { numeric: true }));
    liste.forEach((c, i) => index.set(i === 0 ? base : `${base}-${i + 1}`, c));
  }
  return index;
});

export async function carteParSlug(slug: string): Promise<Card | undefined> {
  return (await indexerSlugs()).get(slug);
}

/** Slug d'une carte, tel qu'il figure reellement dans l'index (suffixe compris). */
export async function slugCanonique(c: Card): Promise<string> {
  for (const [slug, carte] of await indexerSlugs()) {
    if (carte === c || String(carte.id) === String(c.id)) return slug;
  }
  return slugDeCarte(c);
}

// ─── Tri et filtres partages ────────────────────────────────────────────────

/**
 * Ordre par defaut du catalogue : la valeur d'abord. Le prix prime sur tout —
 * une non gradee a 5 000 EUR passe devant une Pop 1 a 200 EUR. Grade et pop
 * ne departagent qu'a prix egal.
 */
export function trierParValeur(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const pa = a.prix ?? -1;
    const pb = b.prix ?? -1;
    if (pa !== pb) return pb - pa;
    const ga = a.grade ? parseFloat(a.grade) : -1;
    const gb = b.grade ? parseFloat(b.grade) : -1;
    if (ga !== gb) return gb - ga;
    const popa = a.pop ?? 99;
    const popb = b.pop ?? 99;
    if (popa !== popb) return popa - popb;
    return a.nom.localeCompare(b.nom, "fr");
  });
}

/** Une carte vendue reste au catalogue : elle garde son referencement. */
export const estVendue = (c: Card) => c.status === "sold";
export const estGradee = (c: Card) => Boolean(c.grade);

const LANGUES_JP = new Set(["JP", "JAP", "JA"]);
export const estJaponaise = (c: Card) => LANGUES_JP.has((c.lang || "").toUpperCase());

// ─── Listes pretes a afficher ───────────────────────────────────────────────

export type CarteListee = { slug: string; card: Card };

/** Toutes les cartes avec leur slug, triees par valeur decroissante. */
export const cartesAvecSlug = cache(async (): Promise<CarteListee[]> => {
  const index = await indexerSlugs();
  const liste = [...index.entries()].map(([slug, card]) => ({ slug, card }));
  const ordre = new Map(trierParValeur(liste.map((l) => l.card)).map((c, i) => [c, i]));
  return liste.sort((a, b) => (ordre.get(a.card) ?? 0) - (ordre.get(b.card) ?? 0));
});

/** Sets presents au catalogue, avec le nombre de cartes, du plus fourni au moins. */
export const setsDuCatalogue = cache(async (): Promise<{ set: string; n: number }[]> => {
  const cards = await getCards();
  const compte = new Map<string, number>();
  for (const c of cards) {
    if (c.set) compte.set(c.set, (compte.get(c.set) ?? 0) + 1);
  }
  return [...compte.entries()]
    .map(([set, n]) => ({ set, n }))
    .sort((a, b) => b.n - a.n || a.set.localeCompare(b.set));
});

// "Booster"/"Display" : residu du CSV source sur des produits scelles (pas
// des cartes individuelles) — n'a rien a faire dans un filtre de rarete.
const RARETES_EXCLUES = new Set(["Booster", "Display"]);

// Grosses raretes recherchees par les collectionneurs, mises en avant avant
// le reste (gold/commune/rare, moins pertinentes pour filtrer un catalogue
// de pieces rares) plutot qu'un tri alphabetique qui les noie.
const ORDRE_RARETES = [
  "Secret", "Ghost", "Ultimate", "Ultra", "Starlight",
  "Prismatic Secret Rare", "Secret Parallel", "Ultra Parallel", "Gold Secret",
];

/** Raretes presentes au catalogue, grosses raretes en tete. */
export const raretesDuCatalogue = cache(async (): Promise<string[]> => {
  const cards = await getCards();
  const presentes = new Set(cards.map((c) => c.rarete).filter((r): r is string => Boolean(r)));
  for (const r of RARETES_EXCLUES) presentes.delete(r);

  const rang = (r: string) => {
    const i = ORDRE_RARETES.indexOf(r);
    return i === -1 ? ORDRE_RARETES.length : i;
  };
  return [...presentes].sort((a, b) => rang(a) - rang(b) || a.localeCompare(b));
});
