import type { Card } from "@/lib/cards";

export type CategorieId = "sets-iconiques" | "ghost" | "ultimate" | "introuvables";

// Metadonnees d'affichage (utilisables cote client, pas de fonction dedans)
// + filtre (cote serveur uniquement) pour chacune des 4 pages categorielles.
// Reutilise par VignettesCategories (accueil), NavCategorieCroisee et le
// chapo de chaque page (PageCategorieSpeciale) - description "legendaire"
// demandee par Axel le 2026-09-07, 2 lignes max.
export const CATEGORIES_META: { id: CategorieId; titre: string; photo: string | null; description: string }[] = [
  {
    id: "sets-iconiques",
    titre: "Sets iconiques",
    photo: "/img/Q03.jpg",
    description: "Les sets fondateurs de Yu-Gi-Oh! — LDD, MRD, MDM, SDP-F — là où la légende a commencé. Des reliques d'origine, triées par valeur.",
  },
  {
    id: "ghost",
    titre: "Ghost Rare",
    photo: "/img/tdgs-fr040-g.jpg",
    description: "Une lueur spectrale gravée dans le métal : le Ghost Rare compte parmi les tirages les plus rares et recherchés du jeu. Un fantôme légendaire à posséder, trié par valeur.",
  },
  {
    id: "ultimate",
    titre: "Ultimate Rare",
    photo: "/img/1081_1.jpg",
    description: "Un relief sculpté à même la carte, réservé aux tirages d'exception. L'Ultimate Rare transforme chaque duel en pièce de collection, triée par valeur.",
  },
  {
    id: "introuvables",
    titre: "Sets introuvables",
    photo: "/img/dcr-fr016-g.jpg",
    description: "Des trésors que le temps a engloutis — LDC, DCR entiers et les 1ères éditions de TDGS, LDD-F, CSOC ont quasiment disparu du marché. Ici, la légende redevient accessible, triée par valeur.",
  },
];

const SETS_ICONIQUES = ["LDD-F", "MRD", "MDM", "SDP-F"];
// LDC/DCR entiers (deja rares en soi) + trois gros sets uniquement en 1ere
// edition (les tirages ulterieurs de TDGS/LDD-F/CSOC sont bien plus
// courants) — precision d'Axel du 2026-09-06.
const SETS_INTROUVABLES = ["LDC", "DCR"];
const SETS_INTROUVABLES_1ERE_ED = ["TDGS", "LDD-F", "CSOC"];

// Les cartes d'Axel sont francaises : dans cards.json, un meme set se
// retrouve parfois code en clair ("TDGS") et parfois avec le suffixe
// "-FR" ("TDGS-FR") — ce n'est pas un set different, juste une variation de
// saisie. On les fusionne. Le japonais ("-JP") reste en revanche un tirage
// distinct et ne doit jamais matcher — precision d'Axel du 2026-09-06.
function sansSuffixeFr(code: string): string {
  return code.endsWith("-FR") ? code.slice(0, -3) : code;
}

function memeSet(codeCarte: string, codesListe: string[]): boolean {
  const normalise = sansSuffixeFr(codeCarte);
  return codesListe.some((code) => sansSuffixeFr(code) === normalise);
}

export function filtreCategorieSpeciale(id: CategorieId, c: Card): boolean {
  switch (id) {
    case "sets-iconiques":
      return memeSet(c.set, SETS_ICONIQUES);
    case "ghost":
      return c.rarete === "Ghost";
    case "ultimate":
      return c.rarete === "Ultimate";
    case "introuvables":
      return (
        memeSet(c.set, SETS_INTROUVABLES) ||
        (memeSet(c.set, SETS_INTROUVABLES_1ERE_ED) && Boolean(c.is_1st))
      );
  }
}
