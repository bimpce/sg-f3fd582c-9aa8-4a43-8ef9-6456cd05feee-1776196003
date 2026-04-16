import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/services/authService";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Geslo", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const profile = await verifyUser(credentials.email);
        
        if (profile) {
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            family_id: profile.family_id,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            full_name: profile.name,
            permissions: [] // Add missing required property
          } as any;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to JWT token on sign in
      if (user) {
        token.id = user.id;
        token.family_id = user.family_id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.family_name = user.family_name;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Add custom fields from JWT to session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.family_id = token.family_id;
        session.user.family_name = token.family_name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);