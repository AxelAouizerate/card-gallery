import type { Card } from "@/lib/cards";

/**
 * Bandeau facon coque de gradation. C'est l'element signature du catalogue :
 * organisme + note en chasse fixe, comme sur un vrai slab. Les cartes non
 * gradees portent le meme bandeau, en gris, pour que la grille reste reguliere
 * et que la difference se lise d'un coup d'oeil.
 */
export default function SlabBandeau({
  card,
  taille = "sm",
}: {
  card: Pick<Card, "grade" | "grade_org" | "pop">;
  taille?: "sm" | "lg";
}) {
  const gradee = Boolean(card.grade);
  const org = (card.grade_org || "GRADÉE").toUpperCase();
  const petit = taille === "sm";

  return (
    <div
      className={
        "flex items-center justify-between border-b " +
        (gradee
          ? "border-amber-400/40 bg-gradient-to-r from-amber-500/25 via-amber-400/10 to-amber-500/25"
          : "border-white/10 bg-white/[0.04]") +
        (petit ? " px-2 py-1" : " px-4 py-2")
      }
    >
      <span
        className={
          "font-mono uppercase tracking-[0.18em] " +
          (gradee ? "text-amber-200" : "text-slate-400") +
          (petit ? " text-[9px]" : " text-xs")
        }
      >
        {gradee ? org : "NON GRADÉE"}
      </span>
      {gradee && (
        <span
          className={
            "font-mono font-bold tabular-nums text-amber-100 " +
            (petit ? "text-[11px]" : "text-base")
          }
        >
          {card.grade}
        </span>
      )}
    </div>
  );
}
