// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(req) {
  return handler(req);
}

export async function POST(req) {
  return handler(req);
}
