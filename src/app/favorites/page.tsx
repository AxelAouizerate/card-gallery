import fs from "node:fs/promises";
import path from "node:path";
import HeaderNav from "@/components/HeaderNav";
import FavoritesPageClient from "@/components/FavoritesPageClient";
import type { Card } from "@/lib/cards";

async function getCards(): Promise<Card[]> {
  const file = path.join(process.cwd(), "public", "cards.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Card[];
}

export default async function FavoritesPage() {
  const cards = await getCards();
  return (
    <main className="min-h-screen">
      <HeaderNav />
      <FavoritesPageClient cards={cards} />
    </main>
  );
}
