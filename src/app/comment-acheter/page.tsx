import type { Metadata } from "next";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITLE = "Comment acheter — DM le vendeur sur Vinted ou Instagram";
const DESCRIPTION =
  "Comment acheter une carte Yu-Gi-Oh! chez horuscards : depuis chaque fiche, cliquez sur « Acheter sur Vinted » ou « Acheter via Instagram » pour contacter directement le vendeur en message privé (DM). Achat au prix indiqué ou proposez votre offre. Paiement et livraison convenus avec le vendeur.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/comment-acheter` },
  openGraph: {
    type: "article",
    url: `${SITE_URL}/comment-acheter`,
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
    locale: "fr_FR",
  },
};

// Etapes reutilisees pour l'affichage ET le JSON-LD HowTo.
const STEPS: { name: string; text: string }[] = [
  {
    name: "Parcourez le catalogue",
    text: "Filtrez les cartes par set, rareté, langue ou prix pour trouver celle qu'il vous manque.",
  },
  {
    name: "Ouvrez la fiche de la carte",
    text: "Cliquez sur une carte pour voir les photos recto/verso, la rareté, la langue, la 1ère édition et l'éventuelle gradation.",
  },
  {
    name: "Cliquez sur « Acheter sur Vinted » ou « Acheter via Instagram »",
    text: "Chaque fiche propose deux boutons : ils vous mènent à la page Vinted ou au compte Instagram du vendeur. Choisissez la plateforme que vous préférez pour lui écrire.",
  },
  {
    name: "Envoyez un message privé (DM) au vendeur",
    text: "En DM (sur Vinted ou Instagram), indiquez le nom de la carte (et son set) qui vous intéresse. Vous pouvez copier le nom et le prix affichés sur la fiche pour aller plus vite.",
  },
  {
    name: "Achat au prix indiqué ou faites une offre",
    text: "Vous pouvez acheter directement au prix indiqué sur le site, ou proposer une offre à un montant inférieur : le vendeur est libre de l'accepter.",
  },
  {
    name: "Convenez du paiement et de la livraison",
    text: "Le paiement et l'envoi (protégé, avec suivi) se règlent directement avec le vendeur lors de la conversation.",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment acheter une carte chez horuscards",
  description: DESCRIPTION,
  inLanguage: "fr-FR",
  step: STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Comment acheter", item: `${SITE_URL}/comment-acheter` },
  ],
};

export default function CommentAcheterPage() {
  return (
    <main className="min-h-screen">
      <JsonLd data={howToJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <HeaderNav />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="mb-4 text-xs text-amber-100/60">
          <Link href="/" className="hover:text-amber-200">Accueil</Link>
          <span aria-hidden> › </span>
          <span className="text-amber-100/80">Comment acheter</span>
        </nav>

        <h1
          className="text-2xl font-bold tracking-wide text-amber-200 sm:text-3xl"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)",
          }}
        >
          Comment acheter chez horuscards ?
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-amber-100/85">
          Chez <strong>horuscards</strong>, l&apos;achat se fait{" "}
          <strong>directement auprès du vendeur, en DM sur Vinted ou Instagram</strong>. Notre site
          sert de vitrine : vous y consultez le stock, les photos, l&apos;état et le prix de chaque
          carte, puis vous contactez le vendeur en un clic (bouton Vinted ou Instagram) pour
          finaliser. Le paiement ne se fait pas sur le site.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-amber-200">Les étapes</h2>
          <ol className="mt-4 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-4 rounded-lg border border-amber-500/20 bg-black/40 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-200">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-amber-100">{s.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-100/75">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-500/30 bg-black/40 p-5">
            <h2 className="text-lg font-semibold text-amber-200">Acheter au prix indiqué</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/75">
              Le prix affiché sur la fiche est le prix de vente direct. Dites simplement au vendeur
              que vous prenez la carte à ce prix, et convenez ensemble du paiement et de l&apos;envoi.{" "}
              <strong>Le paiement en plusieurs fois est proposé par tous nos vendeurs.</strong>
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-black/40 p-5">
            <h2 className="text-lg font-semibold text-amber-200">Faire une offre</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/75">
              Vous pouvez aussi <strong>proposer un montant inférieur au prix affiché</strong>. Envoyez
              votre offre au vendeur en DM (Vinted ou Instagram) : il reste libre de l&apos;accepter, de
              refuser ou de faire une contre-proposition. Groupez plusieurs cartes pour négocier un lot.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-amber-500/20 bg-black/30 p-5">
          <h2 className="text-lg font-semibold text-amber-200">Bon à savoir</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-100/75">
            <li>• Deux boutons <strong>« Acheter sur Vinted »</strong> et <strong>« Acheter via Instagram »</strong> se trouvent sur chaque fiche carte : à vous de choisir.</li>
            <li>• Pensez à <strong>préciser le nom de la carte</strong> (et son set) dans votre message : le DM n&apos;est pas pré-rempli.</li>
            <li>• Une même carte est vendue par un seul vendeur — les boutons vous mènent au bon compte Vinted / Instagram.</li>
            <li>• Ajoutez vos cartes en <Link href="/favorites" className="underline hover:text-amber-200">favoris</Link> pour les retrouver facilement avant de contacter le vendeur.</li>
          </ul>
        </section>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-amber-400/60 bg-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-500/30"
          >
            ← Parcourir le catalogue
          </Link>
        </div>
      </article>
    </main>
  );
}
