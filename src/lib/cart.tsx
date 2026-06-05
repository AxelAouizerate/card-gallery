"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Card } from "./cards";

// Stockage local navigateur : { [cardKey]: 1 } - on ne stocke que la cle
// (id+set) pour distinguer les eventuels doublons d'id dans le CSV legacy.
const STORAGE_KEY = "cardgallery:cart:v1";
export type CartKey = string;
export const cardKey = (c: Pick<Card, "id" | "set">): CartKey => `${c.id}-${c.set}`;

type CartCtx = {
  ids: Set<CartKey>;
  has: (c: Pick<Card, "id" | "set">) => boolean;
  add: (c: Pick<Card, "id" | "set">) => void;
  remove: (c: Pick<Card, "id" | "set">) => void;
  toggle: (c: Pick<Card, "id" | "set">) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<CartKey>>(new Set());

  // Hydrate depuis localStorage au mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as CartKey[];
        if (Array.isArray(arr)) setIds(new Set(arr));
      }
    } catch {}
  }, []);

  // Persiste a chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {}
  }, [ids]);

  const has = useCallback((c: Pick<Card, "id" | "set">) => ids.has(cardKey(c)), [ids]);
  const add = useCallback((c: Pick<Card, "id" | "set">) => {
    setIds(prev => {
      if (prev.has(cardKey(c))) return prev;
      const next = new Set(prev); next.add(cardKey(c)); return next;
    });
  }, []);
  const remove = useCallback((c: Pick<Card, "id" | "set">) => {
    setIds(prev => {
      if (!prev.has(cardKey(c))) return prev;
      const next = new Set(prev); next.delete(cardKey(c)); return next;
    });
  }, []);
  const toggle = useCallback((c: Pick<Card, "id" | "set">) => {
    setIds(prev => {
      const k = cardKey(c);
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }, []);
  const clear = useCallback(() => setIds(new Set()), []);

  const value = useMemo<CartCtx>(() => ({
    ids, has, add, remove, toggle, clear, count: ids.size,
  }), [ids, has, add, remove, toggle, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
