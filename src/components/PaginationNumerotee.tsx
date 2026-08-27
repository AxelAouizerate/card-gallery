import Link from "next/link";

/**
 * Pagination numerotee : chaque page est une URL distincte, donc crawlable.
 * L'ancienne pagination "Precedente / Suivante" ne permettait ni de revenir
 * page 14, ni au moteur de decouvrir les pages profondes.
 */
export default function PaginationNumerotee({
  page,
  pages,
  base,
}: {
  page: number;
  pages: number;
  base: string;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => (p === 1 ? base : `${base}?page=${p}`);

  // Fenetre glissante autour de la page courante, plus toujours la 1re et la derniere.
  const autour = new Set<number>([1, pages, page]);
  for (let d = 1; d <= 2; d++) {
    if (page - d >= 1) autour.add(page - d);
    if (page + d <= pages) autour.add(page + d);
  }
  const numeros = [...autour].sort((a, b) => a - b);

  const style =
    "inline-flex min-w-9 items-center justify-center rounded-md border px-2.5 py-1.5 font-mono text-sm";
  const inactif = "border-amber-500/25 bg-black/40 text-amber-100/80 hover:bg-amber-500/10";
  const actif = "border-amber-400 bg-amber-500/25 font-bold text-amber-50";

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={`${style} ${inactif}`} aria-label="Page précédente">
          ‹
        </Link>
      )}
      {numeros.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - numeros[i - 1] > 1 && (
            <span className="px-1 text-amber-100/40" aria-hidden>
              …
            </span>
          )}
          {n === page ? (
            <span className={`${style} ${actif}`} aria-current="page">
              {n}
            </span>
          ) : (
            <Link href={href(n)} className={`${style} ${inactif}`}>
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} rel="next" className={`${style} ${inactif}`} aria-label="Page suivante">
          ›
        </Link>
      )}
    </nav>
  );
}
