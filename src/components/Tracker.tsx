"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Genere / recupere un sessionId stable par navigateur (anonyme).
function getSessionId(): string {
  const KEY = "horuscards:sid";
  try {
    let sid = localStorage.getItem(KEY);
    if (!sid) {
      sid = (typeof crypto !== "undefined" && "randomUUID" in crypto)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return "no-storage";
  }
}

export default function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    const sid = getSessionId();
    // Fire-and-forget : on n'attend pas la reponse, et on absorbe toute erreur.
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, path: pathname || "/" }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
