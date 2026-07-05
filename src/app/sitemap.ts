import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Le catalogue vit sur une seule page (la home, filtrable côté client), donc
// le sitemap se concentre sur les URLs publiques indexables.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
      images: [`${SITE_URL}/horus-logo.png`],
      alternates: { languages: { "fr-FR": SITE_URL } },
    },
    {
      url: `${SITE_URL}/comment-acheter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: { "fr-FR": `${SITE_URL}/comment-acheter` } },
    },
  ];
}
