import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesDeLere } from "@/lib/catalogue";
import { ERES, type Ere } from "@/lib/eres";
import { SITE_URL, SITE_NAME } from "@/lib/site";

/** Fabrique la metadata + la page pour une des 4 eres — evite 4 fichiers dupliques. */
export function pageEre(ere: Ere) {
  const info = ERES.find((e) => e.id === ere)!;
  const base = `/cartes/${ere}`;
  const titre = `Cartes ${info.nom} à l'unité`;
  const chapo = `Les cartes ${info.nom} (${info.periode}) disponibles à l'unité chez horuscards, triées par valeur.`;

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
    const cartes = await cartesDeLere(ere);
    return (
      <PageCatalogue
        titre={titre}
        chapo={chapo}
        cartes={cartes}
        base={base}
        page={Math.max(1, Number(page) || 1)}
        filAriane={[
          { nom: "Accueil", url: SITE_URL },
          { nom: "Cartes", url: `${SITE_URL}/cartes` },
          { nom: info.nom, url: `${SITE_URL}${base}` },
        ]}
      />
    );
  }

  return { generateMetadata, Page };
}
