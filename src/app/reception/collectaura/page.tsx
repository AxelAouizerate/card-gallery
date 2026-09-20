import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesReceptionCollectAura } from "@/lib/receptions";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const BASE = "/reception/collectaura";
const TITRE = "Grosse réception CollectAura";
const CHAPO =
  "Réception confirmée : ces cartes sont gradées et au prix indiqué, les photos et vidéos arrivent très bientôt.";

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
  const cartes = await cartesReceptionCollectAura();
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
        { nom: "Réception CollectAura", url: `${SITE_URL}${BASE}` },
      ]}
    />
  );
}
