import Link from "next/link";
import HeaderNav from "./HeaderNav";
import JsonLd from "./JsonLd";
import GrilleCartes from "./GrilleCartes";
import PaginationNumerotee from "./PaginationNumerotee";
import type { CarteListee } from "@/lib/catalogue";
import { SITE_URL } from "@/lib/site";

export const PAR_PAGE = 40;

/**
 * Coque commune aux pages de liste : /cartes et les pages d'atterrissage.
 * Rendu 100 % serveur — aucun filtre client ici, c'est le maillage interne
 * qui compte pour le crawl.
 */
export default function PageCatalogue({
  titre,
  chapo,
  cartes,
  base,
  page,
  filAriane,
  filtres,
  panneauFiltres,
  nbFiltres = 0,
}: {
  titre: string;
  chapo: string;
  cartes: CarteListee[];
  base: string;
  page: number;
  filAriane: { nom: string; url: string }[];
  /** Barre au-dessus de la grille : recherche, chips, drawer mobile. */
  filtres?: React.ReactNode;
  /** Colonne laterale collante, visible en permanence a partir de lg. */
  panneauFiltres?: React.ReactNode;
  nbFiltres?: number;
}) {
  const pages = Math.max(1, Math.ceil(cartes.length / PAR_PAGE));
  const p = Math.min(Math.max(1, page), pages);
  const tranche = cartes.slice((p - 1) * PAR_PAGE, p * PAR_PAGE);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: titre,
    numberOfItems: cartes.length,
    itemListElement: tranche.map((c, i) => ({
      "@type": "ListItem",
      position: (p - 1) * PAR_PAGE + i + 1,
      url: `${SITE_URL}/carte/${c.slug}`,
      name: c.card.nom,
    })),
  };

  const fil = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: filAriane.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: f.nom,
      item: f.url,
    })),
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={itemList} />
      <JsonLd data={fil} />
      <HeaderNav />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-3 text-xs text-amber-100/60">
          {filAriane.map((f, i) => (
            <span key={f.url}>
              {i > 0 && <span aria-hidden> › </span>}
              {i === filAriane.length - 1 ? (
                <span className="text-amber-100/80">{f.nom}</span>
              ) : (
                <Link href={f.url.replace(SITE_URL, "") || "/"} className="hover:text-amber-200">
                  {f.nom}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <h1
          className="text-2xl font-bold tracking-wide text-amber-200 sm:text-3xl"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)",
          }}
        >
          {titre}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-100/80">{chapo}</p>
        <div className={panneauFiltres ? "mt-5 gap-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]" : "mt-5"}>
          {panneauFiltres}
          <div>
        {filtres && <div className="mb-4">{filtres}</div>}

        <p className="font-mono text-lg font-semibold text-amber-100 sm:text-xl">
          {cartes.length} carte{cartes.length > 1 ? "s" : ""}
          {nbFiltres > 0 && (
            <span className="ml-2 text-sm font-normal text-amber-100/50">
              filtré{cartes.length > 1 ? "es" : "e"}
            </span>
          )}
          {pages > 1 && (
            <span className="ml-2 text-sm font-normal text-amber-100/50">
              page {p} / {pages}
            </span>
          )}
        </p>

        <div className="mt-4">
          <GrilleCartes cartes={tranche} />
        </div>

        <PaginationNumerotee page={p} pages={pages} base={base} />
          </div>
        </div>
      </div>
    </main>
  );
}
