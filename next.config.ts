import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Proxy d'images : cf src/app/img/[...path]/route.ts (utilise un token
     serveur, marche meme avec un repo GitHub prive). */
  images: {
    // L'optimiseur Next/Vercel a un quota mensuel d'images optimisees ; une
    // fois depasse, TOUTES les images (meme deja vues) renvoient 402 Payment
    // Required - trouve le 2026-09-07 en testant /_next/image directement
    // (c'etait la vraie cause des "images cassees au hasard partout", pas
    // le cache d'erreurs GitHub corrige la veille). On sert donc les images
    // telles quelles depuis le proxy /img (deja cache 1 an cote navigateur/
    // CDN via Cache-Control), sans passer par l'optimiseur payant.
    unoptimized: true,
  },
};

export default nextConfig;
