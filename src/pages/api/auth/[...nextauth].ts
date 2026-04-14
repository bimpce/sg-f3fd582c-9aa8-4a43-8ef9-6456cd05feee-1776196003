import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// MOCK DATABASE - Replace with real database queries
const mockUsers = [
  {
    id: "1",
    email: "super@family.com",
    password: "demo123", // In production: use bcrypt.compare()
    name: "Ana Novak",
    family_id: "family_001",
    role: "super_admin" as const,
    permissions: ["CAN_CREATE_EVENT", "CAN_EDIT_OTHERS_EVENTS", "CAN_SEE_PRIVATE", "CAN_DELETE", "CAN_INVITE"],
  },
  {
    id: "2",
    email: "parent@family.com",
    password: "demo123",
    name: "Marko Novak",
    family_id: "family_001",
    role: "parent" as const,
    permissions: ["CAN_CREATE_EVENT", "CAN_EDIT_OTHERS_EVENTS", "CAN_SEE_PRIVATE"],
  },
  {
    id: "3",
    email: "child@family.com",
    password: "demo123",
    name: "Lara Novak",
    family_id: "family_001",
    role: "child" as const,
    permissions: [],
  },
];

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
          return null;
        }

        // MOCK: Find user in mock database
        const user = mockUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) {
          return null;
        }

        // Return user object (will be passed to jwt callback)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          family_id: user.family_id,
          role: user.role,
          permissions: user.permissions,
        };
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