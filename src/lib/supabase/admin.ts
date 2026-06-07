import { createClient as createSb } from "@supabase/supabase-js";

// Client serveur avec service_role : bypass RLS. A n'utiliser QUE dans
// des routes serveur protegees (cron avec CRON_SECRET, etc.).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin non configure (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY requis)");
  return createSb(url, key, { auth: { persistSession: false } });
}
