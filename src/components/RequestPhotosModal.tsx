"use client";

import { useEffect, useState } from "react";
import type { Card } from "@/lib/cards";

type Platform = "instagram" | "facebook" | "email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_RE = /^[A-Za-z0-9._-]{1,30}$/;

function getSessionId(): string | undefined {
  try { return localStorage.getItem("horuscards:sid") || undefined; }
  catch { return undefined; }
}

export default function RequestPhotosModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const hasPhoto = card.status === "available" && Boolean(card.photo_1 || card.photo_2);
  const modalTitle = hasPhoto ? "Demander des photos supplémentaires" : "Demander des photos";
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [handle, setHandle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // ESC pour fermer + lock du scroll body
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const h = handle.trim();
    if (!h) { setError("Renseigne ton contact."); return; }
    if (platform === "email") {
      if (!EMAIL_RE.test(h)) { setError("Email invalide (ex: nom@gmail.com)."); return; }
    } else {
      const stripped = h.replace(/^@+/, "");
      if (!HANDLE_RE.test(stripped)) { setError("Nom d'utilisateur invalide (lettres, chiffres, . _ -)."); return; }
    }

    // Rate-limit local 5/jour
    const dailyKey = `req_photos_${new Date().toISOString().slice(0, 10)}`;
    let n = 0;
    try { n = parseInt(localStorage.getItem(dailyKey) || "0", 10); } catch {}
    if (n >= 5) { setError("Tu as déjà fait 5 demandes aujourd'hui. Reviens demain !"); return; }

    setPending(true);
    try {
      const mod = await import("@/app/actions/sync");
      const res = await mod.requestPhotos({
        cardId: card.id,
        cardSet: card.set,
        cardNom: card.nom,
        contactHandle: h,
        contactPlatform: platform,
        sessionId: getSessionId(),
      });
      if (!res.ok) {
        setError(res.reason || "Erreur lors de l'envoi.");
        setPending(false);
        return;
      }
      try { localStorage.setItem(dailyKey, String(n + 1)); } catch {}
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Fermer"
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-amber-500/40 bg-[#15101f] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-amber-500/20 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-amber-200">{modalTitle}</h2>
            <p className="mt-0.5 truncate text-sm text-amber-100/70">{card.nom}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-amber-200 hover:bg-amber-500/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </header>

        {done ? (
          <div className="px-5 py-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-amber-100">Demande envoyée !</h3>
            <p className="mt-2 text-sm text-amber-100/70">
              Tu recevras les photos sur{" "}
              <b className="text-amber-200">
                {platform === "email" ? handle.trim() : `@${handle.trim().replace(/^@+/, "")}`}
              </b>{" "}
              ({platform === "email" ? "email" : platform === "instagram" ? "Instagram" : "Facebook"}) dès qu'elles sont prêtes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-md bg-amber-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-5 py-4">
            <div>
              <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-amber-100/70">
                Plateforme
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["instagram", "facebook", "email"] as Platform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPlatform(p); setHandle(""); setError(null); }}
                    className={
                      "rounded-md border px-3 py-2 text-sm font-medium capitalize transition " +
                      (platform === p
                        ? "border-amber-400 bg-amber-500/20 text-amber-100"
                        : "border-amber-500/30 bg-black/30 text-amber-100/80 hover:bg-amber-500/10")
                    }
                  >
                    {p === "email" ? "Email" : p === "instagram" ? "Instagram" : "Facebook"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="req-handle" className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-100/70">
                {platform === "email" ? "Ton adresse email" : "Ton nom d'utilisateur"}
              </label>
              <input
                id="req-handle"
                type={platform === "email" ? "email" : "text"}
                inputMode={platform === "email" ? "email" : "text"}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={platform === "email" ? "ex: nom@gmail.com" : "ex: @ton.pseudo"}
                autoFocus
                required
                className="w-full rounded-md border border-amber-500/30 bg-black/30 px-3 py-2 text-sm text-amber-100 placeholder-amber-100/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              />
              <p className="mt-1 text-[11px] text-amber-100/50">
                {platform === "email"
                  ? "Format : nom@domaine.fr (ou .com etc.)"
                  : platform === "instagram"
                  ? "Ton handle Instagram (avec ou sans @)"
                  : "Ton nom Facebook ou lien de profil"}
              </p>
            </div>

            {error && (
              <p className="rounded border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-amber-500/30 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/10"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
              >
                {pending ? "Envoi…" : "Envoyer la demande"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
