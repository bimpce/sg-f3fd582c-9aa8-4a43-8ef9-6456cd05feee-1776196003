import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      family_id: string;
      role: "super_admin" | "parent" | "child";
      permissions: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    family_id: string;
    role: "super_admin" | "parent" | "child";
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    family_id: string;
    role: "super_admin" | "parent" | "child";
    permissions: string[];
  }
}