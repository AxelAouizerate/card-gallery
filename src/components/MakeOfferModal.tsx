"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Card } from "@/lib/cards";

type Platform = "instagram" | "facebook";

const HANDLE_RE = /^[A-Za-z0-9._-]{1,30}$/;

function getSessionId(): string | undefined {
  try { return localStorage.getItem("horuscards:sid") || undefined; }
  catch { return undefined; }
}

// Modal "Faire une offre" : l'acheteur laisse son contact (Insta/Facebook) et
// un prix proposé. Envoyé au vendeur (table `offers` + notif). Pas de login.
export default function MakeOfferModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [handle, setHandle] = useState("");
  const [price, setPrice] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const h = handle.trim().replace(/^@+/, "");
    if (!HANDLE_RE.test(h)) { setError("Nom d'utilisateur invalide (lettres, chiffres, . _ -)."); return; }
    const p = Number(price.replace(",", "."));
    if (!Number.isFinite(p) || p <= 0) { setError("Entre un montant valide (en €)."); return; }

    // Rate-limit local 5/jour
    const dailyKey = `offers_${new Date().toISOString().slice(0, 10)}`;
    let n = 0;
    try { n = parseInt(localStorage.getItem(dailyKey) || "0", 10); } catch {}
    if (n >= 5) { setError("Tu as déjà fait 5 offres aujourd'hui. Reviens demain !"); return; }

    setPending(true);
    try {
      const mod = await import("@/app/actions/sync");
      const res = await mod.submitOffer({
        cardId: card.id,
        cardSet: card.set,
        cardNom: card.nom,
        cardPrix: card.prix,
        contactHandle: h,
        contactPlatform: platform,
        offerPrice: p,
        sessionId: getSessionId(),
      });
      if (!res.ok) { setError(res.reason || "Erreur lors de l'envoi."); setPending(false); return; }
      try { localStorage.setItem(dailyKey, String(n + 1)); } catch {}
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setPending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Faire une offre</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          <b>{card.nom}</b> — {card.set}
          {card.prix != null && <> · prix affiché <b>{card.prix.toFixed(0)} €</b></>}
        </p>

        {done ? (
          <div className="rounded-md bg-green-50 px-3 py-3 text-sm text-green-800">
            <p className="font-medium">Offre envoyée ✅</p>
            <p className="mt-1">Le vendeur va te recontacter sur ton {platform === "instagram" ? "Instagram" : "Facebook"}. Merci !</p>
            <button onClick={onClose} className="mt-3 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">Fermer</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {/* Prix */}
            <div>
              <label htmlFor="offer-price" className="mb-1 block text-xs font-medium text-slate-600">Ton offre (en €)</label>
              <div className="relative">
                <input
                  id="offer-price"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ex : 120"
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 pr-7 text-sm focus:border-slate-500 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">€</span>
              </div>
            </div>

            {/* Plateforme */}
            <div>
              <span className="mb-1 block text-xs font-medium text-slate-600">Où te recontacter ?</span>
              <div className="flex gap-2">
                {(["instagram", "facebook"] as Platform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={"flex-1 rounded-md border px-3 py-1.5 text-sm font-medium capitalize transition " + (
                      platform === p ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Handle */}
            <div>
              <label htmlFor="offer-handle" className="mb-1 block text-xs font-medium text-slate-600">
                Ton identifiant {platform === "instagram" ? "Instagram" : "Facebook"}
              </label>
              <input
                id="offer-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="ex : @ton.pseudo"
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>

            {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Envoi…" : "Envoyer mon offre"}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              Le vendeur reste libre d&apos;accepter ou non. Aucun paiement sur le site.
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
