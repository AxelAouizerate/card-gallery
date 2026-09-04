// Libelles lisibles des etats bruts (Google Sheet ou derives d'un grade).
const ETAT_LABELS: Record<string, string> = {
  "GEM MINT": "Gem Mint",
  "MINT": "Mint",
  "MINT+": "Mint+",
  "NM": "Near Mint",
  "NM+": "Near Mint+",
  "NM-": "Near Mint-",
  "EX": "Excellent",
  "EX+": "Excellent+",
  "EX-": "Excellent-",
  "EXC": "Excellent",
  "EXC+": "Excellent+",
  "EXC++": "Excellent++",
  "EXC-": "Excellent-",
  "LP": "Légèrement played",
  "LP+": "Légèrement played+",
  "LP-": "Légèrement played-",
  "GOOD": "Bon",
  "GOOD+": "Bon+",
  "GOOD++": "Bon++",
  "GOOD-": "Bon-",
  "PL": "Played",
  "PL+": "Played+",
  "PL-": "Played-",
  "PLAYED": "Played",
  "POOR": "Très played",
  "SCELLÉ": "Scellé",
};

export function libelleEtat(etat?: string | null): string {
  if (!etat) return "";
  return ETAT_LABELS[etat] ?? etat;
}
