import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageCatalogue from "@/components/PageCatalogue";
import { cartesAvecSlug, setsDuCatalogue } from "@/lib/catalogue";
import { SITE_URL, SITE_NAME } from "@/lib/site";

/**
 * Page d'atterrissage par set : /cartes/lob, /cartes/crv...
 * Les segments statiques (/cartes/gradees, /cartes/japonaises...) sont
 * prioritaires sur ce segment dynamique, ils ne rentrent donc pas en conflit.
 */
export async function generateStaticParams() {
  const sets = await setsDuCatalogue();
  return sets.map(({ set }) => ({ set: encodeURIComponent(set.toLowerCase()) }));
}

async function cartesDuSet(setParam: string) {
  const cible = decodeURIComponent(setParam).toLowerCase();
  const toutes = await cartesAvecSlug();
  return toutes.filter((c) => (c.card.set || "").toLowerCase() === cible);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ set: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { set } = await params;
  const { page } = await searchParams;
  const cartes = await cartesDuSet(set);
  if (cartes.length === 0) return { title: "Set introuvable" };

  const nom = cartes[0].card.set;
  const p = Math.max(1, Number(page) || 1);
  const base = `/cartes/${encodeURIComponent(nom.toLowerCase())}`;
  const url = `${SITE_URL}${base}` + (p > 1 ? `?page=${p}` : "");
  const titre = `Cartes Yu-Gi-Oh! ${nom} — set complet à l'unité`;
  const chapo = `Les ${cartes.length} cartes du set ${nom} disponibles à l'unité : raretés, 1ères éditions et exemplaires gradés.`;

  return {
    title: `${titre}${p > 1 ? ` — page ${p}` : ""} | ${SITE_NAME}`,
    description: chapo,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: titre, description: chapo, locale: "fr_FR" },
  };
}

export default async function PageSet({
  params,
  searchParams,
}: {
  params: Promise<{ set: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { set } = await params;
  const { page } = await searchParams;
  const cartes = await cartesDuSet(set);
  if (cartes.length === 0) notFound();

  const nom = cartes[0].card.set;
  const base = `/cartes/${encodeURIComponent(nom.toLowerCase())}`;

  return (
    <PageCatalogue
      titre={`Set ${nom}`}
      chapo={`Les ${cartes.length} cartes du set ${nom} disponibles à l'unité : raretés, 1ères éditions et exemplaires gradés, triées par valeur.`}
      cartes={cartes}
      base={base}
      page={Math.max(1, Number(page) || 1)}
      filAriane={[
        { nom: "Accueil", url: SITE_URL },
        { nom: "Cartes", url: `${SITE_URL}/cartes` },
        { nom, url: `${SITE_URL}${base}` },
      ]}
    />
  );
}
