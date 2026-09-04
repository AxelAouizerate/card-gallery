import Link from "next/link";
import Image from "next/image";

type Categorie = {
  titre: string;
  href: string;
  photo: string | null;
  icone: React.ReactNode;
};

const CATEGORIES: Categorie[] = [
  {
    titre: "Sets iconiques",
    href: "/cartes?set=LDD-F,MRD,MDM,SDP-F",
    photo: "/img/Q03.jpg",
    icone: <IconeEtoile />,
  },
  {
    titre: "Ghost Rare",
    href: "/cartes?rarete=Ghost",
    photo: "/img/tdgs-fr040-g.jpg",
    icone: <IconeFantome />,
  },
  {
    titre: "Ultimate Rare",
    href: "/cartes?rarete=Ultimate",
    photo: "/img/1081_1.jpg",
    icone: <IconeCouronne />,
  },
  {
    titre: "Sets introuvables",
    href: "/cartes?set=LDC,DCR",
    photo: "/img/dcr-fr016-g.jpg",
    icone: <IconeLoupe />,
  },
];

// Grille de vignettes cliquables : la porte d'entree pour qui ne connait pas
// les codes de set (LDD, MRD...) et n'ira jamais taper "RP02" dans une barre
// de recherche.
export default function VignettesCategories() {
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.titre}
            href={c.href}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-amber-500/20 bg-slate-900"
          >
            {c.photo ? (
              <Image
                src={c.photo}
                alt={c.titre}
                fill
                priority
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-85"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-100/40">
                  Photo à venir
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center">
              <span className="text-amber-300">{c.icone}</span>
              <span
                className="text-sm font-bold uppercase tracking-wide text-amber-100 sm:text-base"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {c.titre}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function IconeEtoile() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5 14.6 9.3 21.8 9.8 16.2 14.3 18.1 21.3 12 17.3 5.9 21.3 7.8 14.3 2.2 9.8 9.4 9.3Z" />
    </svg>
  );
}

function IconeFantome() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C7.58 2 4 5.58 4 10v10.2c0 .5.6.76.96.4l1.9-1.86 1.9 1.86c.24.24.62.24.86 0l1.9-1.86 1.9 1.86c.24.24.62.24.86 0l1.9-1.86 1.9 1.86c.36.36.96.1.96-.4V10c0-4.42-3.58-8-8-8Z" />
      <circle cx="9" cy="10.5" r="1.3" fill="#1e1b4b" />
      <circle cx="15" cy="10.5" r="1.3" fill="#1e1b4b" />
    </svg>
  );
}

function IconeCouronne() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 8 7 11 12 4 17 11 21 8 20 18H4L3 8Z" />
    </svg>
  );
}

function IconeLoupe() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.3" y2="15.3" />
    </svg>
  );
}
