"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Command } from "cmdk";
import { SlidersHorizontal, Search, X, Check } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  lireFiltres, ecrireFiltres, nbFiltresActifs, FILTRES_VIDES, type Filtres,
} from "@/lib/filtres";

export type OptionsFiltres = {
  sets: { set: string; n: number }[];
  raretes: string[];
  langues: string[];
  prixMax: number;
};

/**
 * Etat des filtres, lu et ecrit dans l'URL. Partage par la colonne laterale
 * (desktop) et le drawer (mobile) : les deux pilotent les memes searchParams,
 * donc ils restent synchronises sans etat local a reconcilier.
 */
function useFiltres(base: string) {
  const router = useRouter();
  const params = useSearchParams();
  const [enCours, demarrer] = useTransition();

  const f = useMemo(() => lireFiltres(Object.fromEntries(params.entries())), [params]);

  const naviguer = useCallback(
    (suivant: Filtres) => {
      const qs = ecrireFiltres({ ...suivant, page: 1 });
      demarrer(() => router.push(qs ? `${base}?${qs}` : base, { scroll: false }));
    },
    [base, router],
  );

  const bascule = useCallback(
    (cle: "raretes" | "langues" | "sets", valeur: string) => {
      const courant = f[cle];
      naviguer({
        ...f,
        [cle]: courant.includes(valeur) ? courant.filter((v) => v !== valeur) : [...courant, valeur],
      });
    },
    [f, naviguer],
  );

  return { f, naviguer, bascule, enCours, actifs: nbFiltresActifs(f) };
}

const puce = (actif: boolean) =>
  cn(
    "rounded-full border px-3 py-1.5 text-xs transition",
    actif
      ? "border-amber-400 bg-amber-500/25 font-semibold text-amber-50"
      : "border-white/15 bg-white/5 text-amber-100/75 hover:border-amber-400/40",
  );

/** Les controles eux-memes, sans habillage : reutilises tels quels des deux cotes. */
function CorpsFiltres({ options, base }: { options: OptionsFiltres; base: string }) {
  const { f, naviguer, bascule, actifs } = useFiltres(base);

  return (
    <div className="space-y-6">
      <Bloc titre="Set / Extension">
        <Command className="overflow-hidden rounded-md border border-white/10 bg-black/40">
          <div className="flex items-center border-b border-white/10 px-2">
            <Search className="h-4 w-4 shrink-0 text-amber-100/40" />
            <Command.Input
              placeholder="Tapez CRV, LOB…"
              className="w-full bg-transparent px-2 py-2 text-sm text-amber-50 placeholder:text-amber-100/35 focus:outline-none"
            />
          </div>
          <Command.List className="max-h-52 overflow-y-auto p-1">
            <Command.Empty className="px-2 py-3 text-xs text-amber-100/50">Aucun set.</Command.Empty>
            {options.sets.map(({ set, n }) => {
              const choisi = f.sets.includes(set);
              return (
                <Command.Item
                  key={set}
                  value={set}
                  onSelect={() => bascule("sets", set)}
                  className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm text-amber-100/85 data-[selected=true]:bg-amber-500/15"
                >
                  <span className="flex items-center gap-2 font-mono uppercase">
                    <Check className={cn("h-3.5 w-3.5", choisi ? "text-amber-300 opacity-100" : "opacity-0")} />
                    {set}
                  </span>
                  <span className="font-mono text-xs text-amber-100/40">{n}</span>
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </Bloc>

      <Bloc titre="Rareté">
        <div className="flex flex-wrap gap-1.5">
          {options.raretes.map((r) => (
            <button key={r} type="button" onClick={() => bascule("raretes", r)} className={puce(f.raretes.includes(r))}>
              {r}
            </button>
          ))}
        </div>
      </Bloc>

      <Bloc titre="Langue">
        <div className="flex flex-wrap gap-1.5">
          {options.langues.map((l) => (
            <button key={l} type="button" onClick={() => bascule("langues", l)} className={puce(f.langues.includes(l))}>
              {l}
            </button>
          ))}
        </div>
      </Bloc>

      <Bloc titre="Prix (€)">
        <div className="flex items-center gap-2">
          <ChampNombre valeur={f.prixMin} placeholder="min" onValider={(v) => naviguer({ ...f, prixMin: v })} />
          <span className="text-amber-100/40">—</span>
          <ChampNombre valeur={f.prixMax} placeholder={String(Math.round(options.prixMax))} onValider={(v) => naviguer({ ...f, prixMax: v })} />
        </div>
      </Bloc>

      <Bloc titre="Gradation">
        <div className="flex flex-wrap gap-1.5">
          {([["", "Toutes"], ["gradee", "Gradée"], ["non-gradee", "Non gradée"]] as const).map(([v, lib]) => (
            <button key={v || "toutes"} type="button" onClick={() => naviguer({ ...f, gradation: v })} className={puce(f.gradation === v)}>
              {lib}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[10, 9, 8, 7, 6].map((n) => (
            <button key={n} type="button" onClick={() => naviguer({ ...f, noteMin: f.noteMin === n ? null : n })} className={puce(f.noteMin === n)}>
              <span className="font-mono">≥ {n}</span>
            </button>
          ))}
        </div>
      </Bloc>

      <Bloc titre="Autres">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => naviguer({ ...f, edition1st: !f.edition1st })} className={puce(f.edition1st)}>1ère édition</button>
          <button type="button" onClick={() => naviguer({ ...f, pop1: !f.pop1 })} className={puce(f.pop1)}>★ Pop 1</button>
          <button type="button" onClick={() => naviguer({ ...f, dispo: !f.dispo })} className={puce(f.dispo)}>Disponible</button>
          <button type="button" onClick={() => naviguer({ ...f, nouveautes: !f.nouveautes })} className={puce(f.nouveautes)}>Nouveautés</button>
        </div>
      </Bloc>

      {actifs > 0 && (
        <button
          type="button"
          onClick={() => naviguer({ ...FILTRES_VIDES })}
          className="w-full rounded-md border border-white/15 px-3 py-2 text-sm text-amber-100/80 hover:bg-white/5"
        >
          Tout effacer ({actifs})
        </button>
      )}
    </div>
  );
}

/**
 * Colonne laterale, visible en permanence a partir de lg et collante au scroll :
 * les filtres restent atteignables sans remonter en haut de page.
 */
export function PanneauFiltres({ options, base }: { options: OptionsFiltres; base: string }) {
  const { enCours } = useFiltres(base);
  return (
    <aside
      className={cn(
        "sticky top-4 hidden max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-amber-500/20 bg-black/40 p-4 lg:block",
        enCours && "opacity-60 transition-opacity",
      )}
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-200">Filtrer</h2>
      <CorpsFiltres options={options} base={base} />
    </aside>
  );
}

/**
 * Barre au-dessus de la grille : recherche, chips des filtres actifs, et — en
 * mobile uniquement — le drawer, faute de place pour une colonne laterale.
 */
export default function BarreFiltres({ options, base }: { options: OptionsFiltres; base: string }) {
  const { f, naviguer, bascule, enCours, actifs } = useFiltres(base);
  const [ouvert, setOuvert] = useState(false);

  const chips: { libelle: string; retirer: () => void }[] = [
    ...(f.q ? [{ libelle: `« ${f.q} »`, retirer: () => naviguer({ ...f, q: "" }) }] : []),
    ...f.sets.map((s) => ({ libelle: s, retirer: () => bascule("sets", s) })),
    ...f.raretes.map((r) => ({ libelle: r, retirer: () => bascule("raretes", r) })),
    ...f.langues.map((l) => ({ libelle: l, retirer: () => bascule("langues", l) })),
    ...(f.gradation ? [{ libelle: f.gradation === "gradee" ? "Gradée" : "Non gradée", retirer: () => naviguer({ ...f, gradation: "" }) }] : []),
    ...(f.noteMin != null ? [{ libelle: `Note ≥ ${f.noteMin}`, retirer: () => naviguer({ ...f, noteMin: null }) }] : []),
    ...(f.prixMin != null ? [{ libelle: `≥ ${f.prixMin} €`, retirer: () => naviguer({ ...f, prixMin: null }) }] : []),
    ...(f.prixMax != null ? [{ libelle: `≤ ${f.prixMax} €`, retirer: () => naviguer({ ...f, prixMax: null }) }] : []),
    ...(f.edition1st ? [{ libelle: "1ère édition", retirer: () => naviguer({ ...f, edition1st: false }) }] : []),
    ...(f.pop1 ? [{ libelle: "★ Pop 1", retirer: () => naviguer({ ...f, pop1: false }) }] : []),
    ...(f.dispo ? [{ libelle: "Disponible", retirer: () => naviguer({ ...f, dispo: false }) }] : []),
    ...(f.nouveautes ? [{ libelle: "Nouveautés", retirer: () => naviguer({ ...f, nouveautes: false }) }] : []),
  ];

  return (
    <div className={cn("space-y-3", enCours && "opacity-60 transition-opacity")}>
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="relative min-w-[200px] flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            naviguer({ ...f, q: String(new FormData(e.currentTarget).get("q") ?? "") });
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-100/40" />
          <input
            name="q"
            defaultValue={f.q}
            placeholder="Rechercher une carte…"
            className="w-full rounded-md border border-amber-500/30 bg-black/50 py-2 pl-9 pr-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-400 focus:outline-none"
          />
        </form>

        {/* Le drawer n'existe qu'en mobile : en desktop les filtres sont dans
            la colonne laterale, jamais derriere un bouton. */}
        <Sheet open={ouvert} onOpenChange={setOuvert}>
          <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/25 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {actifs > 0 && (
              <span className="rounded-full bg-amber-400 px-1.5 font-mono text-[11px] font-bold text-black">{actifs}</span>
            )}
          </SheetTrigger>
          <SheetContent titre="Filtrer le catalogue">
            <div className="pb-4">
              <CorpsFiltres options={options} base={base} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c, i) => (
            <Badge key={`${c.libelle}-${i}`} className="cursor-pointer hover:bg-amber-500/25" onClick={c.retirer}>
              {c.libelle}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <button
            type="button"
            onClick={() => naviguer({ ...FILTRES_VIDES })}
            className="ml-1 text-xs text-amber-100/50 underline hover:text-amber-100"
          >
            tout effacer
          </button>
        </div>
      )}
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-100/50">{titre}</h3>
      {children}
    </section>
  );
}

function ChampNombre({
  valeur, placeholder, onValider,
}: { valeur: number | null; placeholder: string; onValider: (v: number | null) => void }) {
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      defaultValue={valeur ?? ""}
      placeholder={placeholder}
      onBlur={(e) => {
        const v = e.currentTarget.value.trim();
        onValider(v === "" ? null : Number(v));
      }}
      className="w-full rounded-md border border-amber-500/30 bg-black/50 px-2 py-1.5 text-center font-mono text-sm text-amber-50 placeholder:text-amber-100/30 focus:border-amber-400 focus:outline-none"
    />
  );
}
