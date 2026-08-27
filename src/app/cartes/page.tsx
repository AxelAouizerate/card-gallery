import type { Metadata } from "next";
import PageCatalogue from "@/components/PageCatalogue";
import FiltresCatalogue from "@/components/FiltresCatalogue";
import { cartesAvecSlug, setsDuCatalogue, getCards } from "@/lib/catalogue";
import { lireFiltres, appliquerFiltres, estIndexable, nbFiltresActifs } from "@/lib/filtres";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITRE = "Toutes les cartes Yu-Gi-Oh! à l'unité";
const CHAPO =
  "Le catalogue complet : françaises, anglaises et japonaises, de la commune à 1 € à la pièce gradée Pop 1. Triées par valeur décroissante.";
const BASE = "/cartes";

type Params = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: Params }): Promise<Metadata> {
  const f = lireFiltres(await searchParams);
  const url = `${SITE_URL}${BASE}` + (f.page > 1 ? `?page=${f.page}` : "");
  return {
    title: `${TITRE}${f.page > 1 ? ` — page ${f.page}` : ""} | ${SITE_NAME}`,
    description: CHAPO,
    // Le canonical d'une vue filtree pointe vers le catalogue nu : les
    // combinaisons de filtres ne doivent pas exister deux fois dans l'index.
    alternates: { canonical: estIndexable(f) ? url : `${SITE_URL}${BASE}` },
    robots: estIndexable(f) ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url, title: TITRE, description: CHAPO, locale: "fr_FR" },
  };
}

export default async function Page({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const f = lireFiltres(params);

  const toutes = await cartesAvecSlug();
  const retenues = new Set(appliquerFiltres(toutes.map((c) => c.card), f));
  const cartes = toutes.filter((c) => retenues.has(c.card));

  const brut = await getCards();
  const options = {
    sets: await setsDuCatalogue(),
    raretes: [...new Set(brut.map((c) => c.rarete).filter(Boolean))].sort(),
    langues: [...new Set(brut.map((c) => c.lang).filter(Boolean))].sort(),
    prixMax: Math.max(0, ...brut.map((c) => c.prix ?? 0)),
  };

  return (
    <PageCatalogue
      titre={TITRE}
      chapo={CHAPO}
      cartes={cartes}
      base={BASE}
      page={f.page}
      filtres={<FiltresCatalogue options={options} base={BASE} />}
      nbFiltres={nbFiltresActifs(f)}
      filAriane={[
        { nom: "Accueil", url: SITE_URL },
        { nom: "Cartes", url: `${SITE_URL}/cartes` },
      ]}
    />
  );
}
