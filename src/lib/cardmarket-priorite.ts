/**
 * Classement des alertes "wants" CardMarket par priorite, pour le recap mail
 * toutes les 2h - regles donnees par Axel le 2026-09-30, affinees le meme
 * jour :
 *   - prix (deja en place) : >=500e tres grosse, 100-499e grosse, sinon basse
 *   - EN PLUS, quel que soit le prix, passent en priorite haute : Lv.X (non
 *     japonaises - non detectable depuis le mail d'alerte, donc applique a
 *     toutes les Lv.X pour l'instant, cf. limite ci-dessous), les "gros"
 *     Pokemon tres apprecies, les Gold Star, les LEGEND, le cristal
 *     Skyridge/Aquapolis, les brillantes Neo Destiny/Revelation, le Base
 *     Set Shadowless.
 *   - Les Pokemon moyennement/plutot bien apprecies (Salamence, Gardevoir,
 *     ...) montent au moins en priorite moyenne ("grosse"), pas haute.
 *   - PAS de regle automatique pour les "ex" du bloc EX (2003-2007) : un
 *     Pokemon peu appecie en ex (Magmar, Magby, Electrode...) reste une
 *     petite carte. Seule la popularite du Pokemon compte, ex ou pas.
 *
 * Limite connue : le mail d'alerte CardMarket ne donne que le nom de la
 * carte + le lien produit, jamais la langue d'impression ni la rarete
 * exacte. Les regles "Lv.X non japonaises", "promos tres rares" et
 * "Shadowless" sont donc des approximations best-effort sur le texte
 * disponible - a affiner si des faux positifs/negatifs reviennent.
 */

export type Priorite = "tres_grosse" | "grosse" | "basse";

// Pokemon tres recherches : priorite haute quelle que soit la rarete/le prix.
const POKEMON_TRES_APPRECIES = [
  // Noms francais (les alertes Pokemon sont le plus souvent en FR)
  "dracaufeu", "tortank", "florizarre", "leviator", "dracolosse", "ronflex",
  "psykokwak", "mudkip", "torchic", "noctali", "mentali",
  // Noms communs FR/EN identiques ou quasi
  "mewtwo", "mew", "latios", "latias", "deoxys", "rayquaza", "ectoplasma",
  "pikachu", "arbok", "suicune", "raikou", "entei", "lugia",
  // Variantes anglaises (certaines alertes utilisent le nom EN meme en FR)
  "charizard", "blastoise", "venusaur", "gyarados", "dragonite", "snorlax",
  "psyduck", "umbreon", "espeon", "ho-oh", "ho oh", "hooh",
];

// Pokemon moyennement/plutot bien apprecies : priorite moyenne ("grosse")
// minimum, pas haute - liste a completer au fil de l'eau (demande d'Axel
// du 2026-09-30, exemples donnes : Salamence/Drattak, Gardevoir).
const POKEMON_MOYENNEMENT_APPRECIES = [
  "salamence", "drattak", "gardevoir",
];

export function classifierAlerte(nomCarte: string, url: string, prix: number | null): Priorite {
  const n = nomCarte.toLowerCase();
  const u = url.toLowerCase();

  const isLvX = /\blv\.?\s*x\b/.test(n);
  const isTresApprecie = POKEMON_TRES_APPRECIES.some((p) => n.includes(p));
  const isMoyennementApprecie = POKEMON_MOYENNEMENT_APPRECIES.some((p) => n.includes(p));
  const isGoldStar = n.includes("gold star");
  const isLegend = n.includes("legend") || n.includes("légende");
  const isCristal = u.includes("skyridge") || u.includes("aquapolis");
  const isNeoBrillante = u.includes("neo-destiny") || u.includes("neo-revelation");
  const isShadowless = u.includes("base-set") && n.includes("shadowless");
  const isPromoTresRare = u.includes("-promos");

  const forcePrioriteHaute =
    isLvX || isTresApprecie || isGoldStar || isLegend || isCristal || isNeoBrillante || isShadowless;

  if (forcePrioriteHaute || (prix != null && prix >= 500)) return "tres_grosse";
  if (isMoyennementApprecie || isPromoTresRare || (prix != null && prix >= 100)) return "grosse";
  return "basse";
}
