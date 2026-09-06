import type { Card } from "@/lib/cards";

export type CategorieId = "sets-iconiques" | "ghost" | "ultimate" | "introuvables";

// Metadonnees d'affichage (utilisables cote client, pas de fonction dedans)
// + filtre (cote serveur uniquement) pour chacune des 4 pages categorielles.
// Reutilise par VignettesCategories (accueil) et NavCategorieCroisee (pages).
export const CATEGORIES_META: { id: CategorieId; titre: string; photo: string | null }[] = [
  { id: "sets-iconiques", titre: "Sets iconiques", photo: "/img/Q03.jpg" },
  { id: "ghost", titre: "Ghost Rare", photo: "/img/tdgs-fr040-g.jpg" },
  { id: "ultimate", titre: "Ultimate Rare", photo: "/img/1081_1.jpg" },
  { id: "introuvables", titre: "Sets introuvables", photo: "/img/dcr-fr016-g.jpg" },
];

const SETS_ICONIQUES = ["LDD-F", "MRD", "MDM", "SDP-F"];
// LDC/DCR entiers (deja rares en soi) + trois gros sets uniquement en 1ere
// edition (les tirages ulterieurs de TDGS/LDD-F/CSOC sont bien plus
// courants) — precision d'Axel du 2026-09-06.
const SETS_INTROUVABLES = ["LDC", "DCR"];
const SETS_INTROUVABLES_1ERE_ED = ["TDGS", "LDD-F", "CSOC"];

export function filtreCategorieSpeciale(id: CategorieId, c: Card): boolean {
  switch (id) {
    case "sets-iconiques":
      return SETS_ICONIQUES.includes(c.set);
    case "ghost":
      return c.rarete === "Ghost";
    case "ultimate":
      return c.rarete === "Ultimate";
    case "introuvables":
      return (
        SETS_INTROUVABLES.includes(c.set) ||
        (SETS_INTROUVABLES_1ERE_ED.includes(c.set) && Boolean(c.is_1st))
      );
  }
}
