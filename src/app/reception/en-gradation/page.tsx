import type { Metadata } from "next";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITRE = "Cartes en gradation ou chez Quentin";
const CHAPO =
  "Cartes actuellement envoyées en gradation (CollectAura, CCC) ou chez Quentin, en attente de retour. " +
  "Pas encore de fiche ni de prix sur le site tant que le retour n'est pas confirmé — contactez le vendeur sur Instagram pour en savoir plus ou réserver.";

export const metadata: Metadata = {
  title: `${TITRE} | ${SITE_NAME}`,
  description: CHAPO,
  alternates: { canonical: `${SITE_URL}/reception/en-gradation` },
  openGraph: { type: "website", url: `${SITE_URL}/reception/en-gradation`, title: TITRE, description: CHAPO, locale: "fr_FR" },
};

const GROUPES: { titre: string; cartes: string[] }[] = [
  {
    titre: "Chez CollectAura",
    cartes: [
      "Dragon Arc-En-Ciel Des Ténèbres (décasée, re-gradation)",
      "Numéro C32 Requin Drakonien",
      "Chimeratech Over-Dragon",
      "Dragon Arc-En-Ciel (CT4)",
      "Le Créateur (EEN)",
      "Force De Miroir",
      "Crâne Invoqué",
      "Golem Rouages Ancients (TLM-JP)",
      "Dragon Blanc Aux Yeux Bleus (DDK-F)",
      "Lyla, Seigneur Lumière",
      "Odin, Dieu Des Ases (+ 2 autres exemplaires Ghost 1st)",
      "Néos Géant (CT04)",
      "Dragon Arc-En-Ciel (2e exemplaire, CT04)",
      "Exécuteur Phoenix, Héros Élémentaire (EOJ-JP)",
    ],
  },
  {
    titre: "Chez CCC",
    cartes: [
      "Néos Géant, Héros Élémentaire (STON)",
      "Géant Du Tonnerre, Héros Élémentaire (TLM)",
      "Dragon Armé Des Ténèbres",
      "Le Renoncé Aux Milles Yeux",
      "Dragon Rouge Majestueux (nouvel exemplaire)",
      "Néos Arc-En-Ciel (Ghost)",
    ],
  },
  {
    titre: "Chez Quentin",
    cartes: [
      "Inti",
      "Quilla",
      "Ninja D'Intervention",
      "Tigre De Laboratoire",
      "Ronflex Ex (Snorlax, espèces delta JP)",
      "Psyduck (reverse)",
      "Cresselia (reverse)",
      "Umbreon (Majestic Dawn)",
      "Aggron Holo",
      "Fusion Dimensionnelle",
      "Exodia / Necross",
      "Dragon Rouge (DDJ)",
      "Anneau De Destruction (RP02)",
      "Shaymin Lv.X",
      "Dialga Lv.X",
      "Flygon Ex",
      "Draco Equiste (Ghost, 1st, 2 exemplaires)",
      "Flame Wingman (Ultimate, 1st, US)",
      "Hamon, Seigneur Du Tonnerre (2 exemplaires)",
      "Floatzel Holo",
      "Illusioniste D'Effet",
      "Pendulier (ABPF)",
      "Dragon Nova Rouge",
      "Dragon Toon (MDM, 1st)",
      "Dragon Noir (DDJ, 2e exemplaire)",
      "Shi En (STOR, non gradé)",
    ],
  },
];

export default function Page() {
  return (
    <main className="min-h-screen">
      <HeaderNav />

      <article className="mx-auto max-w-4xl px-4 py-6">
        <nav className="mb-3 text-xs text-amber-100/60">
          <Link href="/" className="hover:text-amber-200">Accueil</Link>
          <span aria-hidden> › </span>
          <span className="text-amber-100/80">{TITRE}</span>
        </nav>

        <h1
          className="text-xl font-bold tracking-wide text-amber-200 sm:text-2xl"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)",
          }}
        >
          {TITRE}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-amber-100/75">{CHAPO}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {GROUPES.map((g) => (
            <section key={g.titre} className="rounded-lg border border-amber-500/20 bg-black/30 p-4">
              <h2 className="text-sm font-semibold text-amber-200">{g.titre}</h2>
              <ul className="mt-2 space-y-1 text-sm text-amber-100/80">
                {g.cartes.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-amber-400/60 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/30"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </article>
    </main>
  );
}
