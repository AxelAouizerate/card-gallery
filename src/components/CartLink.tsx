"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="relative rounded-md px-3 py-1.5 text-amber-100 hover:bg-amber-500/10"
    >
      Panier
      {count > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-black">
          {count}
        </span>
      )}
    </Link>
  );
}
