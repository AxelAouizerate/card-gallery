import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import GrilleCartes from "@/components/GrilleCartes";
import type { Card } from "@/lib/cards";
import { isNewArrival } from "@/lib/cards";
import { cartesAvecSlug, setsDuCatalogue, raretesDuCatalogue, type CarteListee } from "@/lib/catalogue";
import HeaderNav from "@/components/HeaderNav";
import JsonLd from "@/components/JsonLd";
import { SeoIntro, SeoFooter, FAQ_ITEMS } from "@/components/SeoContent";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import VignettesCategories from "@/components/VignettesCategories";
import FiltreAccueilDepliable from "@/components/FiltreAccueilDepliable";

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

  const options = {
    sets: await setsDuCatalogue(),
    raretes: await raretesDuCatalogue(),
    langues: [...new Set(cards.map((c) => c.lang).filter(Boolean))].sort(),
    prixMax: Math.max(0, ...cards.map((c) => c.prix ?? 0)),
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={buildBreadcrumb()} />
      <JsonLd data={buildItemList([...pepites, ...pop1, ...nouveautes])} />
      <JsonLd data={buildFaqJsonLd()} />
      <HeaderNav />
      <SeoIntro />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        <VignettesCategories />
        <FiltreAccueilDepliable options={options} />

        <Selection titre="Les plus belles pièces" icone={<IconeCoffre />} cartes={pepites} />
        {pop1.length > 0 && (
          <Selection titre="Pop 1 — uniques à ce grade et au-dessus" cartes={pop1} />
        )}
        {nouveautes.length > 0 && <Selection titre="Nouveautés" cartes={nouveautes} />}
        <SectionLots />

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

// Section vide pour l'instant (aucun lot en vente) — prete a accueillir des
// lots des qu'il y en aura, sans travail supplementaire cote structure.
function SectionLots() {
  return (
    <section>
      <h2
        className="mb-3 text-lg font-semibold text-amber-200"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        Lots
      </h2>
      <div className="rounded-lg border border-dashed border-amber-500/25 bg-black/20 p-6 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-amber-100/50">
          Aucun lot en ce moment — revenez bientôt
        </p>
      </div>
    </section>
  );
}

function Selection({ titre, icone, cartes }: { titre: string; icone?: React.ReactNode; cartes: CarteListee[] }) {
  return (
    <section>
      <h2
        className="mb-3 flex items-center gap-2.5 text-lg font-semibold text-amber-200"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {icone}
        <span>{titre}</span>
      </h2>
      <GrilleCartes cartes={cartes} />
    </section>
  );
}

// Silhouette pleine (pas des traits fins) : se reconnait d'un coup d'oeil,
// nettement plus grosse que le texte du titre a cote.
function IconeCoffre() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <path d="M4 15c0-3.31 2.69-6 6-6h12c3.31 0 6 2.69 6 6v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9Z" fill="#a16207" />
      <path d="M4 15c0-3.31 2.69-6 6-6h12c3.31 0 6 2.69 6 6v1H4v-1Z" fill="#78350f" />
      <rect x="4" y="15" width="24" height="3" fill="#d97706" />
      <circle cx="16" cy="17.5" r="2.6" fill="#fde68a" />
      <rect x="14.9" y="17.3" width="2.2" height="3.2" rx="0.6" fill="#78350f" />
    </svg>
  );
}
