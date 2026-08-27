import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesAvecSlug, estGradee } from "@/lib/catalogue";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITRE = "Cartes Yu-Gi-Oh! gradées — PSA, CCC, CollectAura";
const CHAPO = "Toutes nos cartes gradées, note et organisme affichés : PSA, CCC, CollectAura. Coques scellées, populations basses, dont des Pop 1 uniques à leur grade et au-dessus.";
const BASE = "/cartes/gradees";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const url = `${SITE_URL}$/cartes/gradees` + (p > 1 ? `?page=${p}` : "");
  return {
    title: `$"Cartes Yu-Gi-Oh! gradées — PSA, CCC, CollectAura"${p > 1 ? ` — page ${p}` : ""} | ${SITE_NAME}`,
    description: CHAPO,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: TITRE, description: CHAPO, locale: "fr_FR" },
  };
}

export default async function Page({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const toutes = await cartesAvecSlug();
  const cartes = toutes.filter((c) => estGradee(c.card));
  return (
    <PageCatalogue
      titre={TITRE}
      chapo={CHAPO}
      cartes={cartes}
      base={BASE}
      page={Math.max(1, Number(page) || 1)}
      filAriane={[
        { nom: "Accueil", url: SITE_URL },
        { nom: "Cartes", url: `${SITE_URL}/cartes` },
        { nom: "Gradées", url: `${SITE_URL}/cartes/gradees` },
      ]}
    />
  );
}
