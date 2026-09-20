import { cache } from "react";
import { cartesAvecSlug, type CarteListee } from "@/lib/catalogue";

// Listes d'ids tenues a la main, une par grosse reception annoncee sur la
// banderole d'accueil (BandeauEvenements) - permet a la fois de cliquer la
// banderole pour voir les cartes concernees et de les faire apparaitre dans
// Nouveautes, sans dupliquer la liste a deux endroits. A completer a chaque
// nouvelle reception - demande d'Axel du 2026-09-20.
export const IDS_RECEPTION_CCC = ["A03", "A05", "A08", "A14", "A16", "A18", "1206"];
export const IDS_RECEPTION_COLLECTAURA = [
  "A07", "A15", "A06", "A19", "A02", "1207", "A01", "A13", "A17", "A09",
];

export const cartesReceptionCCC = cache(async (): Promise<CarteListee[]> => {
  const toutes = await cartesAvecSlug();
  return toutes.filter((c) => IDS_RECEPTION_CCC.includes(String(c.card.id)));
});

export const cartesReceptionCollectAura = cache(async (): Promise<CarteListee[]> => {
  const toutes = await cartesAvecSlug();
  return toutes.filter((c) => IDS_RECEPTION_COLLECTAURA.includes(String(c.card.id)));
});
