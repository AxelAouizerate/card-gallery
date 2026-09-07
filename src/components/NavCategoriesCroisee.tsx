import Link from "next/link";
import Image from "next/image";
import { CATEGORIES_META, type CategorieId } from "@/lib/categoriesSpeciales";
import { cartesCategorieSpeciale } from "@/lib/catalogue";
import { ICONES_CATEGORIES } from "./VignettesCategories";

/**
 * Sur chaque page categorielle (sets iconiques, ghost, ultimate,
 * introuvables) : suggestion vers UNE seule des 3 autres (tiree au sort a
 * chaque chargement), pas les 3 d'un coup — pour que le visiteur enchaine
 * naturellement les 4 pages au fil de plusieurs visites plutot que de tout
 * voir d'un coup. Format carte (portrait, etroit) plutot qu'un bandeau
 * large : illustree par la carte la plus chere de la categorie suggeree,
 * pas la photo generique de CATEGORIES_META — vitrine plus parlante que
 * l'icone seule. Precisions d'Axel du 2026-09-07. Placee juste sous le
 * chapo (avantGrille de PageCatalogue), pas en bas de page.
 */
export default async function NavCategoriesCroisee({ actuelle }: { actuelle: CategorieId }) {
  const autres = CATEGORIES_META.filter((c) => c.id !== actuelle);
  const suivante = autres[Math.floor(Math.random() * autres.length)];
  if (!suivante) return null;

  const cartes = await cartesCategorieSpeciale(suivante.id);
  const vedette = cartes[0]?.card; // deja triees par valeur decroissante
  const photo = vedette?.photo_1 ?? suivante.photo;

  return (
    <Link
      href={`/cartes/${suivante.id}`}
      className="group relative flex h-48 w-36 flex-col justify-end overflow-hidden rounded-lg border border-amber-500/25 bg-slate-900 sm:h-56 sm:w-40"
    >
      {photo && (
        <Image
          src={photo}
          alt=""
          fill
          sizes="160px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60" />
      <div className="relative flex flex-col items-center gap-1 p-2.5 text-center">
        <span className="text-amber-300">{ICONES_CATEGORIES[suivante.id]}</span>
        <p className="font-mono text-[9px] uppercase tracking-widest text-amber-100/60">À découvrir aussi</p>
        <p className="text-sm font-bold leading-tight text-amber-100" style={{ fontFamily: "var(--font-cinzel), serif" }}>
          {suivante.titre}
        </p>
      </div>
    </Link>
  );
}
