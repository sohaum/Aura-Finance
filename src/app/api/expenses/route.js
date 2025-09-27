import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('=== EXPENSES API DEBUG ===');
    console.log('Session exists:', !!session);
    console.log('Session user:', session?.user);
    console.log('Session user ID:', session?.user?.id);
    
    if (!session || !session.user) {
      console.log('No session or user - returning 401');
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If we have a user ID from session, use it directly
    if (session.user.id) {
      console.log('Using session.user.id:', session.user.id);
      
      const expenses = await prisma.expense.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });

      console.log(`Found ${expenses.length} expenses for user ${session.user.id}`);
      return new Response(JSON.stringify(expenses), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fallback: find user by email if no ID in session
    if (session.user.email) {
      console.log('No session ID, looking up user by email:', session.user.email);
      
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        console.log('User not found by email, returning empty array');
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log('Found user by email:', user.id);
      
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });

      console.log(`Found ${expenses.length} expenses for user ${user.id}`);
      return new Response(JSON.stringify(expenses), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('No user ID or email available - returning 401');
    return new Response(JSON.stringify({ error: "User identification failed" }), {
      status: 401,
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