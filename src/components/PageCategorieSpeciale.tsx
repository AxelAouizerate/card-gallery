import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import NavCategoriesCroisee from "@/components/NavCategoriesCroisee";
import { cartesCategorieSpeciale } from "@/lib/catalogue";
import { CATEGORIES_META, type CategorieId } from "@/lib/categoriesSpeciales";
import { SITE_URL, SITE_NAME } from "@/lib/site";

/** Fabrique la metadata + la page pour une des 4 categories speciales. */
export function pageCategorieSpeciale(id: CategorieId) {
  const info = CATEGORIES_META.find((c) => c.id === id)!;
  const base = `/cartes/${id}`;
  const titre = `${info.titre} — cartes Yu-Gi-Oh! à l'unité`;
  const chapo = info.description;

  async function generateMetadata({ searchParams }: {
    searchParams: Promise<{ page?: string }>;
  }): Promise<Metadata> {
    const { page } = await searchParams;
    const p = Math.max(1, Number(page) || 1);
    const url = `${SITE_URL}${base}` + (p > 1 ? `?page=${p}` : "");
    return {
      title: `${titre}${p > 1 ? ` — page ${p}` : ""} | ${SITE_NAME}`,
      description: chapo,
      alternates: { canonical: url },
      openGraph: { type: "website", url, title: titre, description: chapo, locale: "fr_FR" },
    };
  }

  async function Page({ searchParams }: {
    searchParams: Promise<{ page?: string }>;
  }) {
    const { page } = await searchParams;
    const cartes = await cartesCategorieSpeciale(id);
    return (
      <PageCatalogue
        titre={info.titre}
        chapo={chapo}
        cartes={cartes}
        base={base}
        page={Math.max(1, Number(page) || 1)}
        avantGrille={<NavCategoriesCroisee actuelle={id} />}
        filAriane={[
          { nom: "Accueil", url: SITE_URL },
          { nom: "Cartes", url: `${SITE_URL}/cartes` },
          { nom: info.titre, url: `${SITE_URL}${base}` },
        ]}
      />
    );
  }

  return { generateMetadata, Page };
}
