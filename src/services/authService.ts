import { supabase } from "@/integrations/supabase/client";
import { SupabaseService } from "./supabaseService";

export class AuthService {
  static async verifyUser(email: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single();
    if (error || !data) return null;
    return data;
  }

  static async createFamily(familyName: string, adminEmail: string, userId: string) {
    // 1. Create family
    const family = await SupabaseService.createFamily({ 
      name: familyName,
      invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
    });
    if (!family) return null;

    // 2. Update profile with family_id and role
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ 
        family_id: family.id, 
        role: "super_admin" 
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) return null;
    return { family, profile };
  }

  static async joinFamily(inviteCode: string, userId: string) {
    // 1. Find family by code
    const { data: family, error: fError } = await supabase
      .from("families")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();
    
    if (fError || !family) return null;

    // 2. Join family
    const { data: profile, error: pError } = await supabase
      .from("profiles")
      .update({ 
        family_id: family.id, 
        role: "child" 
      })
      .eq("id", userId)
      .select()
      .single();

    if (pError) return null;
    return { family, profile };
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    
    const profile = await SupabaseService.getProfileById(user.id);
    return { ...user, profile };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return !error;
  }

  static getRedirectUrl() {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  }
}