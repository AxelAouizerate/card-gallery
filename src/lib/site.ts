// Constantes du site, partagees par le layout, le sitemap, robots et les
// donnees structurees (JSON-LD). Source unique de verite pour le SEO.

export const SITE_URL = "https://horuscards.fr";
export const SITE_NAME = "horuscards";

export const SITE_DESCRIPTION =
  "horuscards — boutique française de cartes Yu-Gi-Oh! à l'unité : éditions FR rares et inédits, magicien sombre, dragon blanc aux yeux bleus, néos, cartes gradées CCC/PSA/CollectAura, 1ère édition, secret/ultimate/ghost rare. Pour duellistes et collectionneurs. Photos sur demande, lots négociables, envoi rapide et protégé partout en France.";

// Mots-cles orientes acheteurs francophones (joueurs + collectionneurs).
export const SITE_KEYWORDS = [
  // Jeu / génériques
  "Yu-Gi-Oh", "YuGiOh", "YGO", "cartes Yu-Gi-Oh", "cartes à collectionner", "TCG", "JCC",
  "carte magic yugioh", "deck yugioh", "duelliste", "collectionneur",
  // Langue / rareté (cœur de cible FR)
  "cartes Yu-Gi-Oh françaises", "édition française", "carte FR", "carte française",
  "carte inédite", "inédit français", "exclusivité française", "carte rare française",
  "1ère édition", "premiere edition", "secret rare", "ultimate rare", "ghost rare",
  "quarter century secret rare", "carte OCG", "import japonais",
  // Cartes / archétypes recherchés
  "magicien sombre", "dragon blanc aux yeux bleus", "blue-eyes white dragon",
  "néos", "héros élémentaire", "dieux égyptiens", "exodia", "yubel", "cyber dragon",
  // Gradation
  "carte gradée", "gradation", "PSA", "CCC", "CollectAura", "PCA",
  // Achat
  "acheter cartes yugioh", "boutique cartes yugioh", "vente carte yugioh",
  "carte yugioh pas cher", "carte yugioh collector", "boutique en ligne France",
];

// Les trois vendeurs (= les 3 onglets du Google Sheet). La clé doit
// correspondre à la valeur `vendeur` des cartes (nom de l'onglet).
// `vinted` = page Vinted du vendeur : l'achat se fait indirectement là-bas
// (on ne paie pas sur le site). `instagram` reste optionnel (bouton masqué si vide).
export const SELLERS: Record<string, { instagram: string; vinted: string }> = {
  Axel: { instagram: "", vinted: "https://www.vinted.com/member/241859388" },
  Marvin: { instagram: "", vinted: "https://www.vinted.com/member/59915583" },
  Quentin: { instagram: "", vinted: "https://www.vinted.com/member/33433064" },
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
