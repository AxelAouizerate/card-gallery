// Classement des sets par ere narrative (celle diffusee a la sortie du set),
// pour les 4 onglets de navigation. Volontairement incomplet comme sets.ts :
// un set absent n'apparait dans aucun onglet plutot que d'etre mal classe.
export type Ere = "duel-monsters" | "gx" | "5ds" | "apres";

export const ERES: { id: Ere; nom: string; periode: string }[] = [
  { id: "duel-monsters", nom: "Yu-Gi-Oh! Duel Monsters", periode: "2002–2004" },
  { id: "gx", nom: "Yu-Gi-Oh! GX", periode: "2005–2008" },
  { id: "5ds", nom: "Yu-Gi-Oh! 5D's", periode: "2009–2011" },
  { id: "apres", nom: "Après 5D's", periode: "Zexal, Arc-V, VRAINS…" },
];

const SETS_PAR_ERE: Record<Ere, string[]> = {
  "duel-monsters": [
    "LOB", "LDD", "LDD-F", "MRD", "SRL", "SDP", "SDP-F", "LOD", "PGD", "MFC",
    "DCR", "IOC", "AST", "RDS", "SOD",
  ],
  gx: [
    "FET", "TLM", "CDIP", "EEN", "EOJ", "SOI", "CRV", "CSOC", "GLAS", "TAEV",
    "POTD", "RGBT", "ANPR", "FOTB", "TDGS", "STON", "PTDN", "LODT", "CRMS",
    "LCGX",
  ],
  "5ds": [
    "SOVR", "ABPF", "STBL", "DREV", "TSHD", "STOR", "EXVC", "CDIP",
  ],
  apres: [
    "GENF", "ORCS", "PHSW", "GAOV", "ABYR", "CBLZ", "LTGY", "JOTL", "SHSP",
    "LVAL", "PRIO", "DUEA", "CORE", "NECH", "DOCS", "BLAR", "BLCR", "BLMR",
    "BLVO", "CBLZ",
  ],
};

const CODE_VERS_ERE = new Map<string, Ere>();
for (const [ere, codes] of Object.entries(SETS_PAR_ERE) as [Ere, string[]][]) {
  for (const code of codes) CODE_VERS_ERE.set(code, ere);
}

function sansSuffixeLangue(code: string): string {
  return code.replace(/-(JP|EN|FR|KR|C)$/, "");
}

export function ereDuSet(code: string | null | undefined): Ere | null {
  if (!code) return null;
  return CODE_VERS_ERE.get(code) ?? CODE_VERS_ERE.get(sansSuffixeLangue(code)) ?? null;
}

export function setsDeLere(ere: Ere): string[] {
  return SETS_PAR_ERE[ere];
}
