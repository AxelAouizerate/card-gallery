export type CardStatus = "available" | "photo_pending" | "coming_soon" | "sold";

export type Card = {
  id: number;
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
  reserve: boolean;
  prix: number | null;
  status: CardStatus;
  statut_raw: string;
  photo_1: string | null;
  photo_2: string | null;
  // ISO date (YYYY-MM-DD) - 1ere apparition de la carte dans cards.json.
  // Sert au badge "NEW" et au filtre "nouvelles arrivees" (< 14 jours).
  first_seen?: string;
  // Vendeur proprietaire de la carte (onglet du Google Sheet : Axel/Marvin/Quentin).
  // Sert au bouton "Acheter via Instagram" (mapping vendeur -> compte dans lib/site.ts).
  vendeur?: string | null;
};

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
