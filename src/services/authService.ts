import { supabase } from "@/integrations/supabase/client";

export class AuthService {
  static async verifyUser(email: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single();
    return error ? null : data;
  }

  static async createFamily(name: string) {
    const { data, error } = await supabase.from("families").insert({ name }).select().single();
    return error ? null : data;
  }

  static async joinFamily(familyId: string, profileId: string) {
    const { error } = await supabase.from("profiles").update({ family_id: familyId }).eq("id", profileId);
    return !error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    
    const profile = await SupabaseService.getProfileById(user.id);
    return { ...user, profile };
  }

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