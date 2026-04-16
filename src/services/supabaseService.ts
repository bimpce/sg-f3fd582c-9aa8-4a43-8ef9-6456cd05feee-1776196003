import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Family = Database["public"]["Tables"]["families"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];
type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Permission = Database["public"]["Tables"]["permissions"]["Row"];

type FamilyInsert = Database["public"]["Tables"]["families"]["Insert"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type ReminderInsert = Database["public"]["Tables"]["reminders"]["Insert"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

export class SupabaseService {
  // --- AUTH & PROFILE ---
  static async createFamily(input: FamilyInsert): Promise<Family | null> {
    const { data, error } = await supabase.from("families").insert(input).select().single();
    if (error) return null;
    return data;
  }

  static async getFamilyById(id: string): Promise<Family | null> {
    const { data, error } = await supabase.from("families").select("*").eq("id", id).single();
    return error ? null : data;
  }

  static async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    return error ? null : data;
  }

  static async updateProfile(userId: string, input: { name?: string }): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").update(input).eq("id", userId).select().single();
    return error ? null : data;
  }

  static async getFamilyMembers(familyId: string): Promise<Profile[] | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("family_id", familyId);
    return error ? null : data;
  }

  static async setPermission(userId: string, familyId: string, permissionName: string, granted: boolean): Promise<any> {
    const { data, error } = await supabase.from("permissions").upsert({
      user_id: userId,
      family_id: familyId,
      permission_name: permissionName as any,
      granted,
    }).select().single();
    return error ? null : data;
  }

  // --- CATEGORIES ---
  static async getCategories(familyId: string): Promise<Category[] | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("family_id", familyId)
      .order("name", { ascending: true });
    return error ? null : data;
  }

  static async createCategory(input: any): Promise<Category | null> {
    const { data, error } = await supabase.from("categories").insert(input).select().single();
    return error ? null : data;
  }

  static async deleteCategory(categoryId: string): Promise<boolean> {
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    return !error;
  }

  // --- REMINDERS ---
  static async getReminders(familyId: string) {
    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        category:categories(*),
        creator:profiles!reminders_creator_id_fkey(id, name)
      `)
      .eq("family_id", familyId)
      .order("start_time", { ascending: true });
    
    if (error) {
      console.error("Error fetching reminders:", error);
      return null;
    }
    return data;
  }

  static async createReminder(input: any): Promise<Reminder | null> {
    const { data, error } = await supabase.from("reminders").insert(input).select().single();
    if (error) {
      console.error("Error creating reminder:", error);
      return null;
    }
    return data;
  }

  static async updateReminder(id: string, input: any): Promise<Reminder | null> {
    const { data, error } = await supabase.from("reminders").update(input).eq("id", id).select().single();
    return error ? null : data;
  }

  static async deleteReminder(id: string): Promise<boolean> {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    return !error;
  }

  // --- EVENTS (KEEP FOR CALENDAR COMPATIBILITY) ---
  static async getEvents(familyId: string): Promise<Event[] | null> {
    const { data, error } = await supabase.from("events").select("*").eq("family_id", familyId);
    return error ? null : data;
  }
}