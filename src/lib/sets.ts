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
};

export function nomSet(code: string | null | undefined): string {
  if (!code) return "";
  return NOMS_SETS[code] ?? code;
}

export function libelleSet(code: string | null | undefined): string {
  if (!code) return "";
  const nom = NOMS_SETS[code];
  return nom ? `${nom} (${code})` : code;
}
