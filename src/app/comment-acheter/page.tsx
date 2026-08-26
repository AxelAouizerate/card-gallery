import type { Metadata } from "next";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITLE = "Comment acheter — un seul bouton : contacter le vendeur sur Instagram";
const DESCRIPTION =
  "Comment acheter une carte Yu-Gi-Oh! chez horuscards : sur chaque fiche, cliquez sur « Contacter le vendeur sur Instagram ». Ce bouton unique sert à tout : acheter au prix indiqué, faire une offre, ou demander des photos et vidéos supplémentaires sur n'importe quelle carte. Paiement en plusieurs fois accepté, envoi suivi ou remise en main propre autour de Lyon, Paris et Bordeaux.";

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

// Etapes du JSON-LD : elles doivent refleter ce qui est reellement visible
// sur la page, sinon le balisage decrit un contenu absent.
const STEPS: { name: string; text: string }[] = [
  {
    name: "Parcourez le catalogue et ouvrez une fiche",
    text: "Filtrez par set, rareté, langue ou prix, puis cliquez sur une carte pour voir ses photos, son état et son éventuelle gradation.",
  },
  {
    name: "Cliquez sur « Contacter le vendeur sur Instagram »",
    text: "Le seul bouton du site. Il sert à acheter au prix indiqué, faire une offre, ou demander des photos et vidéos supplémentaires sur n'importe quelle carte.",
  },
  {
    name: "Convenez du paiement et de la livraison",
    text: "Paiement en plusieurs fois accepté par les 3 vendeurs. Envoi protégé et suivi, ou remise en main propre autour de Lyon, Paris et Bordeaux.",
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

// Les 3 usages du bouton unique : c'est le message central de la page.
const USAGES: { titre: string; texte: string; icone: string }[] = [
  {
    icone: "🏷️",
    titre: "Acheter au prix indiqué",
    texte: "Le prix affiché est le prix de vente. Dites-le au vendeur, c'est réglé.",
  },
  {
    icone: "💶",
    titre: "Faire une offre",
    texte: "Proposez votre montant, il reste libre d'accepter. Groupez plusieurs cartes pour un lot.",
  },
  {
    icone: "📸",
    titre: "Photos ou vidéo",
    texte: "Sur n'importe quelle carte, y compris celles qui ont déjà des photos en ligne.",
  },
];

export default function CommentAcheterPage() {
  return (
    <main className="min-h-screen">
      <JsonLd data={howToJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <HeaderNav />

      <article className="mx-auto max-w-4xl px-4 py-6">
        <nav className="mb-3 text-xs text-amber-100/60">
          <Link href="/" className="hover:text-amber-200">Accueil</Link>
          <span aria-hidden> › </span>
          <span className="text-amber-100/80">Comment acheter</span>
        </nav>

        <h1
          className="text-xl font-bold tracking-wide text-amber-200 sm:text-2xl"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)",
          }}
        >
          Comment acheter chez horuscards ?
        </h1>

        {/* Message central : un seul bouton, trois usages. */}
        <section className="mt-4 rounded-xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/15 to-black/50 px-5 py-4">
          <p className="text-base leading-relaxed text-amber-50">
            Sur chaque fiche, <strong>un seul bouton</strong> :{" "}
            <span className="inline-block rounded-md bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 px-2 py-0.5 font-semibold text-white">
              Contacter le vendeur sur Instagram
            </span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-100/85">
            Prix, offre, photos : tout passe par lui. <strong>Aucun paiement sur le site</strong> —
            horuscards est une vitrine, la transaction se fait avec le vendeur.
          </p>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          {USAGES.map((u) => (
            <div key={u.titre} className="rounded-lg border border-amber-500/30 bg-black/40 p-4">
              <h2 className="text-sm font-semibold text-amber-200">
                <span aria-hidden>{u.icone}</span> {u.titre}
              </h2>
              <p className="mt-1.5 text-sm leading-snug text-amber-100/75">{u.texte}</p>
            </div>
          ))}
        </section>

        <section className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <h2 className="text-sm font-semibold text-emerald-200">Paiement en plusieurs fois</h2>
            <p className="mt-1.5 text-sm leading-snug text-amber-100/80">
              Accepté par <strong>nos 3 vendeurs</strong>, sans frais, sur toutes les cartes.
              Il suffit de le demander.
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-black/40 p-4">
            <h2 className="text-sm font-semibold text-amber-200">Livraison ou main propre</h2>
            <p className="mt-1.5 text-sm leading-snug text-amber-100/80">
              Envoi protégé et suivi partout en France. Main propre possible autour de{" "}
              <strong>Lyon, Paris et Bordeaux</strong>.
            </p>
          </div>
        </section>

        <section className="mt-3 rounded-lg border border-amber-500/20 bg-black/30 px-4 py-3">
          <h2 className="text-sm font-semibold text-amber-200">Bon à savoir</h2>
          <ul className="mt-2 grid gap-1.5 text-sm text-amber-100/75 sm:grid-cols-2">
            <li>• <strong>« Disponible » sans photo</strong> = en stock, photos à venir.</li>
            <li>• <strong>Photos ou vidéos sur demande</strong>, sur toutes les cartes.</li>
            <li>• Précisez la carte dans votre message.</li>
            <li>• <strong>Paiement en plusieurs fois</strong> chez nos 3 vendeurs.</li>
            <li>• Ajoutez vos cartes en <Link href="/favorites" className="underline hover:text-amber-200">favoris</Link>.</li>
          </ul>
        </section>

        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-amber-400/60 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/30"
          >
            ← Parcourir le catalogue
          </Link>
        </div>
      </article>
    </main>
  );
}
