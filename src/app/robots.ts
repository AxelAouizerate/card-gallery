import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// On laisse crawler tout le catalogue public mais on bloque les pages
// "compte / tunnel d'achat" qui n'ont aucune valeur SEO (et evitent le
// contenu dupliqué / privé dans l'index).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/favorites",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/stats",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
