import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { accounts: true },
        });

        if (!user) throw new Error("No user found with this email");

        const hasGoogleAccount = user.accounts.some(
          (acc) => acc.provider === "google"
        );
        if (hasGoogleAccount && !user.password) {
          throw new Error("Please sign in with Google");
        }

        if (!user.password) throw new Error("Invalid credentials");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Invalid password");

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Link Google account if not already linked
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });

          if (dbUser) {
            const googleAccountExists = dbUser.accounts.some(
              (acc) => acc.provider === "google"
            );

            if (!googleAccountExists) {
              await prisma.account.create({
                data: {
                  userId: dbUser.id,
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                  type: "oauth",
                  access_token: account.access_token!,
                  token_type: account.token_type!,
                  scope: account.scope!,
                  id_token: account.id_token!,
                  expires_at: account.expires_at!,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error linking Google account:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after login
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
