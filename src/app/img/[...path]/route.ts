import { NextRequest } from "next/server";

// Proxy d'images : fetch les photos depuis le repo GitHub *prive*
// `cards-photos` en utilisant le token serveur, puis stream au browser.
// Le browser ne voit jamais l'URL GitHub ni le username.
//
// Pre-requis (env vars Vercel) :
//   GITHUB_TOKEN          : fine-grained PAT, Contents:read sur cards-photos
//   GITHUB_PHOTOS_REPO    : "AxelAouizerate/cards-photos" (defaut)
//   GITHUB_PHOTOS_BRANCH  : "main" (defaut)

const REPO = process.env.GITHUB_PHOTOS_REPO ?? "AxelAouizerate/cards-photos";
const BRANCH = process.env.GITHUB_PHOTOS_BRANCH ?? "main";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  gif: "image/gif", webp: "image/webp", heic: "image/heic", heif: "image/heif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filename = path.join("/");
  // Garde-fou : pas de chemin parent (.., ./)
  if (!filename || filename.includes("..") || filename.startsWith("/")) {
    return new Response("Bad request", { status: 400 });
  }
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new Response("Bad extension", { status: 400 });

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw",
    "User-Agent": "card-gallery-proxy",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // L'API GitHub Contents marche pour les repos prives avec un token, et
  // sait servir le contenu brut quand on demande Accept: vnd.github.raw.
  const ghUrl = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(filename)}?ref=${BRANCH}`;
  const upstream = await fetch(ghUrl, { headers, cache: "force-cache" });

  if (!upstream.ok) {
    // Fallback : raw.githubusercontent (utile si le repo est encore public
    // et qu'on n'a pas encore mis le token)
    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filename}`;
    const fallback = await fetch(rawUrl, { cache: "force-cache" });
    if (!fallback.ok) {
      return new Response(`Not found (${upstream.status}/${fallback.status})`,
                          { status: 404 });
    }
    return new Response(fallback.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
