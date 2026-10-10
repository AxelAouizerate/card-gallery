import type { Metadata } from "next";
import PageCatalogue, { lireParPage } from "@/components/PageCatalogue";
import BarreFiltres, { PanneauFiltres } from "@/components/FiltresCatalogue";
import { cartesAvecSlug, setsDuCatalogue, raretesDuCatalogue, notesDuCatalogue, getCards } from "@/lib/catalogue";
import { lireFiltres, ecrireFiltres, appliquerFiltres, estIndexable, nbFiltresActifs } from "@/lib/filtres";
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
  // appliquerFiltres reordonne selon f.tri : on reconstruit cartes dans CET
  // ordre (pas celui de `toutes`) pour que le tri choisi soit bien applique,
  // tout en recuperant le slug de chaque carte via la map.
  const parCard = new Map(toutes.map((c) => [c.card, c]));
  const cartes = appliquerFiltres(toutes.map((c) => c.card), f).map((card) => parCard.get(card)!);

  const brut = await getCards();
  const options = {
    sets: await setsDuCatalogue(),
    raretes: await raretesDuCatalogue(),
    langues: [...new Set(brut.map((c) => c.lang).filter(Boolean))].sort(),
    prixMax: Math.max(0, ...brut.map((c) => c.prix ?? 0)),
    notes: await notesDuCatalogue(),
  };

  return (
    <PageCatalogue
      titre={TITRE}
      chapo={CHAPO}
      cartes={cartes}
      base={BASE}
      page={f.page}
      parPage={lireParPage(params.parPage)}
      queryExtra={ecrireFiltres({ ...f, page: 1 })}
      filtres={<BarreFiltres options={options} base={BASE} />}
      panneauFiltres={<PanneauFiltres options={options} base={BASE} />}
      nbFiltres={nbFiltresActifs(f)}
      filAriane={[
        { nom: "Accueil", url: SITE_URL },
        { nom: "Cartes", url: `${SITE_URL}/cartes` },
      ]}
    />
  );
}
