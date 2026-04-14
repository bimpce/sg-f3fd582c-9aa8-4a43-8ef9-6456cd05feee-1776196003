<![CDATA
import { SupabaseService } from "./supabaseService";

export const MOCK_USERS = [
  {
    id: "user-super-001",
    email: "super@family.com",
    password: "demo123",
    name: "Ana Novak",
    family_id: "family_001",
    role: "super_admin" as const,
    permissions: [
      "CAN_CREATE_EVENT",
      "CAN_EDIT_OTHERS_EVENTS",
      "CAN_SEE_PRIVATE",
      "CAN_DELETE",
      "CAN_INVITE",
    ],
  },
  {
    id: "user-parent-001",
    email: "parent@family.com",
    password: "demo123",
    name: "Marko Novak",
    family_id: "family_001",
    role: "parent" as const,
    permissions: ["CAN_CREATE_EVENT", "CAN_EDIT_OTHERS_EVENTS", "CAN_SEE_PRIVATE"],
  },
  {
    id: "user-child-001",
    email: "child@family.com",
    password: "demo123",
    name: "Luka Novak",
    family_id: "family_001",
    role: "child" as const,
    permissions: [],
  },
];

export async function verifyUser(email: string, password: string) {
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
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
  
  await SupabaseService.setPermission(profile.id, family.id, "CAN_CREATE_EVENT", true);
  await SupabaseService.setPermission(profile.id, family.id, "CAN_EDIT_OTHERS_EVENTS", true);
  await SupabaseService.setPermission(profile.id, family.id, "CAN_SEE_PRIVATE", true);
  await SupabaseService.setPermission(profile.id, family.id, "CAN_DELETE", true);
  await SupabaseService.setPermission(profile.id, family.id, "CAN_INVITE", true);
  
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
  
  return { family, profile };
}

export async function getInitialPermissions(role: "super_admin" | "parent" | "child") {
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
]]>