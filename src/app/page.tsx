import fs from "node:fs/promises";
import path from "node:path";
import CardGallery from "@/components/CardGallery";
import type { Card } from "@/lib/cards";
import HeaderNav from "@/components/HeaderNav";

async function getCards(): Promise<Card[]> {
  const file = path.join(process.cwd(), "public", "cards.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Card[];
}

export default async function HomePage() {
  const cards = await getCards();
  return (
    <main className="min-h-screen bg-slate-50">
      <HeaderNav />
      <CardGallery cards={cards} />
    </main>
  );
}
