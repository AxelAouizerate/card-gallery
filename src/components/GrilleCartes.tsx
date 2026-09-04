import Image from "next/image";
import Link from "next/link";
import SlabBandeau from "./SlabBandeau";
import type { CarteListee } from "@/lib/catalogue";

/**
 * Grille catalogue, rendue cote serveur. Chaque tuile est un lien vers sa
 * fiche produit : c'est ce maillage interne qui rend les 833 cartes crawlables.
 * `priority` sur les 4 premieres, aucune n'est en lazy sur la 1re rangee.
 */
export default function GrilleCartes({ cartes }: { cartes: CarteListee[] }) {
  if (cartes.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-black/30 p-8 text-center text-sm text-amber-100/60">
        Aucune carte ne correspond.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cartes.map(({ slug, card }, i) => {
        const vendue = card.status === "sold";
        const bientot = card.status === "coming_soon";
        return (
          <li key={slug}>
            <Link
              href={`/carte/${slug}`}
              className="group block overflow-hidden rounded-lg border border-white/10 bg-black/40 transition hover:border-amber-400/40 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.25)]"
            >
              <SlabBandeau card={card} />

              <div className="relative aspect-[3/4] w-full bg-slate-900">
                {card.photo_1 && !bientot ? (
                  <Image
                    src={card.photo_1}
                    alt={card.nom}
                    fill
                    priority={i < 4}
                    loading={i < 5 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className={
                      "object-cover transition duration-300 group-hover:scale-[1.02] " +
                      (vendue ? "opacity-40 grayscale" : "")
                    }
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 text-center">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-100/50">
                      {bientot ? "Bientôt en boutique" : "Photos sur demande"}
                    </span>
                  </div>
                )}

                {vendue && (
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-red-800/85 py-1 text-center font-mono text-[11px] font-black uppercase tracking-[0.25em] text-white">
                    Vendue
                  </span>
                )}

                <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col gap-1">
                  {card.pop === 1 && (
                    <span className="rounded-sm bg-amber-500 px-1 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-black">
                      ★ Pop 1
                    </span>
                  )}
                  {card.pop != null && card.pop > 1 && card.pop <= 3 && (
                    <span className="rounded-sm bg-slate-400 px-1 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-black">
                      Low Pop
                    </span>
                  )}
                  {card.is_1st && (
                    <span className="rounded-sm bg-indigo-500 px-1 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-white">
                      1st
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2">
                <p className="truncate text-xs font-medium text-amber-50">{card.nom}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wide text-amber-100/50">
                  {[card.set, card.rarete, card.lang].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 font-mono text-sm font-bold tabular-nums text-amber-300">
                  {vendue ? (
                    <span className="text-red-400">Vendue</span>
                  ) : card.prix != null ? (
                    `${card.prix.toFixed(0)} €`
                  ) : (
                    <span className="text-amber-100/50">—</span>
                  )}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
