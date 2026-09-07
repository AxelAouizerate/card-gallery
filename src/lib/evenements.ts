// Evenements de la banderole "a la une" de l'accueil (BandeauEvenements).
// Deux types : une reception (photos des grosses pieces + logo du gradeur)
// ou un live (lien direct vers Whatnot/Voggt). Edite ce tableau a la main
// au fur et a mesure des annonces — pas de back-office pour l'instant.
export type Evenement =
  | {
      type: "reception";
      titre: string;
      date: string;
      photos: string[];
      logoGradeur?: string;
      // true = deja en stock (badge "Nouvelle reception" au lieu de "a venir") -
      // demande d'Axel du 2026-09-07 pour un recap de reception passee.
      recue?: boolean;
    }
  | {
      type: "live";
      titre: string;
      date: string;
      lien: string;
      plateforme: string;
    };

export const EVENEMENTS: Evenement[] = [
  {
    type: "reception",
    titre: "Grosse réception CollectAura",
    date: "13 septembre 2026",
    photos: [
      "/img/annonce-neos-geant-ulti.jpg",
      "/img/annonce-dragon-rouge-majestueux.jpg",
      "/img/annonce-dragon-arc-en-ciel.webp",
    ],
    logoGradeur: "/img/logo-collectaura.png",
  },
  {
    type: "reception",
    titre: "Nouvelle réception CCC",
    date: "7 cartes gradées, déjà en boutique",
    photos: ["/img/A14_1.jpg", "/img/A08_1.jpg", "/img/1206_1.jpg"],
    logoGradeur: "/img/logo-ccc.png",
    recue: true,
  },
];
