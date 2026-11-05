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
      // Texte de badge personnalise, prioritaire sur celui derive de `recue` -
      // pour une reception actee (deal conclu, prix/grades connus) mais dont
      // les vraies photos/videos ne sont pas encore arrivees - demande d'Axel
      // du 2026-09-20 (reception CollectAura du 21/09).
      badge?: string;
      // Vers la page qui liste les cartes de cette reception - demande
      // d'Axel du 2026-09-20 (banderole cliquable).
      lien?: string;
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
    titre: "Réception à venir CollectAura",
    date: "6 cartes envoyées en gradation",
    // Vraies photos (non recadrees carte par carte) du lot envoye en
    // gradation le 04/11/2026, prises telles quelles par Axel - demande du
    // 2026-11-05 ("photos globales avec plusieurs cartes"). Pas encore de
    // fiche avec vraies photos recto/verso tant que les cartes ne sont pas
    // revenues - voir IDS_RECEPTION_COLLECTAURA dans receptions.ts.
    photos: [
      "/img/recep-nov2026-collectaura-1.jpg",
      "/img/recep-nov2026-collectaura-2.jpg",
      "/img/recep-nov2026-collectaura-3.jpg",
    ],
    logoGradeur: "/img/logo-collectaura.png",
    lien: "/reception/collectaura",
  },
  {
    type: "reception",
    titre: "Réception à venir CCC",
    date: "6 cartes envoyées en gradation",
    photos: [
      "/img/recep-nov2026-ccc-1.jpg",
      "/img/recep-nov2026-ccc-2.jpg",
    ],
    logoGradeur: "/img/logo-ccc.png",
    lien: "/reception/ccc",
  },
];
