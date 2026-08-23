import type { Metadata } from "next";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITLE = "Comment acheter — un seul bouton : contacter le vendeur sur Instagram";
const DESCRIPTION =
  "Comment acheter une carte Yu-Gi-Oh! chez horuscards : sur chaque fiche, cliquez sur « Contacter le vendeur sur Instagram ». Ce bouton unique sert à tout : acheter au prix indiqué, faire une offre, ou demander des photos. Paiement et livraison convenus directement avec le vendeur en message privé.";

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
    text: "Cliquez sur une carte pour voir les photos recto/verso quand elles existent, la rareté, la langue, l'état, la 1ère édition et l'éventuelle gradation.",
  },
  {
    name: "Cliquez sur « Contacter le vendeur sur Instagram »",
    text: "C'est le seul bouton d'achat du site, et il sert aux trois cas : acheter au prix indiqué, faire une offre, ou demander des photos. Il ouvre la messagerie Instagram du vendeur qui possède cette carte.",
  },
  {
    name: "Envoyez-lui un message privé",
    text: "Le message n'est pas pré-rempli : indiquez le nom de la carte et son set, puis dites ce que vous voulez — la prendre au prix affiché, proposer un montant, ou voir des photos supplémentaires.",
  },
  {
    name: "Convenez du paiement et de la livraison",
    text: "Le paiement et l'envoi (protégé, avec suivi) se règlent directement avec le vendeur dans la conversation. Le paiement en plusieurs fois est proposé par tous nos vendeurs. La remise en main propre est possible selon les cartes : en région parisienne, autour de Mont-de-Marsan et Bordeaux, et entre Givors et Saint-Étienne.",
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
    texte:
      "Le prix affiché sur la fiche est le prix de vente. Dites au vendeur que vous prenez la carte à ce prix, et convenez du paiement et de l'envoi.",
  },
  {
    icone: "💶",
    titre: "Faire une offre",
    texte:
      "Vous pouvez proposer un montant inférieur : le vendeur reste libre d'accepter, de refuser ou de contre-proposer. Groupez plusieurs cartes pour négocier un lot.",
  },
  {
    icone: "📸",
    titre: "Demander des photos",
    texte:
      "Certaines cartes n'ont pas encore de photos en ligne. Elles sont bien disponibles : demandez au vendeur des photos recto/verso, il vous les envoie.",
  },
];

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

        {/* Message central : un seul bouton, trois usages. */}
        <section className="mt-6 rounded-xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/15 to-black/50 p-6">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-300/90">
            La seule chose à retenir
          </p>
          <p className="mt-3 text-lg leading-relaxed text-amber-50">
            Sur chaque fiche carte, il y a <strong>un seul bouton</strong> :{" "}
            <span className="inline-block rounded-md bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 px-2.5 py-1 font-semibold text-white">
              Contacter le vendeur sur Instagram
            </span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-amber-100/85">
            Que vous vouliez <strong>acheter au prix indiqué</strong>, <strong>faire une offre</strong>{" "}
            ou <strong>demander des photos</strong>, c&apos;est toujours ce bouton. Il ouvre la
            messagerie Instagram du vendeur : vous lui écrivez, et tout se règle avec lui.{" "}
            <strong>Aucun paiement ne se fait sur le site</strong> — horuscards est une vitrine, pas
            une boutique en ligne.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {USAGES.map((u) => (
            <div key={u.titre} className="rounded-lg border border-amber-500/30 bg-black/40 p-5">
              <p className="text-2xl" aria-hidden>{u.icone}</p>
              <h2 className="mt-2 text-base font-semibold text-amber-200">{u.titre}</h2>
              <p className="mt-2 text-sm leading-relaxed text-amber-100/75">{u.texte}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber-300/80">
                → Même bouton Instagram
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10">
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

        <section className="mt-10 rounded-lg border border-amber-500/20 bg-black/30 p-5">
          <h2 className="text-lg font-semibold text-amber-200">Bon à savoir</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-100/75">
            <li>• Une carte marquée <strong>« Disponible » sans photo</strong> est bien en stock : ses photos ne sont juste pas encore en ligne. Demandez-les au vendeur.</li>
            <li>• Pensez à <strong>préciser le nom de la carte</strong> et son set dans votre message : le DM n&apos;est pas pré-rempli.</li>
            <li>• Une même carte n&apos;est vendue que par un seul vendeur — le bouton vous mène toujours au bon compte.</li>
            <li>• Le <strong>paiement en plusieurs fois</strong> est proposé par tous nos vendeurs.</li>
            <li>• Ajoutez vos cartes en <Link href="/favorites" className="underline hover:text-amber-200">favoris</Link> pour les retrouver avant de contacter le vendeur.</li>
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
