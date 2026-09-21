"use client";

import { Search } from "lucide-react";
import { useFiltres } from "./FiltresCatalogue";

// Barre de recherche toujours visible, tout en haut de l'accueil, avant meme
// la banderole d'evenements : le champ nom etait auparavant cache derriere
// un clic ("Filtrer le catalogue") + un scroll, jugé "tres dur a trouver et
// non intuitif" par des visiteurs - retour d'Axel du 2026-09-21. Doit rester
// visible des le premier ecran, sans interaction.
export default function RechercheAccueil() {
  const { f, naviguer } = useFiltres("/cartes");

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        naviguer({ ...f, q: String(new FormData(e.currentTarget).get("q") ?? "") });
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-100/50" />
      <input
        name="q"
        defaultValue={f.q}
        placeholder="Rechercher une carte par nom…"
        className="w-full rounded-lg border border-amber-500/40 bg-black/50 py-3.5 pl-12 pr-4 text-base text-amber-50 placeholder:text-amber-100/40 focus:border-amber-400 focus:outline-none"
      />
    </form>
  );
}
