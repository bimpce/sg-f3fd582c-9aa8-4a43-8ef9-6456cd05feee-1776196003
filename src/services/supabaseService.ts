import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Family = Database["public"]["Tables"]["families"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Permission = Database["public"]["Tables"]["permissions"]["Row"];

// Use auto-generated Insert types for type safety
type FamilyInsert = Database["public"]["Tables"]["families"]["Insert"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

export interface FamilyCreateInput {
  name: string;
  invite_code: string;
}

export interface ProfileCreateInput {
  id: string;
  email: string;
  name: string;
  family_id?: string;
  role: "super_admin" | "parent" | "child";
}

export class SupabaseService {
  static async createFamily(input: FamilyCreateInput): Promise<Family | null> {
    const { data, error } = await supabase
      .from("families")
      .insert(input as FamilyInsert)
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
      .insert(input as ProfileInsert)
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

  static async updateProfile(userId: string, input: { name?: string }): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .update(input)
      .eq("id", userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
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

  static async getFamilyMembersWithPermissions(familyId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        permissions (*)
      `)
      .eq("family_id", familyId);

    if (error) {
      console.error("Error fetching family members with permissions:", error);
      return null;
    }
    return data;
  }

  static async updateMemberRole(userId: string, role: "super_admin" | "parent" | "child"): Promise<boolean> {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      console.error("Error updating member role:", error);
      return false;
    }
    return true;
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

  static async getEvents(familyId: string, role: string): Promise<Event[] | null> {
    let query = supabase
      .from("events")
      .select("*")
      .eq("family_id", familyId);
    
    // Only parents and admins can see private events
    if (role === "child") {
      query = query.eq("visibility_level", "all");
    }

    const { data, error } = await query.order("start_time", { ascending: true });
    
    if (error) {
      console.error("Error fetching events:", error);
      return null;
    }
    return data;
  }

  static async createEvent(input: EventInsert): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .insert(input)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating event:", error);
      return null;
    }
    return data;
  }

  static async updateEvent(eventId: string, input: Partial<EventInsert>): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .update(input)
      .eq("id", eventId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating event:", error);
      return null;
    }
    return data;
  }

  static async deleteEvent(eventId: string): Promise<boolean> {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);
    
    if (error) {
      console.error("Error deleting event:", error);
      return false;
    }
    return true;
  }
}