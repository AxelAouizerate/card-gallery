// Nom officiel des sets Yu-Gi-Oh, pour affichage "Nom (CODE)".
// Volontairement incomplet : seuls les codes dont le nom officiel est
// confirmé avec certitude sont ici. Un code absent de ce dictionnaire
// s'affiche tel quel (juste le code), sans rien inventer.
// Complete-le au fur et a mesure que de nouveaux codes sont confirmes.
export const NOMS_SETS: Record<string, string> = {
  // Extensions principales (booster sets), ere 2002-2015
  LOB: "Legend of Blue-Eyes White Dragon",
  "LDD-F": "Legend of Blue-Eyes White Dragon",
  LDD: "Legend of Blue-Eyes White Dragon",
  MRD: "Metal Raiders",
  SRL: "Spell Ruler",
  LOD: "Legacy of Darkness",
  PGD: "Pharaonic Guardian",
  MFC: "Magician's Force",
  DCR: "Dark Crisis",
  IOC: "Invasion of Chaos",
  AST: "Ancient Sanctuary",
  SOD: "Soul of the Duelist",
  RDS: "Rise of Destiny",
  FET: "Flaming Eternity",
  TLM: "The Lost Millennium",
  CDIP: "Cyberdark Impact",
  EEN: "Elemental Energy",
  SOVR: "Stardust Overdrive",
  ABPF: "Absolute Powerforce",
  STBL: "Starstrike Blast",
  DREV: "Duelist Revolution",
  TSHD: "The Shining Darkness",
  STOR: "Storm of Ragnarok",
  EXVC: "Extreme Victory",
  GENF: "Generation Force",
  ORCS: "Order of Chaos",
  PHSW: "Photon Shockwave",
  GAOV: "Galactic Overlord",
  ABYR: "Abyss Rising",
  CBLZ: "Cosmo Blazer",
  LTGY: "Lord of the Tachyon Galaxy",
  JOTL: "Judgment of the Light",
  SHSP: "Shadow Specters",
  LVAL: "Legacy of the Valiant",
  PRIO: "Primal Origin",
  DUEA: "Duelist Alliance",
  CORE: "Clash of Rebellions",
  CRMS: "Crimson Crisis",
  CRV: "Cybernetic Revolution",
  CSOC: "Crossroads of Chaos",
  GLAS: "Gladiator's Assault",
  TAEV: "Tactical Evolution",
  POTD: "Power of the Duelist",
  RGBT: "Raging Battle",
  ANPR: "Ancient Prophecy",
  FOTB: "Force of the Breaker",
  TDGS: "The Duelist Genesis",
  STON: "Strike of Neos",
  PTDN: "Phantom Darkness",
  LODT: "Light of Destruction",
  NECH: "The New Challengers",
  DOCS: "Dimension of Chaos",
  BLAR: "Battles of Legend: Armageddon",
  BLCR: "Battles of Legend: Crystal Revenge",
  RP01: "Retro Pack",
  RP02: "Retro Pack 2",
  EOJ: "Enemy of Justice",
  SOI: "Shadow of Infinity",
  IGAS: "Ignition Assault",
  SHVI: "Shining Victories",
  LON: "Labyrinth of Nightmare",
  BP01: "Battle Pack: Epic Dawn",

  // Confirmes par recherche le 2026-09-04
  LART: "The Lost Art Promotion",
  "SDP-F": "Pharaoh's Servant",
  LCYW: "Legendary Collection 3: Yugi's World Mega Pack",
  LCJW: "Legendary Collection 4: Joey's World Mega Pack",
  DPCT: "Duelist Pack Collection Tin",
  VJMP: "V Jump Promotional Cards",
  JUMP: "Shonen Jump Promotional Cards",
  PP01: "Premium Pack",
  PP02: "Premium Pack 2",
  CT1: "Collector's Tins 2004",
  CT2: "Collector's Tins 2005",
  CT3: "Collector's Tins 2006",
  CT03: "Collector's Tins 2006",
  CT4: "Collector's Tins 2007",
  CT04: "Collector's Tins 2007",
  CT05: "Collector's Tins 2008",
  CT06: "Collector's Tins 2009",
  CT08: "Collector's Tins 2011",
  CT09: "Collector's Tins 2012",

  // Ajoutes le 2026-10-29 (demande d'Axel)
  TP8: "Tournament Pack 8",
  BLTR: "Battles of Legend: Terminal Revenge",

  // Confirmes par recherche le 2026-10-13 (demande d'Axel : noms complets
  // dans les descriptions dotb). "C12" et "REPLICA" volontairement absents
  // - identite non confirmee avec certitude (REPLICA est un marquage de
  // reimpression utilise sur plusieurs produits differents, pas un set a
  // lui seul ; C12 ne correspond a aucun code Konami/Yugipedia trouve).
  "2018-JPP02": "World Championship 2018 Promos",
  "20DS": "20th Anniversary Duel Set (Obelisk the Tormentor)",
  BOSH: "Breakers of Shadow",
  CP03: "Champion Pack: Game Three",
  CP04: "Champion Pack: Game Four",
  DB2: "Dark Beginning 2",
  "DCR-25": "Dark Crisis (25th Anniversary Edition)",
  DP04: "Duelist Pack: Zane Truesdale",
  DP1: "Duelist Pack: Jaden Yuki",
  DR1: "Dark Revelation Volume 1",
  "EEN-FRSE": "Elemental Energy (Special Edition)",
  EP13: "Extra Pack: Sword of Knights",
  EX: "EX-R Starter Box",
  HA07: "Hidden Arsenal 7: Knight of Stars",
  LC5D: "Legendary Collection 5D's Mega Pack",
  LD10: "Legendary Duelists: Soulburning Volcano",
  LDC: "Labyrinth of Nightmare",
  LOCH: "Limit Over Collection: The Heroes",
  LOCR: "Limit Over Collection: The Rivals",
  MDM: "Spell Ruler",
  MRL: "Spell Ruler",
  NUMH: "Number Hunters",
  P3: "Premium Pack 3",
  PCJ: "Power of Chaos: Joey the Passion",
  PCY: "Power of Chaos: Yugi the Destiny",
  // Produit coreen distinct du "Premium Pack" (PP01) anglais/TCG malgre le
  // prefixe partage - entree exacte pour ne pas heriter du mauvais nom via
  // sansSuffixeLangue().
  "PP01-KR": "Premium Pack Vol.1 (Korean)",
  QCDB: "Quarter Century Duelist Box",
  RA01: "25th Anniversary Rarity Collection",
  ROD: "Rise of Destiny",
  SD7: "Structure Deck: Invincible Fortress",
  "SD8-KRDS1": "Structure Deck: Lord of the Storm (Korean)",
  TU03: "Turbo Pack: Booster Three",
  WC4: "World Championship Tournament 2004 Promos",
  WGRT: "War of the Giants Reinforcements",
  YDB1: "GX Card Almanac Promos",
  ZTIN: "Zexal Collection Tin",

  // Pokemon - confirmes par recherche le 2026-10-13
  AQUAPOLIS: "Aquapolis",
  "BW PROMOS": "Black & White Promos",
  "CALL OF LEGENDS": "Call of Legends",
  // Confiance moyenne : le code brut "DRAGONS" seul ne precise pas
  // l'extension exacte, Dragons Exalted est la meilleure correspondance
  // trouvee (carte Rayquaza EX) mais a verifier sur la carte si possible.
  DRAGONS: "Dragons Exalted",
  "EVEIL DES LÉGENDES": "Legends Awakened",
  "EX RUBIS ET SAPHIR": "EX Ruby & Sapphire",
  "SET DE BASE": "Base Set",
};

// "-JP"/"-EN"/"-FR"/"-F"/"-KR"/"-C" en suffixe = variante linguistique du meme
// set (ex: RDS-JP = Rise of Destiny, DDK-F = Duelist Deck Kaiba FR — les deux
// conventions ("-FR" et "-F") coexistent dans les donnees). On retombe dessus
// si le code exact n'est pas dans le dictionnaire, avant d'afficher le code brut.
function sansSuffixeLangue(code: string): string {
  return code.replace(/-(JP|EN|FR|KR|C|F)$/, "");
}

export function nomSet(code: string | null | undefined): string {
  if (!code) return "";
  return NOMS_SETS[code] ?? NOMS_SETS[sansSuffixeLangue(code)] ?? code;
}

export function libelleSet(code: string | null | undefined): string {
  if (!code) return "";
  const nom = NOMS_SETS[code] ?? NOMS_SETS[sansSuffixeLangue(code)];
  return nom ? `${nom} (${code})` : code;
}
