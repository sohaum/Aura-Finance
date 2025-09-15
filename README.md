# Core dependencies
npm install @radix-ui/react-* # for shadcn components
npm install lucide-react framer-motion
npm install recharts date-fns lodash
npm install react-hook-form

# Database (choose one)
npm install prisma @prisma/client # for PostgreSQL/MySQL
# OR
npm install mongodb mongoose # for MongoDB

# Authentication (choose one)
npm install next-auth # for NextAuth.js
# OR
npm install @clerk/nextjs # for Clerk

# AI Integration
npm install openai # for OpenAI API

# Initialize database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

npx shadcn-ui@latest init
npx shadcn-ui@latest add card button input label textarea select tabs badge sidebar

npx shadcn-ui@latest add button card input label textarea select tabs badge avatar popover calendar progress skeleton dialog dropdown-menu hover-card separator toast


# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"
# For SQLite (easier for development):
# DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI API (for AI insights)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Optional: Other AI services
# ANTHROPIC_API_KEY="your-anthropic-key"
# GEMINI_API_KEY="your-gemini-key"

// src/app/sign-in/page.js
"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <button
          onClick={() => signIn("google")}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

