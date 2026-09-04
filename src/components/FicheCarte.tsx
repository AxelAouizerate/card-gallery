import type { Card } from "@/lib/cards";
import SlabBandeau from "./SlabBandeau";
import FichePhotos from "./FichePhotos";
import { sellerInstagramUrl } from "@/lib/site";
import { libelleSet } from "@/lib/sets";
import { libelleEtat } from "@/lib/etats";

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-1.5">
      <dt className="text-xs uppercase tracking-wide text-amber-100/50">{label}</dt>
      <dd className="text-sm text-amber-50">{children}</dd>
    </div>
  );
}

export default function FicheCarte({ card }: { card: Card }) {
  const photos = [card.photo_1, card.photo_2].filter(Boolean) as string[];
  const vendue = card.status === "sold";
  const bientot = card.status === "coming_soon";
  const instagram = sellerInstagramUrl(card.vendeur);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <SlabBandeau card={card} taille="lg" />

      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,340px)_1fr]">
        <div className="relative">
          <FichePhotos photos={photos} nom={card.nom} bientot={bientot} />

          {(card.pop != null || card.is_1st) && (
            <div className="pointer-events-none absolute left-2 top-9 flex flex-col gap-1">
              {card.pop === 1 && (
                <span className="rounded-sm bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow">
                  ★ Pop 1
                </span>
              )}
              {card.pop != null && card.pop > 1 && card.pop <= 3 && (
                <span className="rounded-sm bg-slate-400 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow">
                  Low Pop · {card.pop}
                </span>
              )}
              {card.is_1st && (
                <span className="rounded-sm bg-indigo-500 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-white shadow">
                  1st
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-amber-50" style={{ fontFamily: "var(--font-cinzel), serif" }}>
            {card.nom}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-amber-100/60">
            {[card.set, card.rarete, card.lang].filter(Boolean).join(" · ")}
            {card.is_1st ? " · 1ère édition" : ""}
          </p>

          <div className="mt-4">
            {vendue ? (
              <p className="text-2xl font-black uppercase tracking-[0.2em] text-red-400">Vendue</p>
            ) : card.prix != null ? (
              <>
                <p className="font-mono text-3xl font-bold tabular-nums text-amber-300">
                  {card.prix.toFixed(0)} €
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-300/90">ou proposez votre offre</p>
              </>
            ) : (
              <p className="text-base font-medium uppercase tracking-wide text-amber-300">
                Bientôt en boutique
              </p>
            )}
          </div>

          <dl className="mt-5">
            <Ligne label="Set">{libelleSet(card.set)}</Ligne>
            <Ligne label="Rareté">{card.rarete || "—"}</Ligne>
            <Ligne label="Langue">{card.lang}</Ligne>
            <Ligne label="1ère édition">{card.is_1st ? "Oui" : "Non"}</Ligne>
            <Ligne label="Gradation">
              {card.grade ? (
                <span className="font-mono">{`${card.grade_org ?? ""} ${card.grade}`.trim()}</span>
              ) : (
                "Non gradée"
              )}
            </Ligne>
            {card.pop != null && (
              <Ligne label="Population">
                <span className="font-mono">Pop {card.pop}</span>
                {card.pop === 1 ? " — unique à ce grade et au-dessus" : ""}
              </Ligne>
            )}
            <Ligne label="État">
              {card.grade
                ? libelleEtat(card.etat) || "—"
                : photos.length > 0
                  ? "Visible sur les photos"
                  : card.etat || "—"}
            </Ligne>
          </dl>

          {instagram && !vendue && !bientot && (
            <div className="mt-6">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-md bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow transition hover:opacity-90"
              >
                Contacter le vendeur sur Instagram
              </a>
              <p className="mt-1.5 text-center text-xs leading-relaxed text-amber-100/60">
                Un seul bouton pour tout : acheter au prix indiqué, faire une offre ou demander
                photos et vidéo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
