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
  prix: number | null;   // null = "Bientot en boutique"
  photo_1: string | null;
  photo_2: string | null;
};

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
