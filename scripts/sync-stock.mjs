#!/usr/bin/env node
/**
 * Synchronise le stock du site depuis Google Sheets (3 onglets = 3 vendeurs).
 *
 * Chaque onglet est "Publié sur le web" au format CSV ; on passe les URLs par
 * variables d'environnement :
 *   CSV_URL_AXEL, CSV_URL_MARVIN, CSV_URL_QUENTIN
 * (une URL manquante = ce vendeur est simplement ignoré, déploiement progressif OK.)
 *
 * Sortie : public/cards.json (même schéma que le type Card de src/lib/cards.ts).
 *
 * Colonnes attendues dans chaque onglet (l'entête est tolérante : casse,
 * accents et espaces ignorés, plusieurs alias acceptés) :
 *   id, nom, set, rarete, langue, etat, 1ere_edition, grade, societe_grade,
 *   reserve, prix, statut, photo_1, photo_2
 * Le "vendeur" n'est PAS une colonne : c'est le nom de l'onglet (via l'env).
 *
 * Garanties importantes :
 *  - `first_seen` est PRÉSERVÉ depuis le cards.json existant (badge "NEW").
 *  - Les id sont préfixés par vendeur pour rester uniques entre onglets
 *    (Axel: +0, Marvin: +1_000_000, Quentin: +2_000_000). Gardez une colonne
 *    `id` STABLE par carte dans chaque onglet (sinon fallback = n° de ligne).
 */

import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "cards.json");
const TODAY = new Date().toISOString().slice(0, 10);

const SELLERS = [
  { name: "Axel", env: "CSV_URL_AXEL", offset: 0 },
  { name: "Marvin", env: "CSV_URL_MARVIN", offset: 1_000_000 },
  { name: "Quentin", env: "CSV_URL_QUENTIN", offset: 2_000_000 },
];

// ---------- CSV (RFC 4180 : gère guillemets, virgules et \n dans les champs) ----------
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const norm = (h) =>
  (h || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const ALIASES = {
  id: ["id"],
  nom: ["nom", "name", "carte", "card"],
  set: ["set", "extension", "code", "code_extension", "edition"],
  rarete: ["rarete", "rarity"],
  lang: ["langue", "lang", "language"],
  etat: ["etat", "condition", "state"],
  is_1st: ["1st", "1ere", "1ere_edition", "premiere_edition", "first", "is_1st", "1ere_ed"],
  grade: ["grade", "note", "note_grade"],
  grade_org: ["societe_grade", "organisme", "grade_org", "societe", "company"],
  reserve: ["reserve", "reserved"],
  prix: ["prix", "price"],
  statut: ["statut", "status", "statut_raw"],
  photo_1: ["photo_1", "photo1", "photo", "image", "image_1", "recto"],
  photo_2: ["photo_2", "photo2", "image_2", "verso"],
};

function buildColumnMap(header) {
  const normd = header.map(norm);
  const map = {};
  for (const [field, aliases] of Object.entries(ALIASES)) {
    const idx = normd.findIndex((h) => aliases.includes(h));
    if (idx !== -1) map[field] = idx;
  }
  return map;
}

const truthy = (v) => ["1", "oui", "yes", "true", "vrai", "x"].includes((v || "").trim().toLowerCase());

function parsePrice(raw) {
  const v = (raw || "").trim();
  if (!v) return { prix: null, comingSoon: false };
  if (/bient|restaur|gradation|a\s*venir|à\s*venir|venir/i.test(v)) return { prix: null, comingSoon: true };
  const n = parseFloat(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? { prix: n, comingSoon: false } : { prix: null, comingSoon: true };
}

function photo(raw) {
  const v = (raw || "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;        // URL complète -> telle quelle
  return v.startsWith("/") ? v : `/img/${v}`;   // sinon nom de fichier -> /img/...
}

function toCard(cols, r, seller, rowIndex) {
  const get = (f) => (cols[f] != null ? (r[cols[f]] ?? "").trim() : "");
  const sheetId = get("id");
  const numId = sheetId && /^\d+$/.test(sheetId) ? parseInt(sheetId, 10) : rowIndex + 1;
  const id = seller.offset + numId;

  const { prix, comingSoon } = parsePrice(get("prix"));
  const photo_1 = photo(get("photo_1"));
  const photo_2 = photo(get("photo_2"));
  const statut_raw = get("statut") || (comingSoon ? "bientôt en boutique" : "en vente");

  const status = comingSoon ? "coming_soon" : photo_1 ? "available" : "photo_pending";

  const grade = get("grade") || null;
  return {
    id,
    nom: get("nom"),
    set: get("set").toUpperCase(),
    rarete: get("rarete"),
    lang: get("lang").toUpperCase(),
    etat: get("etat").toUpperCase(),
    is_1st: truthy(get("is_1st")),
    grade,
    grade_org: grade ? (get("grade_org") || null) : null,
    reserve: truthy(get("reserve")),
    prix,
    status,
    statut_raw,
    photo_1,
    photo_2,
    vendeur: seller.name,
  };
}

async function fetchSeller(seller) {
  const url = process.env[seller.env];
  if (!url) { console.warn(`! ${seller.name}: ${seller.env} non défini — ignoré`); return []; }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${seller.name}: HTTP ${res.status} sur ${seller.env}`);
  const rows = parseCsv(await res.text());
  if (rows.length < 2) { console.warn(`! ${seller.name}: onglet vide`); return []; }
  const cols = buildColumnMap(rows[0]);
  if (cols.nom == null) throw new Error(`${seller.name}: colonne "nom" introuvable (entête: ${rows[0].join(", ")})`);
  const cards = rows.slice(1).map((r, i) => toCard(cols, r, seller, i)).filter((c) => c.nom);
  console.log(`✓ ${seller.name}: ${cards.length} cartes`);
  return cards;
}

async function loadFirstSeen() {
  try {
    const prev = JSON.parse(await fs.readFile(OUT, "utf-8"));
    return new Map(prev.filter((c) => c.first_seen).map((c) => [c.id, c.first_seen]));
  } catch { return new Map(); }
}

async function main() {
  const firstSeen = await loadFirstSeen();

  const all = [];
  for (const seller of SELLERS) all.push(...(await fetchSeller(seller)));

  if (all.length === 0) {
    console.error("Aucune carte récupérée — cards.json NON modifié (sécurité).");
    process.exit(1);
  }

  for (const c of all) c.first_seen = firstSeen.get(c.id) ?? TODAY;
  all.sort((a, b) => a.id - b.id);

  await fs.writeFile(OUT, JSON.stringify(all, null, 2) + "\n", "utf-8");
  const news = all.filter((c) => c.first_seen === TODAY).length;
  console.log(`→ ${OUT} : ${all.length} cartes (dont ${news} nouvelles aujourd'hui)`);
}

main().catch((e) => { console.error("ERREUR sync-stock:", e.message); process.exit(1); });
