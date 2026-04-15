import { supabase } from "@/integrations/supabase/client";
import { SupabaseService } from "./supabaseService";

export class AuthService {
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

  // Helper for dynamic redirect URLs
  static getRedirectUrl() {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  }
}