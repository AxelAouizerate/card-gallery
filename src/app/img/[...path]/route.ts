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

  // cache: "no-store" est volontaire ici : le cache Data de Next.js retient
  // une reponse fetch() meme si elle est en erreur (403 rate-limit, 5xx).
  // Avec "force-cache", une seule image qui tombait sur un hoquet GitHub
  // restait cassee pour toujours (le retry ci-dessous relisait alors la
  // meme erreur en cache au lieu de refaire une vraie requete) - bug trouve
  // le 2026-09-07 en cherchant pourquoi des images restaient indisponibles
  // malgre le retry ajoute la veille. Le cache navigateur/CDN est deja
  // assure par le Cache-Control sur la Response qu'on renvoie plus bas.
  // Un rate-limit GitHub (403) ou un hoquet reseau (5xx) est transitoire :
  // un seul essai suffisait a faire echouer des images au hasard sur le
  // site entier. On retente une fois apres une courte pause avant
  // d'abandonner (jamais sur un vrai 404, ca n'a aucune chance de changer).
  async function tenter(): Promise<Response> {
    return fetch(ghUrl, { headers, cache: "no-store" });
  }

  let upstream = await tenter();
  if (!upstream.ok && upstream.status !== 404) {
    await new Promise((r) => setTimeout(r, 400));
    upstream = await tenter();
  }

  if (!upstream.ok) {
    // Fallback : raw.githubusercontent, avec le meme token (le repo est
    // prive — sans lui ce fallback echouait toujours, silencieusement).
    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filename}`;
    const fallback = await fetch(rawUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });
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
