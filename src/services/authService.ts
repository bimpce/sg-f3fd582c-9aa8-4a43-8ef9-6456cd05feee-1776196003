import { supabase } from "@/integrations/supabase/client";

export async function verifyUser(email: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
  return error ? null : data;
}

export async function createFamily(familyName: string, email: string, password: string, name: string) {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // 1. Create family
  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({ name: familyName, invite_code: inviteCode })
    .select()
    .single();
    
  if (familyError) throw familyError;

  // 2. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Registracija ni uspela.");

  // 3. Update profile (Role is set via DB default or we set it here)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ 
      family_id: family.id, 
      name, 
      role: 'super_admin' 
    })
    .eq("id", authData.user.id);

  if (profileError) throw profileError;

  return { family, inviteCode };
}

export async function joinFamily(inviteCode: string, email: string, password: string, name: string) {
  // 1. Find family by code
  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();

  if (familyError || !family) throw new Error("Neveljavna družinska koda.");

  // 2. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Registracija ni uspela.");

  // 3. Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ 
      family_id: family.id, 
      name, 
      role: 'child' // Default to child when joining via code
    })
    .eq("id", authData.user.id);

  if (profileError) throw profileError;

  return { family };
}

export class AuthService {
  static async signOut() {
    return await supabase.auth.signOut();
  }

  static getRedirectUrl() {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  }
}