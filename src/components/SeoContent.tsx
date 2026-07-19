import Link from "next/link";

// Contenu editorial rendu cote serveur (donc indexable) : le catalogue est
// affiche par un composant client, les moteurs ont donc besoin de ce texte
// riche en mots-cles pour comprendre et referencer la boutique.

export type Faq = { q: string; a: string };

// Source unique : reutilisee pour l'affichage visible ET le JSON-LD FAQPage.
export const FAQ_ITEMS: Faq[] = [
  {
    q: "Vendez-vous des cartes Yu-Gi-Oh! en édition française ?",
    a: "Oui. horuscards est spécialisé dans les cartes Yu-Gi-Oh! françaises : de nombreuses éditions FR rares, des 1ère édition, des raretés secret / ultimate / ghost et surtout des pièces inédites en français très difficiles à trouver ailleurs.",
  },
  {
    q: "Les cartes sont-elles authentiques et bien décrites ?",
    a: "Chaque carte est 100 % authentique et originale. L'état est visible directement sur les photos recto/verso, et vous pouvez demander des photos supplémentaires avant d'acheter.",
  },
  {
    q: "Proposez-vous des cartes gradées ?",
    a: "Oui, nous proposons des cartes gradées CCC, PSA et CollectAura, avec la note et l'organisme affichés directement sur la fiche de la carte.",
  },
  {
    q: "Comment se passe la livraison en France ?",
    a: "Envoi rapide et soigné partout en France : sleeve + toploader rigide + renfort, sous enveloppe protégée, avec suivi. Remise en main propre possible selon la région.",
  },
  {
    q: "Peut-on négocier les prix ou acheter en lot ?",
    a: "Oui, les prix sont négociables et vous pouvez grouper plusieurs cartes pour économiser sur les frais de port. Faites simplement votre proposition de lot.",
  },
];

export function SeoIntro() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8">
      <h1
        className="text-2xl font-bold tracking-wide text-amber-200 sm:text-3xl"
        style={{
          fontFamily: "var(--font-cinzel), serif",
          textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)",
        }}
      >
        Cartes Yu-Gi-Oh! françaises à l&apos;unité — éditions FR rares &amp; inédits
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-amber-100/80">
        Bienvenue sur <strong>horuscards</strong>, la boutique française dédiée aux{" "}
        <strong>cartes Yu-Gi-Oh! à l&apos;unité et aux produits scellés</strong> en{" "}
        <strong>français, anglais et japonais</strong>, pour les{" "}
        <strong>duellistes</strong> comme pour les <strong>collectionneurs</strong>. Vous
        trouverez ici des <strong>éditions françaises rares</strong>, des{" "}
        <strong>1ère édition</strong>, des raretés <em>secret rare</em>, <em>ultimate rare</em>,{" "}
        <em>ghost rare</em>, des <strong>cartes gradées</strong> (CCC, PSA, CollectAura) ainsi
        que des <strong>pièces inédites en français</strong>{" "}quasi introuvables ailleurs :
        Magicien Sombre, Dragon Blanc aux Yeux Bleus, Néos, Héros Élémentaires, Dieux Égyptiens
        et bien d&apos;autres. Filtrez par set, rareté, langue ou prix pour trouver la
        carte qu&apos;il vous manque.
      </p>
    </section>
  );
}

export function SeoFooter() {
  return (
    <footer className="mt-12 border-t border-amber-500/20 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <section>
          <h2 className="text-xl font-semibold text-amber-200">
            Pourquoi acheter ses cartes Yu-Gi-Oh! chez horuscards ?
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 text-sm text-amber-100/80 sm:grid-cols-2 lg:grid-cols-3">
            <li>✅ <strong>Éditions françaises &amp; inédits FR</strong> : un stock rare, du vintage aux sets récents.</li>
            <li>🏅 <strong>Cartes gradées</strong> CCC, PSA et CollectAura, note et organisme affichés.</li>
            <li>✨ <strong>1ère édition</strong> et raretés secret / ultimate / ghost.</li>
            <li>🔎 <strong>État visible sur les photos</strong> recto/verso, photos supplémentaires sur demande.</li>
            <li>📦 <strong>Envoi protégé et rapide</strong> partout en France, avec suivi.</li>
            <li>🤝 <strong>Prix négociables</strong> et réductions sur les lots.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-amber-200">
            Une collection française rare, pensée pour joueurs et collectionneurs
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-amber-100/75">
            Que vous montiez un <strong>deck compétitif</strong>, que vous cherchiez une carte
            précise pour compléter un <strong>archétype</strong>, ou que vous chassiez une{" "}
            <strong>pièce de collection en édition française</strong>, notre catalogue est trié
            pour vous faire gagner du temps. Nous mettons régulièrement en ligne de{" "}
            <strong>nouvelles arrivées</strong> et des <strong>cartes inédites en FR</strong> :
            revenez souvent, le stock évolue vite. Toutes les cartes sont vendues à l&apos;unité,
            authentiques, et expédiées avec le plus grand soin.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-amber-200">Questions fréquentes</h2>
          <dl className="mt-4 space-y-4">
            {FAQ_ITEMS.map((f) => (
              <div key={f.q} className="rounded-lg border border-amber-500/20 bg-black/40 p-4">
                <dt className="font-medium text-amber-100">{f.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-amber-100/75">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-amber-500/10 pt-6 text-sm text-amber-100/70">
          <Link href="/" className="hover:text-amber-200">Catalogue des cartes</Link>
          <Link href="/comment-acheter" className="hover:text-amber-200">Comment acheter</Link>
          <Link href="/favorites" className="hover:text-amber-200">Mes favoris</Link>
          <Link href="/stats" className="hover:text-amber-200">Statistiques de la boutique</Link>
        </nav>

        <p className="mt-6 text-xs text-amber-100/50">
          horuscards — boutique française de cartes Yu-Gi-Oh! à l&apos;unité : éditions FR,
          inédits, 1ère édition, secret / ultimate / ghost rare et cartes gradées. Livraison
          en France.
        </p>
      </div>
    </footer>
  );
}
