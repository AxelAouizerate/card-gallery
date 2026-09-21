export type CardStatus = "available" | "photo_pending" | "coming_soon" | "sold";

export type Card = {
  // Alphanumerique : "504" ou "A21" (serie A = entree en stock depuis aout 2026)
  id: string;
  nom: string;
  set: string;
  rarete: string;
  lang: string;
  etat: string;
  is_1st: boolean;
  grade: string | null;
  grade_org: string | null;
  // Population chez le grader (nb de cartes gradées à ce grade) -> badge "Pop N".
  // Notable surtout pour pop 1 (unique) et pop 2. null/absent si inconnu.
  pop?: number | null;
  // Type de produit : "carte" (défaut), "display" ou "booster".
  produit?: string;
  reserve: boolean;
  prix: number | null;
  status: CardStatus;
  statut_raw: string;
  photo_1: string | null;
  photo_2: string | null;
  // Courte video de presentation (quelques secondes), optionnelle - demande
  // d'Axel du 2026-09-20. Meme repo/proxy que les photos (/img/...).
  video?: string | null;
  // ISO date (YYYY-MM-DD) - 1ere apparition de la carte dans cards.json.
  // Sert au badge "NEW" et au filtre "nouvelles arrivees" (< 14 jours).
  first_seen?: string;
  // ISO date (YYYY-MM-DD) - jour ou le statut est passe a "sold". Sert
  // uniquement au delai de courtoisie ci-dessous (voir estVendueEtDemotee) ;
  // le badge/bandeau "Vendue" affiche par ailleurs reste immediat des que
  // status="sold", peu importe cette date.
  sold_date?: string | null;
  // Vendeur proprietaire de la carte (onglet du Google Sheet : Axel/Marvin/Quentin).
  // Sert au bouton "Acheter via Instagram" (mapping vendeur -> compte dans lib/site.ts).
  vendeur?: string | null;
  // true = a afficher dans la section "Lots" de l'accueil (bundle de
  // plusieurs boosters/cartes vendu en un seul lot) - demande d'Axel du
  // 2026-09-21.
  est_lot?: boolean;
};

export type Jeu = "yugioh" | "pokemon";

// Le catalogue n'a pas de champ "jeu" : on le deduit du set.
// Le Yu-Gi-Oh est le defaut, on ne liste donc que les sets Pokemon.
// AJOUTER ICI tout nouveau set Pokemon (comparaison sans accents ni casse).
export const SETS_POKEMON = new Set([
  "aquapolis",
  "call of legends",
  "dragons",
  "eveil des legendes",
  "bw promos",
  "bw promo",
]);

function sansAccents(s: string): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Jeu auquel appartient la carte, deduit de son set. */
export function jeuDeLaCarte(c: Card): Jeu {
  return SETS_POKEMON.has(sansAccents(c.set)) ? "pokemon" : "yugioh";
}

// Groupe de sets "bey". Regroupe toutes les variantes de langue d'un même set
// (LDD-F, TLM-JP, SDP-F -> sdp, ...). "sdp" = base de SDP-F après strip régional.
export const BEY_SET_CODES = new Set([
  "ldd", "lob", "mdm", "mrd", "lod", "ldc",
  "pgd", "mfc", "sdp",
  "tlm", "crv", "een", "soi", "eoj", "potd", "ston", "fotb", "taev", "glas", "ptdn",
]);

/** Code de set sans le suffixe régional (LDD-F -> ldd, TLM-JP -> tlm). */
export function setBaseCode(set: string): string {
  return (set || "").toLowerCase().replace(/[-\s](f|fr|en|jp|jap|kr|de|it|sp|c|25|2014)$/, "");
}

/** true si la carte appartient au groupe de sets "bey". */
export function isBeySet(set: string): boolean {
  return BEY_SET_CODES.has(setBaseCode(set));
}

export const BEY_FILTER_VALUE = "bey";

const NEW_WINDOW_DAYS = 14;

/** Renvoie true si la carte est dans la fenetre "nouvelles arrivees" (< 14j). */
export function isNewArrival(c: Card, now: Date = new Date()): boolean {
  if (!c.first_seen) return false;
  const seen = new Date(c.first_seen + "T00:00:00Z");
  if (isNaN(seen.getTime())) return false;
  const ageMs = now.getTime() - seen.getTime();
  return ageMs >= 0 && ageMs <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

const DELAI_COURTOISIE_VENTE_JOURS = 2;

/**
 * true si une carte vendue doit deja disparaitre des selections
 * (Nouveautes/Pop1) et tomber en fin de tri. Le badge/bandeau "Vendue" reste
 * lui immediat des que status="sold" - seul le PLACEMENT est retarde, via
 * `sold_date`, a la demande ponctuelle d'Axel pour une carte a la fois
 * (jamais automatique sans cette date) - ex: Shinato vendu le 2026-09-21,
 * garde en position normale jusqu'au 2026-09-23.
 */
export function estVendueEtDemotee(c: Card, now: Date = new Date()): boolean {
  if (c.status !== "sold") return false;
  if (!c.sold_date) return true;
  const vendue = new Date(c.sold_date + "T00:00:00Z");
  if (isNaN(vendue.getTime())) return true;
  const ageMs = now.getTime() - vendue.getTime();
  return ageMs >= DELAI_COURTOISIE_VENTE_JOURS * 24 * 60 * 60 * 1000;
}

export async function loadCards(): Promise<Card[]> {
  // Static JSON in /public, loaded at build time on the server
  const res = await fetch(
    process.env.NODE_ENV === "production"
      ? "/cards.json"
      : "http://localhost:3000/cards.json",
    { cache: "force-cache" }
  );
  return res.json();
}
