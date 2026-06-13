import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// /stats — tableau de bord proprio (24h glissantes).
// Acces : utilisateur connecte ET email = STATS_OWNER_EMAIL (axel.ate3@gmail.com par defaut).

export const dynamic = "force-dynamic";

const OWNER_EMAIL = (process.env.STATS_OWNER_EMAIL || "axel.ate3@gmail.com").toLowerCase();

type Row = { card_id: number; card_set: string; card_nom: string | null; created_at: string };

function topCards(rows: Row[], limit = 10): Array<{ name: string; count: number; lastAt: string }> {
  const m = new Map<string, { name: string; count: number; lastAt: string }>();
  for (const r of rows) {
    const key = `${r.card_id}-${r.card_set}`;
    const name = r.card_nom || `${r.card_set} #${r.card_id}`;
    const ex = m.get(key);
    if (ex) {
      ex.count++;
      if (r.created_at > ex.lastAt) ex.lastAt = r.created_at;
    } else m.set(key, { name, count: 1, lastAt: r.created_at });
  }
  return [...m.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

function fmtTimeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const ms = Date.now() - d;
  const min = Math.floor(ms / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

async function loadStats() {
  const supabase = createAdminClient();
  const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [vRes, lRes, cRes, pRes] = await Promise.all([
    supabase.from("page_views")
      .select("session_id, path, user_id, user_agent, created_at", { count: "exact" })
      .gte("created_at", start)
      .order("created_at", { ascending: false }),
    supabase.from("likes")
      .select("card_id, card_set, card_nom, user_id, created_at", { count: "exact" })
      .gte("created_at", start)
      .order("created_at", { ascending: false }),
    supabase.from("cart_items")
      .select("card_id, card_set, card_nom, card_prix, user_id, created_at", { count: "exact" })
      .gte("created_at", start)
      .order("created_at", { ascending: false }),
    supabase.from("photo_requests")
      .select("card_id, card_set, card_nom, user_id, created_at", { count: "exact" })
      .gte("created_at", start)
      .order("created_at", { ascending: false }),
  ]);

  const views = vRes.data ?? [];
  const uniqueSessions = new Set(views.map(v => v.session_id)).size;
  const uniqueUsers = new Set(views.map(v => v.user_id).filter(Boolean)).size;
  const topPaths = (() => {
    const m = new Map<string, number>();
    views.forEach(v => m.set(v.path, (m.get(v.path) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  })();

  return {
    start,
    counts: {
      views: vRes.count ?? 0,
      uniqueSessions,
      uniqueUsers,
      likes: lRes.count ?? 0,
      cart: cRes.count ?? 0,
      photoReqs: pRes.count ?? 0,
    },
    topLikes: topCards((lRes.data ?? []) as Row[]),
    topCart: topCards((cRes.data ?? []) as Row[]),
    topPhoto: topCards((pRes.data ?? []) as Row[]),
    topPaths,
    recent: {
      likes: (lRes.data ?? []).slice(0, 12),
      cart: (cRes.data ?? []).slice(0, 12),
      photo: (pRes.data ?? []).slice(0, 12),
    },
  };
}

export default async function StatsPage() {
  // ─── Auth check : owner only
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email?.toLowerCase() ?? null;
  } catch { /* Supabase non configure */ }

  if (!email) redirect("/login?next=/stats");
  if (email !== OWNER_EMAIL) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-amber-100">
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="mt-3 text-amber-100/70">
          Cette page est réservée au propriétaire du site.
        </p>
        <Link href="/" className="mt-6 inline-block text-amber-300 underline">← Retour à la galerie</Link>
      </main>
    );
  }

  // ─── Fetch data
  let data: Awaited<ReturnType<typeof loadStats>>;
  try {
    data = await loadStats();
  } catch (e) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-amber-100">
        <h1 className="text-2xl font-bold">Stats indisponibles</h1>
        <p className="mt-3 text-rose-300/90">
          {e instanceof Error ? e.message : "Erreur inconnue"}
        </p>
        <p className="mt-2 text-amber-100/60 text-sm">
          (Vérifie que SUPABASE_SERVICE_ROLE_KEY est bien configuré côté Vercel.)
        </p>
      </main>
    );
  }

  const { counts, topLikes, topCart, topPhoto, topPaths, recent } = data;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-amber-300"
              style={{ textShadow: "0 2px 0 #000, 0 0 14px rgba(212,175,55,0.35)" }}>
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-amber-100/70">
            Activité des dernières 24h sur horuscards.fr
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-amber-100/80 underline hover:text-amber-200">
            ← Galerie
          </Link>
          <Link href="/stats" className="rounded-md border border-amber-500/40 bg-black/40 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-500/10">
            ↻ Refresh
          </Link>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Visites" value={counts.views} accent="from-cyan-500 to-blue-500" sub={`${counts.uniqueSessions} sessions`} />
        <Kpi label="Likes" value={counts.likes} accent="from-rose-500 to-pink-500" />
        <Kpi label="Paniers" value={counts.cart} accent="from-amber-500 to-yellow-500" />
        <Kpi label="Demandes photos" value={counts.photoReqs} accent="from-purple-500 to-indigo-500" />
      </section>

      <p className="mt-2 text-xs text-amber-100/50">
        Utilisateurs connectés actifs : {counts.uniqueUsers} · Fenêtre : 24h glissantes
      </p>

      {/* Top cartes */}
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <TopList title="Top likées" rows={topLikes} color="rose" />
        <TopList title="Top paniers" rows={topCart} color="amber" />
        <TopList title="Demandes photos" rows={topPhoto} color="purple" />
      </section>

      {/* Top pages */}
      <section className="mt-8 rounded-lg border border-amber-500/30 bg-black/55 p-4 backdrop-blur">
        <h2 className="mb-3 text-base font-semibold text-amber-200">Pages les plus vues</h2>
        {topPaths.length === 0 ? (
          <p className="text-sm text-amber-100/60">Aucune visite enregistrée.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {topPaths.map(([p, n]) => (
              <li key={p} className="flex items-center justify-between gap-2">
                <code className="truncate text-amber-100/90">{p}</code>
                <span className="shrink-0 rounded bg-cyan-500/15 px-2 py-0.5 text-xs font-semibold text-cyan-200">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent events */}
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <RecentList title="Likes récents" items={recent.likes} accent="rose" />
        <RecentList title="Paniers récents" items={recent.cart} accent="amber" />
        <RecentList title="Demandes récentes" items={recent.photo} accent="purple" />
      </section>
    </main>
  );
}

function Kpi({ label, value, accent, sub }: { label: string; value: number; accent: string; sub?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-amber-500/30 bg-black/55 p-4 backdrop-blur`}>
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent}`} />
      <p className="text-xs uppercase tracking-wider text-amber-100/70">{label}</p>
      <p className="mt-1 text-3xl font-bold text-amber-100 tabular-nums">{value.toLocaleString("fr-FR")}</p>
      {sub && <p className="mt-0.5 text-xs text-amber-100/50">{sub}</p>}
    </div>
  );
}

function TopList({ title, rows, color }: { title: string; rows: Array<{ name: string; count: number; lastAt: string }>; color: "rose" | "amber" | "purple" }) {
  const bg = color === "rose" ? "bg-rose-500/15 text-rose-200"
           : color === "amber" ? "bg-amber-500/15 text-amber-200"
           : "bg-purple-500/15 text-purple-200";
  return (
    <div className="rounded-lg border border-amber-500/30 bg-black/55 p-4 backdrop-blur">
      <h2 className="mb-3 text-base font-semibold text-amber-200">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-amber-100/60">Aucune entrée.</p>
      ) : (
        <ol className="space-y-1.5 text-sm">
          {rows.map((r, i) => (
            <li key={r.name + i} className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 text-amber-100/90">{i + 1}. {r.name}</span>
              <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${bg}`}>{r.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

type Item = { card_nom: string | null; card_id: number; card_set: string; created_at: string; user_id?: string | null };

function RecentList({ title, items, accent }: { title: string; items: Item[]; accent: "rose" | "amber" | "purple" }) {
  const dot = accent === "rose" ? "bg-rose-400" : accent === "amber" ? "bg-amber-400" : "bg-purple-400";
  return (
    <div className="rounded-lg border border-amber-500/30 bg-black/55 p-4 backdrop-blur">
      <h2 className="mb-3 text-base font-semibold text-amber-200">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-amber-100/60">Aucun évènement récent.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-amber-100/90">
                  {it.card_nom || `${it.card_set} #${it.card_id}`}
                </p>
                <p className="text-xs text-amber-100/50">
                  {fmtTimeAgo(it.created_at)}
                  {it.user_id ? " · connecté" : " · anonyme"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
