export interface Json
{
  [key: string]: unknown;
}
export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          invite_code: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invite_code: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invite_code?: string;
          name?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          family_id: string | null;
          id: string;
          name: string;
          role: "super_admin" | "parent" | "child";
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          family_id?: string | null;
          id?: string;
          name: string;
          role?: "super_admin" | "parent" | "child";
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          family_id?: string | null;
          id?: string;
          name?: string;
          role?: "super_admin" | "parent" | "child";
          updated_at?: string;
        };
      };
      events: {
        Row: {
          color: string;
          created_at: string;
          creator_id: string | null;
          description: string | null;
          end_time: string | null;
          family_id: string | null;
          id: string;
          location: string | null;
          start_time: string;
          title: string;
          updated_at: string;
          visibility_level: "all" | "parents";
        };
        Insert: {
          color?: string;
          created_at?: string;
          creator_id?: string | null;
          description?: string | null;
          end_time?: string | null;
          family_id?: string | null;
          id?: string;
          location?: string | null;
          start_time: string;
          title: string;
          updated_at?: string;
          visibility_level?: "all" | "parents";
        };
        Update: {
          color?: string;
          created_at?: string;
          creator_id?: string | null;
          description?: string | null;
          end_time?: string | null;
          family_id?: string | null;
          id?: string;
          location?: string | null;
          start_time?: string;
          title?: string;
          updated_at?: string;
          visibility_level?: "all" | "parents";
        };
      };
      tasks: {
        Row: {
          assignee_id: string | null;
          category: string | null;
          completed: boolean;
          created_at: string;
          creator_id: string | null;
          description: string | null;
          due_date: string | null;
          family_id: string | null;
          id: string;
          priority: "low" | "medium" | "high";
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_id?: string | null;
          category?: string | null;
          completed?: boolean;
          created_at?: string;
          creator_id?: string | null;
          description?: string | null;
          due_date?: string | null;
          family_id?: string | null;
          id?: string;
          priority?: "low" | "medium" | "high";
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_id?: string | null;
          category?: string | null;
          completed?: boolean;
          created_at?: string;
          creator_id?: string | null;
          description?: string | null;
          due_date?: string | null;
          family_id?: string | null;
          id?: string;
          priority?: "low" | "medium" | "high";
          title?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          created_at: string;
          family_id: string | null;
          granted: boolean;
          id: string;
          permission_name: "CAN_CREATE_EVENT" | "CAN_EDIT_OTHERS_EVENTS" | "CAN_SEE_PRIVATE" | "CAN_DELETE" | "CAN_INVITE";
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          family_id?: string | null;
          granted?: boolean;
          id?: string;
          permission_name: "CAN_CREATE_EVENT" | "CAN_EDIT_OTHERS_EVENTS" | "CAN_SEE_PRIVATE" | "CAN_DELETE" | "CAN_INVITE";
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          family_id?: string | null;
          granted?: boolean;
          id?: string;
          permission_name?: "CAN_CREATE_EVENT" | "CAN_EDIT_OTHERS_EVENTS" | "CAN_SEE_PRIVATE" | "CAN_DELETE" | "CAN_INVITE";
          updated_at?: string;
          user_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}