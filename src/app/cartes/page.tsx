import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesAvecSlug } from "@/lib/catalogue";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITRE = "Toutes les cartes Yu-Gi-Oh! à l'unité";
const CHAPO = "Le catalogue complet : françaises, anglaises et japonaises, de la commune à 1 € à la pièce gradée Pop 1. Triées par valeur décroissante.";
const BASE = "/cartes";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const url = `${SITE_URL}$/cartes` + (p > 1 ? `?page=${p}` : "");
  return {
    title: `$"Toutes les cartes Yu-Gi-Oh! à l'unité"${p > 1 ? ` — page ${p}` : ""} | ${SITE_NAME}`,
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
  const cartes = toutes;
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
        
      ]}
    />
  );
}
