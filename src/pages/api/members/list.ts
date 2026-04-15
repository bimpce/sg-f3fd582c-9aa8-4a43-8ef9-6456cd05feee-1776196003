import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Preverimo sejo (NextAuth)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.family_id) {
      return res.status(401).json({ error: "Unauthorized: Ni aktivne seje ali družine." });
    }

    const familyId = token.family_id as string;

    // Ker NextAuth žeton ne deluje direktno s Supabase RLS pravili na klientu,
    // varno naložimo podatke na strežniku z uporabo Service ključa in jih vrnemo uporabniku.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Dobimo vse profile v tej družini
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: true });

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    // Za super-admina potrebujemo tudi pravice
    const { data: permissions, error: permissionsError } = await supabaseAdmin
      .from("permissions")
      .select("*")
      .eq("family_id", familyId);

    if (permissionsError) {
      console.error("Permissions fetch error:", permissionsError);
    }

    // Povežemo pravice in profile (simulacija relacijske poizvedbe)
    const membersWithPermissions = profiles.map(profile => ({
      ...profile,
      permissions: permissions?.filter(p => p.user_id === profile.id) || []
    }));

    return res.status(200).json({ members: membersWithPermissions });
  } catch (error: any) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Napaka pri pridobivanju članov." });
  }
}