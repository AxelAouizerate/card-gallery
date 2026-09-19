import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesScellees } from "@/lib/catalogue";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const BASE = "/cartes/scelle";
const TITRE = "Produits scellés à l'unité";
const CHAPO = "Boosters, displays et autres produits scellés disponibles chez horuscards, triés par valeur.";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const url = `${SITE_URL}${BASE}` + (p > 1 ? `?page=${p}` : "");
  return {
    title: `${TITRE}${p > 1 ? ` — page ${p}` : ""} | ${SITE_NAME}`,
    description: CHAPO,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: TITRE, description: CHAPO, locale: "fr_FR" },
  };
}

export default async function Page({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const cartes = await cartesScellees();
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
        { nom: "Scellé", url: `${SITE_URL}${BASE}` },
      ]}
    />
  );
}
