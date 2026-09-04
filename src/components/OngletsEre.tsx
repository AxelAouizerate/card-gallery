import Link from "next/link";
import { ERES } from "@/lib/eres";

// Barre d'onglets par ere, sous le header : navigation immediate pour qui ne
// connait pas les codes de set, sans avoir a taper un nom d'extension.
export default function OngletsEre() {
  return (
    <nav className="border-b border-amber-500/20 bg-black/30">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 text-sm">
        {ERES.map((e) => (
          <Link
            key={e.id}
            href={`/cartes/${e.id}`}
            className="whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-amber-100/70 transition hover:bg-amber-500/15 hover:text-amber-200"
          >
            {e.nom}
          </Link>
        ))}
      </div>
    </nav>
  );
}
