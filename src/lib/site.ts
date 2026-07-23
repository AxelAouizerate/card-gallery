// Constantes du site, partagees par le layout, le sitemap, robots et les
// donnees structurees (JSON-LD). Source unique de verite pour le SEO.

export const SITE_URL = "https://horuscards.fr";
export const SITE_NAME = "horuscards";

// Emails proprietaires (acces /stats). Liste separee par des virgules via
// STATS_OWNER_EMAIL (Vercel). Defaut : les deux comptes connus du proprio.
export function ownerEmails(): string[] {
  return (process.env.STATS_OWNER_EMAIL || "axel.ate3@gmail.com,wols918wols@gmail.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return ownerEmails().includes(email.toLowerCase());
}

export const SITE_DESCRIPTION =
  "horuscards — boutique française de cartes Yu-Gi-Oh! à l'unité en français, anglais et japonais : raretés secret/ultimate/ghost rare, 1ère édition, cartes gradées CCC/PSA/CollectAura et pièces très rares dont des Pop 1. Magicien sombre, dragon blanc aux yeux bleus, néos… Pour duellistes et collectionneurs. Photos sur demande, lots négociables, envoi rapide et protégé partout en France.";

// Mots-cles orientes acheteurs francophones (joueurs + collectionneurs).
export const SITE_KEYWORDS = [
  // Jeu / génériques
  "Yu-Gi-Oh", "YuGiOh", "YGO", "cartes Yu-Gi-Oh", "cartes à collectionner", "TCG", "JCC",
  "carte magic yugioh", "deck yugioh", "duelliste", "collectionneur",
  // Langue / rareté (français, anglais, japonais)
  "cartes Yu-Gi-Oh françaises", "édition française", "carte FR", "carte française",
  "carte anglaise", "carte EN", "carte japonaise", "carte JP", "carte rare française",
  "1ère édition", "premiere edition", "secret rare", "ultimate rare", "ghost rare",
  "quarter century secret rare", "carte OCG", "import japonais", "Pop 1", "pop 1 yugioh",
  // Cartes / archétypes recherchés
  "magicien sombre", "dragon blanc aux yeux bleus", "blue-eyes white dragon",
  "néos", "héros élémentaire", "dieux égyptiens", "exodia", "yubel", "cyber dragon",
  // Gradation
  "carte gradée", "gradation", "PSA", "CCC", "CollectAura", "PCA",
  // Achat
  "acheter cartes yugioh", "boutique cartes yugioh", "vente carte yugioh",
  "carte yugioh pas cher", "carte yugioh collector", "boutique en ligne France",
];

// Les trois vendeurs. La clé est un CODE NEUTRE (s1/s2/s3) — jamais le vrai
// prénom — pour ne pas exposer d'info personnelle dans les données servies au
// navigateur. Elle doit correspondre à la valeur `vendeur` des cartes.
// `vinted` = page Vinted du vendeur : l'achat se fait indirectement là-bas
// (on ne paie pas sur le site). `instagram` reste optionnel (bouton masqué si vide).
export const SELLERS: Record<string, { instagram: string; vinted: string }> = {
  s1: { instagram: "horuscards_", vinted: "https://www.vinted.com/member/241859388" },
  s2: { instagram: "marvinyugi", vinted: "https://www.vinted.com/member/59915583" },
  s3: { instagram: "sr4madrid", vinted: "https://www.vinted.com/member/33433064" },
};

/** URL du compte Instagram du vendeur, ou null si vendeur inconnu / handle non renseigné. */
export function sellerInstagramUrl(vendeur?: string | null): string | null {
  if (!vendeur) return null;
  const key = Object.keys(SELLERS).find((k) => k.toLowerCase() === vendeur.toLowerCase());
  const handle = key ? SELLERS[key].instagram.trim().replace(/^@/, "") : "";
  return handle ? `https://www.instagram.com/${handle}/` : null;
}

/** URL de la page Vinted du vendeur, ou null si vendeur inconnu / non renseigné. */
export function sellerVintedUrl(vendeur?: string | null): string | null {
  if (!vendeur) return null;
  const key = Object.keys(SELLERS).find((k) => k.toLowerCase() === vendeur.toLowerCase());
  const url = key ? SELLERS[key].vinted.trim() : "";
  return url || null;
}
