"use client";

import { useRouter } from "next/navigation";
import { PAR_PAGE_OPTIONS } from "./PageCatalogue";

/**
 * Menu "afficher X par page" en bas des pages de catalogue - demande d'Axel
 * du 2026-09-23. Change de taille = retour a la page 1 (une page 5 a 40/page
 * n'a plus forcement de sens a 200/page), les autres filtres sont preserves.
 */
export default function SelecteurParPage({
  base,
  queryExtra,
  valeur,
}: {
  base: string;
  queryExtra: string;
  valeur: number;
}) {
  const router = useRouter();

  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-100/70">
      <label htmlFor="par-page">Afficher</label>
      <select
        id="par-page"
        value={valeur}
        onChange={(e) => {
          const params = new URLSearchParams(queryExtra);
          const v = Number(e.target.value);
          if (v !== PAR_PAGE_OPTIONS[0]) params.set("parPage", String(v));
          else params.delete("parPage");
          const qs = params.toString();
          router.push(qs ? `${base}?${qs}` : base, { scroll: false });
        }}
        className="rounded-md border border-amber-500/30 bg-black/50 px-2 py-1 font-mono text-amber-50 focus:border-amber-400 focus:outline-none"
      >
        {PAR_PAGE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>par page</span>
    </div>
  );
}
