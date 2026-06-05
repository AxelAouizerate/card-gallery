import fs from "node:fs/promises";
import path from "node:path";
import HeaderNav from "@/components/HeaderNav";
import CartPageClient from "@/components/CartPageClient";
import type { Card } from "@/lib/cards";

async function getCards(): Promise<Card[]> {
  const file = path.join(process.cwd(), "public", "cards.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Card[];
}

export default async function CartPage() {
  const cards = await getCards();
  return (
    <main className="min-h-screen">
      <HeaderNav />
      <CartPageClient cards={cards} />
    </main>
  );
}
