// Ordre chronologique de sortie des sets Yu-Gi-Oh (du plus ancien au plus
// recent), pour le tri "Date de sortie" du catalogue - demande d'Axel du
// 2026-10-10. Repris du classement deja etabli dans build_dotb_csv.py
// (verifie a l'usage pour les imports dotb), complete de quelques codes
// courants absents de cette liste d'origine (CT1-CT9, DP/TP/WC...).
//
// Volontairement incomplet, comme sets.ts/eres.ts : un set absent de cette
// liste n'est pas mal classe, il tombe juste en fin de tri (date inconnue)
// plutot que d'etre place au hasard.
const _ORDRE: string[] = [
  // --- Avant LODT (ere Duel Monsters), du plus ancien au plus recent ---
  "ldd", "lob", "ct1", "mdm", "mrd", "mr", "mrl", "psv", "pg", "ct2",
  "lon", "lod", "ldc", "ct3", "pgd", "mfc", "ct4", "dcr", "ioc", "ct5",
  "ast", "sod", "rds", "ct6", "fet", "tlm", "crv", "ct7", "een", "soi",
  "eoj", "ct8", "potd", "cdip", "ston", "ct9", "fotb", "taev", "glas", "ptdn",

  // --- Mainline 5D's ---
  "lodt", "tdgs", "csoc", "crms", "rgbt", "anpr", "sovr", "abpf", "tshd",
  "drev", "stbl", "stor", "exvc",

  // --- Mainline Zexal ---
  "genf", "phsw", "orcs", "gaov", "redu", "abyr", "cblz", "ltgy", "jotl",
  "numh", "shsp", "lval", "prio", "duea", "nech",

  // --- Mainline Arc-V ---
  "sece", "cros", "core", "docs", "bosh", "shvi", "tdil", "inov", "rate", "macr",

  // --- Mainline VRAINS ---
  "cotd", "cibr", "exfo", "flod", "cyho", "sofu", "sast", "dane", "rira", "chim",

  // --- SEVENS / Go Rush ---
  "igas", "etco", "rotd", "phra", "blvo", "liov", "dama", "bach",

  // --- Recents / Rarity Collection ---
  "blmr", "batl", "pots", "poch", "ra01", "ra02", "ra03", "dasa", "dabl",

  // --- Sets lateraux post-LODT (ordre interne moins certain) ---
  "pgld", "ztin", "mp14", "mp15", "mp16", "mp17",
  "bp01", "bp02", "bp03", "bpw", "bpt",
  "ha01", "ha02", "ha03", "ha04", "ha05", "ha06", "ha07",
  "duov", "dpct", "dpcr", "dpkb", "dpyg",
  "dp1", "dp04", "dp06", "dp08", "dp21", "dp22",
  "tp1", "tp5", "tp7", "tp8",
  "wc4", "wc5", "wc07",
  "rp01", "rp02",
  "pp01", "pp02",
  "lc5d", "lcgx", "lcjw", "lcyw", "lart", "dlcs", "wgrt",
  "sp13", "sp14", "sp15", "sp17", "sp18",
  "ap01", "ap02", "ap03", "ap04", "ap05", "ap06", "ap07", "ap08",
  "ct11", "ct12", "ct13", "ct14", "ct15", "ct16",
];

const RANG = new Map<string, number>(_ORDRE.map((code, i) => [code, i]));

function sansSuffixe(code: string): string {
  return (code || "")
    .toLowerCase()
    .trim()
    .replace(/-(jp|en|fr|f|c|kr|de|it|sp|25|se\d?|frse\d?)$/, "");
}

/** Rang chronologique (0 = le plus ancien), ou null si le set est inconnu
 * de cette liste - ne pas deviner, le tri le place alors en dernier. */
export function rangSortie(set: string | null | undefined): number | null {
  if (!set) return null;
  const c = sansSuffixe(set);
  return RANG.get(c) ?? null;
}
