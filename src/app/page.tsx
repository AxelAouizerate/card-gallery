import fs from "node:fs/promises";
import path from "node:path";
import CardGallery from "@/components/CardGallery";
import type { Card } from "@/lib/cards";
import HeaderNav from "@/components/HeaderNav";
import JsonLd from "@/components/JsonLd";
import { SeoIntro, SeoFooter, FAQ_ITEMS } from "@/components/SeoContent";
import { SITE_URL, SITE_NAME } from "@/lib/site";

async function getCards(): Promise<Card[]> {
  const file = path.join(process.cwd(), "public", "cards.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Card[];
}

// Codes langue collection -> BCP-47 pour schema.org (inLanguage).
const LANG_BCP47: Record<string, string> = {
  fr: "fr-FR", en: "en", jap: "ja", jp: "ja", kr: "ko", it: "it", de: "de", sp: "es",
};

function absUrl(u: string | null): string {
  if (!u) return `${SITE_URL}/horus-logo.png`;
  return u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}

// ItemList des produits en vente : gros levier SEO e-commerce (rich results).
// On limite aux cartes réellement achetables (dispo + prix) et on plafonne la
// taille du payload en gardant les plus belles pièces en premier.
function buildItemList(cards: Card[]) {
  const products = cards
    .filter((c) => c.status === "available" && c.prix !== null && c.prix > 0)
    .sort((a, b) => (b.prix ?? 0) - (a.prix ?? 0))
    .slice(0, 100);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cartes Yu-Gi-Oh! françaises à l'unité — horuscards",
    numberOfItems: products.length,
    itemListElement: products.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: c.set ? `${c.nom} (${c.set})` : c.nom,
        category: "Carte à collectionner Yu-Gi-Oh!",
        inLanguage: LANG_BCP47[c.lang] ?? c.lang,
        image: absUrl(c.photo_1),
        brand: { "@type": "Brand", name: "Yu-Gi-Oh!" },
        ...(c.grade
          ? { additionalProperty: [{ "@type": "PropertyValue", name: "Gradation", value: `${c.grade_org ?? "Grade"} ${c.grade}` }] }
          : {}),
        offers: {
          "@type": "Offer",
          price: c.prix,
          priceCurrency: "EUR",
          availability: c.reserve
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
          itemCondition: "https://schema.org/UsedCondition",
          url: SITE_URL,
          seller: { "@id": `${SITE_URL}/#store` },
        },
      },
    })),
  };
}

function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function buildBreadcrumb() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Cartes Yu-Gi-Oh! à l'unité — ${SITE_NAME}`, item: SITE_URL },
    ],
  };
}

export default async function HomePage() {
  const cards = await getCards();
  return (
    <main className="min-h-screen">
      <JsonLd data={buildBreadcrumb()} />
      <JsonLd data={buildItemList(cards)} />
      <JsonLd data={buildFaqJsonLd()} />
      <HeaderNav />
      <SeoIntro />
      <CardGallery cards={cards} />
      <SeoFooter />
    </main>
  );
}
