// src/lib/auth.ts - JWT-based approach
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
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
          return null;
        }

        try {
          // Check for demo account
          if (
            credentials.email === "demo@example.com" &&
            credentials.password === "demo"
          ) {
            // Find or create demo user
            let demoUser = await prisma.user.findUnique({
              where: { email: "demo@example.com" },
            });

            if (!demoUser) {
              demoUser = await prisma.user.create({
                data: {
                  email: "demo@example.com",
                  name: "Demo User",
                  image: null,
                },
              });
            }

            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              image: demoUser.image,
            };
          }

          // Check for regular users with hashed passwords
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
              };
            }
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
      }
      
      // Handle Google sign-in users
      if (account?.provider === "google" && token.email && !token.id) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: token.email as string,
                name: token.name as string,
                image: token.picture as string,
              },
            });
          }

          token.id = dbUser.id;
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};