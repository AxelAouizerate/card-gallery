/**
 * Classement des alertes "wants" CardMarket par priorite, pour le recap mail
 * toutes les 2h - regles donnees par Axel le 2026-09-30 :
 *   - prix (deja en place) : >=500e tres grosse, 100-499e grosse, sinon basse
 *   - EN PLUS, quel que soit le prix, passent en priorite haute :
 *     Lv.X (non japonaises - non detectable depuis le mail d'alerte, donc
 *     applique a toutes les Lv.X pour l'instant, cf. limite ci-dessous),
 *     les "gros" Pokemon nommes, les Gold Star, les LEGEND, les EX du bloc
 *     EX (2003-2007), le cristal Skyridge/Aquapolis, les brillantes Neo
 *     Destiny/Revelation, le Base Set Shadowless.
 *
 * Limite connue : le mail d'alerte CardMarket ne donne que le nom de la
 * carte + le lien produit, jamais la langue d'impression ni la rarete
 * exacte. Les regles "Lv.X non japonaises", "promos tres rares" et
 * "Shadowless" sont donc des approximations best-effort sur le texte
 * disponible - a affiner si des faux positifs/negatifs reviennent.
 */

export type Priorite = "tres_grosse" | "grosse" | "basse";

const GROS_POKEMON = [
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

const EX_BLOCK_SETS = [
  "ex-ruby-sapphire", "ex-sandstorm", "ex-dragon", "ex-team-magma-vs-team-aqua",
  "ex-hidden-legends", "ex-firered-leafgreen", "ex-team-rocket-returns",
  "ex-deoxys", "ex-emerald", "ex-unseen-forces", "ex-delta-species",
  "ex-legend-maker", "ex-holon-phantoms", "ex-crystal-guardians",
  "ex-dragon-frontiers", "ex-power-keepers",
];

export function classifierAlerte(nomCarte: string, url: string, prix: number | null): Priorite {
  const n = nomCarte.toLowerCase();
  const u = url.toLowerCase();

  const isLvX = /\blv\.?\s*x\b/.test(n);
  const isGrosPokemon = GROS_POKEMON.some((p) => n.includes(p));
  const isGoldStar = n.includes("gold star");
  const isLegend = n.includes("legend") || n.includes("légende");
  const isExBlock = EX_BLOCK_SETS.some((s) => u.includes(s)) && /\bex\b/i.test(nomCarte);
  const isCristal = u.includes("skyridge") || u.includes("aquapolis");
  const isNeoBrillante = u.includes("neo-destiny") || u.includes("neo-revelation");
  const isShadowless = u.includes("base-set") && n.includes("shadowless");
  const isPromoTresRare = u.includes("-promos");

  const forcePrioriteHaute =
    isLvX || isGrosPokemon || isGoldStar || isLegend || isExBlock || isCristal || isNeoBrillante || isShadowless;

  if (forcePrioriteHaute || (prix != null && prix >= 500)) return "tres_grosse";
  if (isPromoTresRare || (prix != null && prix >= 100)) return "grosse";
  return "basse";
}
