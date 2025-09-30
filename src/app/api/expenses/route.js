export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    // console.log('=== EXPENSES API DEBUG ===');
    // console.log('Session exists:', !!session);
    // console.log('Session user:', session?.user);
    // console.log('Session user ID:', session?.user?.id);
    // console.log('Session user email:', session?.user?.email);
    
    if (!session || !session.user) {
      // console.log('No session or user - returning 401');
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ALWAYS look up by email for consistency
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // console.log('Found user:', user);  // ADD THIS LINE

    if (!user) {
      // console.log('User not found by email, returning empty array');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,  // Use database user ID
      },
      orderBy: {
        date: 'desc',  // Changed from createdAt to date for better sorting
      },
      take: 100,
    });

    // console.log(`Found ${expenses.length} expenses for user ${user.id}`);
    return new Response(JSON.stringify(expenses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("GET Expenses API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}