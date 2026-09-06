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
];
