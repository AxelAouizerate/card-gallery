import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesAvecSlug } from "@/lib/catalogue";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITRE = "Cartes Yu-Gi-Oh! 1ère édition";
const CHAPO = "Les 1ères éditions du catalogue, toutes langues confondues. Le tirage initial d'un set, le plus recherché des collectionneurs.";
const BASE = "/cartes/1ere-edition";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const url = `${SITE_URL}$/cartes/1ere-edition` + (p > 1 ? `?page=${p}` : "");
  return {
    title: `$"Cartes Yu-Gi-Oh! 1ère édition"${p > 1 ? ` — page ${p}` : ""} | ${SITE_NAME}`,
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
  const cartes = toutes.filter((c) => c.card.is_1st);
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
        { nom: "1ère édition", url: `${SITE_URL}/cartes/1ere-edition` },
      ]}
    />
  );
}
