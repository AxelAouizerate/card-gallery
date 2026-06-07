"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Card } from "./cards";
import { createClient } from "./supabase/client";
import { addToCart, removeFromCart, listCart, clearCart } from "@/app/actions/sync";

// Stockage local navigateur : { [cardKey]: 1 } - on ne stocke que la cle
// (id+set) pour distinguer les eventuels doublons d'id dans le CSV legacy.
const STORAGE_KEY = "cardgallery:cart:v1";
export type CartKey = string;
export const cardKey = (c: Pick<Card, "id" | "set">): CartKey => `${c.id}-${c.set}`;

type CartCtx = {
  ids: Set<CartKey>;
  has: (c: Pick<Card, "id" | "set">) => boolean;
  add: (c: Card) => void;
  remove: (c: Pick<Card, "id" | "set">) => void;
  toggle: (c: Card) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartCtx | null>(null);

function parseKey(k: CartKey): { cardId: number; cardSet: string } {
  // format: `${id}-${set}` — set peut contenir des tirets, donc on split au 1er
  const i = k.indexOf("-");
  return { cardId: Number(k.slice(0, i)), cardSet: k.slice(i + 1) };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<CartKey>>(new Set());
  const isLogged = useRef(false);

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

  // Sync auth : fetch serveur + merge avec localStorage au login.
  useEffect(() => {
    let supabase;
    try { supabase = createClient(); } catch { return; }

    const syncOnLogin = async () => {
      try {
        const serverKeys = await listCart();
        setIds(prev => {
          const next = new Set(prev);
          serverKeys.forEach(k => next.add(k));
          // Pousse les locales pas encore sur le serveur
          prev.forEach(k => {
            if (!serverKeys.includes(k)) {
              const { cardId, cardSet } = parseKey(k);
              addToCart({ cardId, cardSet }).catch(() => {});
            }
          });
          return next;
        });
      } catch {}
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      isLogged.current = !!user;
      if (user) syncOnLogin();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const was = isLogged.current;
      isLogged.current = !!session?.user;
      if (!was && isLogged.current) syncOnLogin();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const has = useCallback((c: Pick<Card, "id" | "set">) => ids.has(cardKey(c)), [ids]);
  const add = useCallback((c: Card) => {
    setIds(prev => {
      if (prev.has(cardKey(c))) return prev;
      const next = new Set(prev); next.add(cardKey(c)); return next;
    });
    if (isLogged.current) {
      addToCart({ cardId: c.id, cardSet: c.set, cardNom: c.nom, cardPrix: c.prix }).catch(() => {});
    }
  }, []);
  const remove = useCallback((c: Pick<Card, "id" | "set">) => {
    setIds(prev => {
      if (!prev.has(cardKey(c))) return prev;
      const next = new Set(prev); next.delete(cardKey(c)); return next;
    });
    if (isLogged.current) {
      removeFromCart({ cardId: c.id, cardSet: c.set }).catch(() => {});
    }
  }, []);
  const toggle = useCallback((c: Card) => {
    const k = cardKey(c);
    setIds(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
    const wasIn = ids.has(k);
    if (isLogged.current) {
      if (wasIn) removeFromCart({ cardId: c.id, cardSet: c.set }).catch(() => {});
      else addToCart({ cardId: c.id, cardSet: c.set, cardNom: c.nom, cardPrix: c.prix }).catch(() => {});
    }
  }, [ids]);
  const clear = useCallback(() => {
    setIds(new Set());
    if (isLogged.current) clearCart().catch(() => {});
  }, []);

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
