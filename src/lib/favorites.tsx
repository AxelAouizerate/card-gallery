"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Card } from "./cards";
import { cardKey, type CartKey } from "./cart";
import { createClient } from "./supabase/client";
import { addLike, removeLike, listLikes, clearLikes } from "@/app/actions/sync";

const STORAGE_KEY = "cardgallery:favorites:v1";

type FavCtx = {
  ids: Set<CartKey>;
  has: (c: Pick<Card, "id" | "set">) => boolean;
  toggle: (c: Card) => void;
  remove: (c: Pick<Card, "id" | "set">) => void;
  clear: () => void;
  count: number;
};

const FavContext = createContext<FavCtx | null>(null);

function parseKey(k: CartKey): { cardId: number; cardSet: string } {
  const i = k.indexOf("-");
  return { cardId: Number(k.slice(0, i)), cardSet: k.slice(i + 1) };
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<CartKey>>(new Set());
  const isLogged = useRef(false);

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

  useEffect(() => {
    let supabase;
    try { supabase = createClient(); } catch { return; }

    const syncOnLogin = async () => {
      try {
        const serverKeys = await listLikes();
        setIds(prev => {
          const next = new Set(prev);
          serverKeys.forEach(k => next.add(k));
          prev.forEach(k => {
            if (!serverKeys.includes(k)) {
              const { cardId, cardSet } = parseKey(k);
              addLike({ cardId, cardSet }).catch(() => {});
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
  const toggle = useCallback((c: Card) => {
    const k = cardKey(c);
    const wasIn = ids.has(k);
    setIds(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
    if (isLogged.current) {
      if (wasIn) removeLike({ cardId: c.id, cardSet: c.set }).catch(() => {});
      else addLike({ cardId: c.id, cardSet: c.set, cardNom: c.nom }).catch(() => {});
    }
  }, [ids]);
  const remove = useCallback((c: Pick<Card, "id" | "set">) => {
    setIds(prev => {
      if (!prev.has(cardKey(c))) return prev;
      const next = new Set(prev); next.delete(cardKey(c)); return next;
    });
    if (isLogged.current) {
      removeLike({ cardId: c.id, cardSet: c.set }).catch(() => {});
    }
  }, []);
  const clear = useCallback(() => {
    setIds(new Set());
    if (isLogged.current) clearLikes().catch(() => {});
  }, []);

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
