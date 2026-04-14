import { SupabaseService } from "./supabaseService";
import { supabase } from "@/integrations/supabase/client";

// Demo users for development (will be replaced with real Supabase Auth)
export const DEMO_USERS = [
  {
    email: "super@family.com",
    password: "demo123",
    name: "Ana Novak",
    family_invite_code: "FAMDEMO",
    role: "super_admin" as const,
  },
  {
    email: "parent@family.com",
    password: "demo123",
    name: "Marko Novak",
    family_invite_code: "FAMDEMO",
    role: "parent" as const,
  },
  {
    email: "child@family.com",
    password: "demo123",
    name: "Luka Novak",
    family_invite_code: "FAMDEMO",
    role: "child" as const,
  },
];

/**
 * Demo authentication for development
 * In production, use Supabase Auth (email/password or OAuth)
 */
export async function verifyUser(email: string, password: string) {
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  
  // Get user profile from Supabase
  const profile = await SupabaseService.getProfileByEmail(email);
  
  if (!profile) {
    // Create demo user profile
    const family = await SupabaseService.getFamilyByInviteCode(user.family_invite_code);
    if (!family) {
      // Create demo family
      const newFamily = await SupabaseService.createFamily({
        name: "Družina Novak",
        created_by: "", // Will be updated after profile creation
        invite_code: user.family_invite_code,
      });
      
      if (!newFamily) throw new Error("Napaka pri ustvarjanju družine");
      
      const newProfile = await SupabaseService.createProfile({
        email: user.email,
        name: user.name,
        family_id: newFamily.id,
        role: user.role,
      });
      
      if (!newProfile) throw new Error("Napaka pri ustvarjanju profila");
      
      // Set permissions for demo users
      await setDemoPermissions(newProfile.id, newFamily.id, user.role);
      
      return {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        family_id: newFamily.id,
        role: newProfile.role,
        permissions: await getPermissionsForRole(user.role),
      };
    }
    
    // Create profile with existing family
    const newProfile = await SupabaseService.createProfile({
      email: user.email,
      name: user.name,
      family_id: family.id,
      role: user.role,
    });
    
    if (!newProfile) throw new Error("Napaka pri ustvarjanju profila");
    
    await setDemoPermissions(newProfile.id, family.id, user.role);
    
    return {
      id: newProfile.id,
      email: newProfile.email,
      name: newProfile.name,
      family_id: family.id,
      role: newProfile.role,
      permissions: await getPermissionsForRole(user.role),
    };
  }
  
  // Return existing profile
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    family_id: profile.family_id || "",
    role: profile.role,
    permissions: await SupabaseService.getUserPermissions(profile.id),
  };
}

export async function createFamily(name: string, creatorEmail: string, creatorName: string) {
  const inviteCode = `FAM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const family = await SupabaseService.createFamily({
    name,
    created_by: "",
    invite_code: inviteCode,
  });
  
  if (!family) throw new Error("Napaka pri ustvarjanju družine");
  
  const profile = await SupabaseService.createProfile({
    email: creatorEmail,
    name: creatorName,
    family_id: family.id,
    role: "super_admin",
  });
  
  if (!profile) throw new Error("Napaka pri ustvarjanju profila");
  
  await setDemoPermissions(profile.id, family.id, "super_admin");
  
  return { family, profile, inviteCode };
}

export async function joinFamily(inviteCode: string, email: string, name: string, role: "parent" | "child") {
  const family = await SupabaseService.getFamilyByInviteCode(inviteCode);
  if (!family) throw new Error("Neveljavna koda za pridružitev");
  
  const existingProfile = await SupabaseService.getProfileByEmail(email);
  if (existingProfile) throw new Error("Email je že registriran");
  
  const profile = await SupabaseService.createProfile({
    email,
    name,
    family_id: family.id,
    role,
  });
  
  if (!profile) throw new Error("Napaka pri ustvarjanju profila");
  
  await setDemoPermissions(profile.id, family.id, role);
  
  return { family, profile };
}

async function setDemoPermissions(userId: string, familyId: string, role: "super_admin" | "parent" | "child") {
  const permissions = await getPermissionsForRole(role);
  
  for (const permission of permissions) {
    await SupabaseService.setPermission(userId, familyId, permission, true);
  }
}

async function getPermissionsForRole(role: "super_admin" | "parent" | "child") {
  switch (role) {
    case "super_admin":
      return [
        "CAN_CREATE_EVENT",
        "CAN_EDIT_OTHERS_EVENTS",
        "CAN_SEE_PRIVATE",
        "CAN_DELETE",
        "CAN_INVITE",
      ];
    case "parent":
      return ["CAN_CREATE_EVENT", "CAN_EDIT_OTHERS_EVENTS", "CAN_SEE_PRIVATE"];
    case "child":
      return [];
    default:
      return [];
  }
}