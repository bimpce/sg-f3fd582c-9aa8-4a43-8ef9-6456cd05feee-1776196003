import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== "super_admin") {
      return res.status(403).json({ error: "Samo Super-Admin lahko posodablja podatke članov." });
    }

    const { memberId, name, role, password } = req.body;
    const familyId = token.family_id as string;

    if (!memberId) {
      return res.status(400).json({ error: "ID člana je obvezen." });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Preverimo, če član sploh pripada isti družini (varnostni pregled)
    const { data: member, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("family_id")
      .eq("id", memberId)
      .single();

    if (checkError || !member || member.family_id !== familyId) {
      return res.status(403).json({ error: "Nimate dovoljenja za urejanje tega uporabnika." });
    }

    // 2. Posodobitev gesla v Supabase Auth (če je podano)
    if (password) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        memberId,
        { password }
      );
      if (authError) return res.status(400).json({ error: "Napaka pri posodabljanju gesla: " + authError.message });
    }

    // 3. Posodobitev profila (ime, vloga)
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("id", memberId);

      if (profileError) return res.status(400).json({ error: "Napaka pri posodabljanju profila." });
    }

    return res.status(200).json({ success: true, message: "Podatki uspešno posodobljeni." });
  } catch (error: any) {
    console.error("API update error:", error);
    return res.status(500).json({ error: "Notranja napaka strežnika." });
  }
}