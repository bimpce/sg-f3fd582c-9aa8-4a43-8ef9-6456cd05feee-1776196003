import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Family = Database["public"]["Tables"]["families"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Permission = Database["public"]["Tables"]["permissions"]["Row"];

export interface FamilyCreateInput {
  name: string;
  created_by: string;
  invite_code: string;
}

export interface ProfileCreateInput {
  email: string;
  name: string;
  family_id?: string;
  role: "super_admin" | "parent" | "child";
}

export class SupabaseService {
  static async createFamily(input: FamilyCreateInput): Promise<Family | null> {
    const { data, error } = await supabase
      .from("families")
      .insert(input)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating family:", error);
      return null;
    }
    return data;
  }

  static async getFamilyByInviteCode(inviteCode: string): Promise<Family | null> {
    const { data, error } = await supabase
      .from("families")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();
    
    if (error) {
      console.error("Error fetching family by invite code:", error);
      return null;
    }
    return data;
  }

  static async createProfile(input: ProfileCreateInput): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .insert(input)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }
    return data;
  }

  static async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();
    
    if (error) {
      return null;
    }
    return data;
  }

  static async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      return null;
    }
    return data;
  }

  static async getFamilyMembers(familyId: string): Promise<Profile[] | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("family_id", familyId);
    
    if (error) {
      console.error("Error fetching family members:", error);
      return null;
    }
    return data;
  }

  static async getUserPermissions(userId: string): Promise<Permission[] | null> {
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .eq("user_id", userId)
      .eq("granted", true);
    
    if (error) {
      console.error("Error fetching user permissions:", error);
      return null;
    }
    return data;
  }

  static async setPermission(
    userId: string,
    familyId: string,
    permissionName: string,
    granted: boolean
  ): Promise<Permission | null> {
    const { data, error } = await supabase
      .from("permissions")
      .upsert({
        user_id: userId,
        family_id: familyId,
        permission_name: permissionName as any,
        granted: granted,
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error setting permission:", error);
      return null;
    }
    return data;
  }
}