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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Manjkajoči podatki.");
        }

        try {
          const user = await verifyUser(credentials.email, credentials.password);
          return user;
        } catch (error: any) {
          console.error("Auth error:", error);
          // Return specific error message to the client
          throw new Error(error.message || "Prišlo je do neznane napake pri prijavi.");
        }
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
    async session({ session, token }) {
      // Add custom fields from JWT to session
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.family_id = token.family_id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.family_name = token.family_name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);