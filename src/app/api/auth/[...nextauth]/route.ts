import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Agency from "@/models/Agency"; // Import Agency model for populate
import { verifyPassword } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          // Import Agency model to ensure it's registered for populate
          await import("@/models/Agency");
          
          const user = await User.findOne({ email: credentials.email }).populate("agencyId");

          if (!user) {
            return null;
          }

          const isValid = await verifyPassword(credentials.password, user.passwordHash);

          if (!isValid) {
            return null;
          }

          // Handle agencyId - it might be populated or just an ObjectId
          const agencyId = 
            typeof user.agencyId === "object" && user.agencyId !== null
              ? (user.agencyId as any)._id?.toString() || (user.agencyId as any).toString()
              : (user.agencyId as any).toString();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            agencyId: agencyId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.agencyId = (user as any).agencyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).agencyId = token.agencyId;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }) {
      // After signin, redirect based on user role
      if (url === `${baseUrl}/signin` || url === baseUrl) {
        const userRole = (token as any)?.role;
        // Only system_admin goes to admin dashboard
        if (userRole === "system_admin") {
          return `${baseUrl}/admin/dashboard`;
        }
        // All others (agency_admin, agency_user) go to agency dashboard
        return `${baseUrl}/agency/dashboard`;
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
