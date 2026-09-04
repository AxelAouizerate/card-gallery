import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import GrilleCartes from "@/components/GrilleCartes";
import type { Card } from "@/lib/cards";
import { isNewArrival } from "@/lib/cards";
import { cartesAvecSlug, type CarteListee } from "@/lib/catalogue";
import HeaderNav from "@/components/HeaderNav";
import JsonLd from "@/components/JsonLd";
import { SeoIntro, SeoFooter, FAQ_ITEMS } from "@/components/SeoContent";
import { SITE_URL, SITE_NAME } from "@/lib/site";

async function getCards(): Promise<Card[]> {
  const file = path.join(process.cwd(), "public", "cards.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Card[];
}



// ItemList des produits en vente : gros levier SEO e-commerce (rich results).
// On limite aux cartes réellement achetables (dispo + prix) et on plafonne la
// taille du payload en gardant les plus belles pièces en premier.
/**
 * L'ItemList doit decrire ce qui est reellement affiche sur la page. La home
 * ne montre plus le catalogue entier mais une selection : le detail Product
 * complet vit desormais sur chaque fiche /carte/[slug].
 */
function buildItemList(selection: CarteListee[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sélection — cartes Yu-Gi-Oh! à l'unité, horuscards",
    numberOfItems: selection.length,
    itemListElement: selection.map(({ slug, card }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/carte/${slug}`,
      name: card.set ? `${card.nom} (${card.set})` : card.nom,
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
  const toutes = await cartesAvecSlug();

  // La home n'est plus le catalogue : elle met en avant trois selections et
  // renvoie vers /cartes. Elle ne charge donc plus les 833 cartes dans le
  // payload client, ce qui etait le vrai poids mort de la page.
  const pepites = toutes.filter((c) => c.card.status !== "sold").slice(0, 10);
  const pop1 = toutes.filter((c) => c.card.pop === 1 && c.card.status !== "sold").slice(0, 5);
  const nouveautes = toutes
    .filter((c) => c.card.status !== "sold" && isNewArrival(c.card))
    .slice(0, 5);

  return (
    <main className="min-h-screen">
      <JsonLd data={buildBreadcrumb()} />
      <JsonLd data={buildItemList([...pepites, ...pop1, ...nouveautes])} />
      <JsonLd data={buildFaqJsonLd()} />
      <HeaderNav />
      <SeoIntro />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        <Selection titre="Les plus belles pièces" icone={<IconeCoffre />} cartes={pepites} />
        {pop1.length > 0 && (
          <Selection titre="Pop 1 — uniques à ce grade et au-dessus" cartes={pop1} />
        )}
        {nouveautes.length > 0 && <Selection titre="Nouveautés" cartes={nouveautes} />}

        <div className="text-center">
          <Link
            href="/cartes"
            className="inline-flex items-center rounded-md border border-amber-400/60 bg-amber-500/20 px-6 py-3 font-medium text-amber-100 hover:bg-amber-500/30"
          >
            Parcourir les {cards.length} cartes →
          </Link>
        </div>
      </div>

      <SeoFooter />
    </main>
  );
}

function Selection({ titre, icone, cartes }: { titre: string; icone?: React.ReactNode; cartes: CarteListee[] }) {
  return (
    <section>
      <h2
        className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-200"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {icone}
        {titre}
      </h2>
      <GrilleCartes cartes={cartes} />
    </section>
  );
}

function IconeCoffre() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5c0-1.66 1.34-3 3-3h12c1.66 0 3 1.34 3 3V18c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-7.5Z" />
      <path d="M3 10.5 5.5 4h13L21 10.5" />
      <path d="M3 14h18" />
      <path d="M10.5 12v2.5a1.5 1.5 0 0 0 3 0V12" />
    </svg>
  );
}
