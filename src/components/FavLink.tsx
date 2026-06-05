"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites";

export default function FavLink() {
  const { count } = useFavorites();
  return (
    <Link
      href="/favorites"
      className="relative rounded-md px-3 py-1.5 text-amber-100 hover:bg-amber-500/10"
    >
      ❤
      {count > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
