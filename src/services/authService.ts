import { SupabaseService } from "./supabaseService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies user credentials using Supabase Auth
 */
export async function verifyUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    console.error("Supabase auth error:", error);
    return null;
  }

  // Get user profile from Supabase profiles table
  const profile = await SupabaseService.getProfileById(data.user.id);
  
  if (!profile) {
    console.error("Profile not found for user:", data.user.id);
    return null;
  }

  // Get family info
  const family = profile.family_id ? await supabase
    .from("families")
    .select("name")
    .eq("id", profile.family_id)
    .single() : null;

  // Return formatted user for NextAuth
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    family_id: profile.family_id || "",
    family_name: family?.data?.name || "Družina",
    role: profile.role || "child",
    permissions: await SupabaseService.getUserPermissions(profile.id),
  };
}

/**
 * Creates a new family and a super_admin user
 */
export async function createFamily(name: string, email: string, password: string, userName: string) {
  // 1. Sign up user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userName,
      }
    }
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Napaka pri registraciji uporabnika");
  }

  // 2. Create family
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const family = await SupabaseService.createFamily({
    name,
    invite_code: inviteCode,
  });

  if (!family) {
    throw new Error("Napaka pri ustvarjanju družine");
  }

  // 3. Create profile
  const profile = await SupabaseService.createProfile({
    id: authData.user.id,
    email,
    name: userName,
    family_id: family.id,
    role: "super_admin",
  });

  if (!profile) {
    throw new Error("Napaka pri ustvarjanju profila");
  }

  // 4. Set initial permissions
  const permissions = [
    "CAN_CREATE_EVENT",
    "CAN_EDIT_OTHERS_EVENTS",
    "CAN_SEE_PRIVATE",
    "CAN_DELETE",
    "CAN_INVITE",
  ];

  for (const perm of permissions) {
    await SupabaseService.setPermission(profile.id, family.id, perm, true);
  }

  return { family, profile, inviteCode };
}

/**
 * Joins an existing family
 */
export async function joinFamily(inviteCode: string, email: string, password: string, userName: string) {
  // 1. Check if family exists
  const family = await SupabaseService.getFamilyByInviteCode(inviteCode);
  if (!family) {
    throw new Error("Neveljavna družinska koda");
  }

  // 2. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userName,
      }
    }
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Napaka pri registraciji uporabnika");
  }

  // 3. Create profile as child by default (admin can upgrade later)
  const profile = await SupabaseService.createProfile({
    id: authData.user.id,
    email,
    name: userName,
    family_id: family.id,
    role: "child",
  });

  if (!profile) {
    throw new Error("Napaka pri ustvarjanju profila");
  }

  return { family, profile };
}