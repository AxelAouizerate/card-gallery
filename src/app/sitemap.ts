import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { cartesAvecSlug, setsDuCatalogue } from "@/lib/catalogue";

/**
 * Sitemap genere depuis le catalogue : les 833 fiches produit, les pages
 * d'atterrissage et une entree par set. Seules ces URLs sont indexables —
 * les combinaisons de filtres sont exclues (cf. robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const cartes = await cartesAvecSlug();
  const sets = await setsDuCatalogue();

  const racines: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/cartes`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/cartes/gradees`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/cartes/1ere-edition`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/cartes/japonaises`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/comment-acheter`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const parSet: MetadataRoute.Sitemap = sets.map(({ set }) => ({
    url: `${SITE_URL}/cartes/${encodeURIComponent(set.toLowerCase())}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const fiches: MetadataRoute.Sitemap = cartes.map(({ slug, card }) => ({
    url: `${SITE_URL}/carte/${slug}`,
    // `first_seen` est la seule date de modification dont on dispose par carte.
    lastModified: card.first_seen ? new Date(`${card.first_seen}T00:00:00Z`) : now,
    changeFrequency: "weekly" as const,
    // Une carte vendue reste indexee, mais elle ne merite plus la meme priorite.
    priority: card.status === "sold" ? 0.3 : 0.7,
    ...(card.photo_1 ? { images: [`${SITE_URL}${card.photo_1}`] } : {}),
  }));

  return [...racines, ...parSet, ...fiches];
}
