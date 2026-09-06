import Link from "next/link";
import Image from "next/image";
import { CATEGORIES_META, type CategorieId } from "@/lib/categoriesSpeciales";
import { ICONES_CATEGORIES } from "./VignettesCategories";

/**
 * Sur chaque page categorielle (sets iconiques, ghost, ultimate,
 * introuvables) : boutons vers les 3 autres, pour enchainer la visite sans
 * repasser par l'accueil. Placee juste sous le chapo (avantGrille de
 * PageCatalogue), pas en bas de page — l'utilisateur n'a pas a scroller
 * jusqu'au bout pour continuer sa navigation.
 */
export default function NavCategoriesCroisee({ actuelle }: { actuelle: CategorieId }) {
  const autres = CATEGORIES_META.filter((c) => c.id !== actuelle);
  return (
    <div className="flex flex-wrap gap-2">
      {autres.map((c) => (
        <Link
          key={c.id}
          href={`/cartes/${c.id}`}
          className="group relative flex h-14 w-full items-center gap-2.5 overflow-hidden rounded-md border border-amber-500/20 bg-slate-900 pr-3 sm:w-auto"
        >
          {c.photo && (
            <Image src={c.photo} alt="" fill sizes="200px" className="object-cover opacity-40 transition group-hover:opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <span className="relative ml-3 text-amber-300">{ICONES_CATEGORIES[c.id]}</span>
          <span className="relative font-mono text-xs uppercase tracking-wide text-amber-100">
            Voir « {c.titre} »
          </span>
        </Link>
      ))}
    </div>
  );
}
