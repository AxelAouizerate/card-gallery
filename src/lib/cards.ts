export type CardStatus = "available" | "photo_pending" | "coming_soon";

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
  reserve: boolean;
  prix: number | null;
  status: CardStatus;
  statut_raw: string;
  photo_1: string | null;
  photo_2: string | null;
  // ISO date (YYYY-MM-DD) - 1ere apparition de la carte dans cards.json.
  // Sert au badge "NEW" et au filtre "nouvelles arrivees" (< 14 jours).
  first_seen?: string;
};

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
