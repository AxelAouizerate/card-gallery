import Link from "next/link";
import Image from "next/image";
import { CATEGORIES_META, type CategorieId } from "@/lib/categoriesSpeciales";
import { ICONES_CATEGORIES } from "./VignettesCategories";

/**
 * Sur chaque page categorielle (sets iconiques, ghost, ultimate,
 * introuvables) : suggestion vers UNE seule des 3 autres (tiree au sort a
 * chaque chargement), pas les 3 d'un coup — pour que le visiteur enchaine
 * naturellement les 4 pages au fil de plusieurs visites plutot que de tout
 * voir d'un coup. Illustration bien visible (pas juste une icone) —
 * precisions d'Axel du 2026-09-07. Placee juste sous le chapo (avantGrille
 * de PageCatalogue), pas en bas de page.
 */
export default function NavCategoriesCroisee({ actuelle }: { actuelle: CategorieId }) {
  const autres = CATEGORIES_META.filter((c) => c.id !== actuelle);
  const suivante = autres[Math.floor(Math.random() * autres.length)];
  if (!suivante) return null;
  return (
    <Link
      href={`/cartes/${suivante.id}`}
      className="group relative flex h-32 w-full items-end overflow-hidden rounded-lg border border-amber-500/25 bg-slate-900 sm:h-36"
    >
      {suivante.photo && (
        <Image
          src={suivante.photo}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 700px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="relative flex items-center gap-2.5 p-4">
        <span className="text-amber-300">{ICONES_CATEGORIES[suivante.id]}</span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber-100/60">À découvrir aussi</p>
          <p className="text-base font-bold text-amber-100 sm:text-lg" style={{ fontFamily: "var(--font-cinzel), serif" }}>
            {suivante.titre}
          </p>
        </div>
      </div>
    </Link>
  );
}
