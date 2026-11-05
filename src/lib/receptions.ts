import { cache } from "react";
import { cartesAvecSlug, type CarteListee } from "@/lib/catalogue";

// Listes d'ids tenues a la main, une par grosse reception annoncee sur la
// banderole d'accueil (BandeauEvenements) - permet a la fois de cliquer la
// banderole pour voir les cartes concernees et de les faire apparaitre dans
// Nouveautes, sans dupliquer la liste a deux endroits. A completer a chaque
// nouvelle reception - demande d'Axel du 2026-09-20.
//
// Mise a jour 2026-11-05 : l'ancienne reception de septembre est en vente
// depuis plus d'un mois (plus la peine de la mettre en avant) - remplacee
// par le nouveau lot envoye en gradation le 04/11, identifie sur les photos
// deposees par Axel. Cartes "sold"/"coming_soon" en attente de retour.
export const IDS_RECEPTION_CCC = ["A06", "A15", "1116", "1216", "A97", "A98"];
export const IDS_RECEPTION_COLLECTAURA = ["A65", "1182", "A79", "1169", "A75", "A74"];

export const cartesReceptionCCC = cache(async (): Promise<CarteListee[]> => {
  const toutes = await cartesAvecSlug();
  return toutes.filter((c) => IDS_RECEPTION_CCC.includes(String(c.card.id)));
});

export const cartesReceptionCollectAura = cache(async (): Promise<CarteListee[]> => {
  const toutes = await cartesAvecSlug();
  return toutes.filter((c) => IDS_RECEPTION_COLLECTAURA.includes(String(c.card.id)));
});
