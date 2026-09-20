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
    titre: "Grosse réception CollectAura",
    date: "10 cartes gradées, déjà en boutique",
    // Vraies photos (recto) des cartes recues le 2026-09-20, remplacent les
    // visuels d'annonce maintenant que les cartes sont en vente.
    photos: ["/img/A07_1.jpg", "/img/A09_1.jpg", "/img/1207_1.jpg"],
    logoGradeur: "/img/logo-collectaura.png",
    badge: "Réception confirmée",
    recue: true,
    lien: "/reception/collectaura",
  },
  {
    type: "reception",
    titre: "Nouvelle réception CCC",
    date: "7 cartes gradées, déjà en boutique",
    photos: ["/img/A14_1.jpg", "/img/A08_1.jpg", "/img/1206_1.jpg"],
    logoGradeur: "/img/logo-ccc.png",
    recue: true,
    lien: "/reception/ccc",
  },
];
