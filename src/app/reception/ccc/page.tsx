import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesReceptionCCC } from "@/lib/receptions";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const BASE = "/reception/ccc";
const TITRE = "Réception à venir CCC";
const CHAPO = "6 cartes envoyées en gradation chez CCC, de retour prochainement.";

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}${BASE}`;
  return {
    title: `${TITRE} | ${SITE_NAME}`,
    description: CHAPO,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: TITRE, description: CHAPO, locale: "fr_FR" },
  };
}

export default async function Page() {
  const cartes = await cartesReceptionCCC();
  return (
    <PageCatalogue
      titre={TITRE}
      chapo={CHAPO}
      cartes={cartes}
      base={BASE}
      page={1}
      filAriane={[
        { nom: "Accueil", url: SITE_URL },
        { nom: "Cartes", url: `${SITE_URL}/cartes` },
        { nom: "Réception CCC", url: `${SITE_URL}${BASE}` },
      ]}
    />
  );
}
