import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Preveri, ali je klicoči uporabnik prijavljen in ima vlogo super_admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "Niste prijavljeni ali seja je potekla." });
    }

    if (session.user.role !== "super_admin") {
      return res.status(403).json({ error: `Samo Super-Admin lahko dodaja nove družinske člane. Vaša trenutna vloga je: ${session.user?.role || "neznana"}` });
    }

    const { name, email, password, role } = req.body;
    const familyId = session.user.family_id;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Prosimo, izpolnite vsa polja." });
    }

    // 2. Inicializiraj Supabase Admin klienta (uporablja Service Role Key za obvod varnostnih pravil)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Ustvari uporabnika v Supabase Auth sistemu
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Avtomatsko potrdi email, da se lahko takoj prijavijo
      user_metadata: { name }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 4. Posodobi/Ustvari profil v tabeli profiles in ga poveži z družino
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        email,
        name,
        family_id: familyId,
        role
      });

    if (profileError) {
      // V primeru napake pri kreiranju profila bi bilo idealno izbrisati auth uporabnika (rollback), 
      // a za ta primer bomo le vrnili napako.
      console.error("Profile creation error:", profileError);
      return res.status(400).json({ error: "Uporabnik je bil ustvarjen, a prišlo je do napake pri povezovanju z družino." });
    }

    return res.status(200).json({ success: true, message: "Član uspešno dodan." });
  } catch (error: any) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Notranja napaka strežnika." });
  }
}