import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HeaderNav from "@/components/HeaderNav";
import JsonLd from "@/components/JsonLd";
import FicheCarte from "@/components/FicheCarte";
import { carteParSlug, indexerSlugs } from "@/lib/catalogue";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { Card } from "@/lib/cards";

// Le stock bouge plusieurs fois par jour : ISR plutot qu'un rebuild complet.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [...(await indexerSlugs()).keys()].map((slug) => ({ slug }));
}

/** "Dragon Blanc — LOB Ultra FR, 1ère édition, CCC 10" */
function intitule(c: Card): string {
  const bouts = [c.set, c.rarete, c.lang].filter(Boolean).join(" ");
  const suite: string[] = [];
  if (c.is_1st) suite.push("1ère édition");
  if (c.grade) suite.push(`${c.grade_org ?? "grade"} ${c.grade}`);
  return [`${c.nom} — ${bouts}`, ...suite].join(", ");
}

function descriptionCarte(c: Card): string {
  const bouts: string[] = [`${c.nom}, ${c.rarete || "carte"} ${c.set}`];
  if (c.is_1st) bouts.push("1ère édition");
  bouts.push(`en ${c.lang}`);
  if (c.grade) bouts.push(`gradée ${c.grade_org ?? ""} ${c.grade}`.trim());
  else if (c.etat) bouts.push(`état ${c.etat}`);
  if (c.pop === 1) bouts.push("Pop 1, unique à ce grade et au-dessus");
  const fin =
    c.status === "sold"
      ? "Vendue."
      : c.prix != null
        ? `${c.prix.toFixed(0)} € — achat au prix indiqué ou faites votre offre.`
        : "Bientôt en boutique.";
  return `${bouts.join(", ")}. ${fin} Envoi suivi depuis la France.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await carteParSlug(slug);
  if (!c) return { title: "Carte introuvable" };
  const url = `${SITE_URL}/carte/${slug}`;
  return {
    title: `${intitule(c)} | ${SITE_NAME}`,
    description: descriptionCarte(c),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: intitule(c),
      description: descriptionCarte(c),
      locale: "fr_FR",
    },
  };
}

export default async function PageCarte({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await carteParSlug(slug);
  if (!c) notFound();

  const url = `${SITE_URL}/carte/${slug}`;
  const dispo = c.status === "sold"
    ? "https://schema.org/SoldOut"
    : c.prix != null
      ? "https://schema.org/InStock"
      : "https://schema.org/PreOrder";

  const produit = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: intitule(c),
    description: descriptionCarte(c),
    url,
    sku: String(c.id),
    brand: { "@type": "Brand", name: "Yu-Gi-Oh!" },
    category: "Cartes à collectionner > Yu-Gi-Oh!",
    ...(c.photo_1 ? { image: [`${SITE_URL}${c.photo_1}`] } : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Set", value: c.set },
      { "@type": "PropertyValue", name: "Rareté", value: c.rarete },
      { "@type": "PropertyValue", name: "Langue", value: c.lang },
      ...(c.is_1st ? [{ "@type": "PropertyValue", name: "Édition", value: "1ère édition" }] : []),
      ...(c.grade
        ? [{ "@type": "PropertyValue", name: "Gradation", value: `${c.grade_org ?? ""} ${c.grade}`.trim() }]
        : []),
      ...(c.pop ? [{ "@type": "PropertyValue", name: "Population", value: `Pop ${c.pop}` }] : []),
    ],
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      ...(c.prix != null ? { price: c.prix.toFixed(2) } : {}),
      availability: dispo,
      itemCondition: c.grade
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
      seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
  };

  const fil = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cartes", item: `${SITE_URL}/cartes` },
      { "@type": "ListItem", position: 3, name: c.set, item: `${SITE_URL}/cartes/${c.set.toLowerCase()}` },
      { "@type": "ListItem", position: 4, name: c.nom, item: url },
    ],
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={produit} />
      <JsonLd data={fil} />
      <HeaderNav />
      <article className="mx-auto max-w-5xl px-4 py-6">
        <nav className="mb-4 text-xs text-amber-100/60">
          <Link href="/" className="hover:text-amber-200">Accueil</Link>
          <span aria-hidden> › </span>
          <Link href="/cartes" className="hover:text-amber-200">Cartes</Link>
          <span aria-hidden> › </span>
          <Link href={`/cartes/${c.set.toLowerCase()}`} className="hover:text-amber-200">{c.set}</Link>
          <span aria-hidden> › </span>
          <span className="text-amber-100/80">{c.nom}</span>
        </nav>
        <FicheCarte card={c} />
      </article>
    </main>
  );
}
