import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOwnerEmail } from "@/lib/site";

/**
 * Etat de session, consomme par l'ilot client du header.
 * Le header ne peut plus lire les cookies pendant le rendu : cela rendrait
 * toutes les pages dynamiques et interdirait l'ISR sur les 833 fiches.
 * On expose ici le strict minimum — jamais la liste des e-mails proprietaires.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email ?? null;
    return NextResponse.json(
      { email, owner: isOwnerEmail(email) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json({ email: null, owner: false });
  }
}
