import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== "super_admin") {
      return res.status(403).json({ error: "Samo Super-Admin lahko briše člane." });
    }

    const { memberId } = req.query;
    const familyId = token.family_id as string;

    if (!memberId || Array.isArray(memberId)) {
      return res.status(400).json({ error: "ID člana je obvezen." });
    }

    // Preprečimo samouničenje (Super-Admin ne sme izbrisati samega sebe tukaj)
    if (memberId === token.sub) {
      return res.status(400).json({ error: "Ne morete izbrisati lastnega računa." });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Preverimo, če član sploh pripada isti družini
    const { data: member, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("family_id")
      .eq("id", memberId)
      .single();

    if (checkError || !member || member.family_id !== familyId) {
      return res.status(403).json({ error: "Nimate dovoljenja za brisanje tega uporabnika." });
    }

    // 2. Izbris iz Auth sistema (to bo zaradi ON DELETE CASCADE ali RLS izbrisalo tudi profil)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(memberId);

    if (deleteError) {
      return res.status(400).json({ error: "Napaka pri brisanju: " + deleteError.message });
    }

    return res.status(200).json({ success: true, message: "Član uspešno izbrisan." });
  } catch (error: any) {
    console.error("API delete error:", error);
    return res.status(500).json({ error: "Notranja napaka strežnika." });
  }
}