"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Card } from "./cards";
import { cardKey, type CartKey } from "./cart";

const STORAGE_KEY = "cardgallery:favorites:v1";

type FavCtx = {
  ids: Set<CartKey>;
  has: (c: Pick<Card, "id" | "set">) => boolean;
  toggle: (c: Pick<Card, "id" | "set">) => void;
  remove: (c: Pick<Card, "id" | "set">) => void;
  clear: () => void;
  count: number;
};

const FavContext = createContext<FavCtx | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<CartKey>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as CartKey[];
        if (Array.isArray(arr)) setIds(new Set(arr));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
  }, [ids]);

  const has = useCallback((c: Pick<Card, "id" | "set">) => ids.has(cardKey(c)), [ids]);
  const toggle = useCallback((c: Pick<Card, "id" | "set">) => {
    setIds(prev => {
      const k = cardKey(c);
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }, []);
  const remove = useCallback((c: Pick<Card, "id" | "set">) => {
    setIds(prev => {
      if (!prev.has(cardKey(c))) return prev;
      const next = new Set(prev); next.delete(cardKey(c)); return next;
    });
  }, []);
  const clear = useCallback(() => setIds(new Set()), []);

  const value = useMemo<FavCtx>(() => ({
    ids, has, toggle, remove, clear, count: ids.size,
  }), [ids, has, toggle, remove, clear]);

  return <FavContext.Provider value={value}>{children}</FavContext.Provider>;
}

export function useFavorites(): FavCtx {
  const ctx = useContext(FavContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}
