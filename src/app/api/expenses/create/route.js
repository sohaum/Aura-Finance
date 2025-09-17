import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));
    
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Not authenticated", session }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try to get user by email first
    const userByEmail = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    console.log('Found user by email:', JSON.stringify(userByEmail, null, 2));

    if (!userByEmail) {
      return new Response(JSON.stringify({ 
        error: "User not found", 
        userEmail: session.user.email,
        sessionUser: session.user 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await req.json();
    const { amount, category, notes, date, location, title, paymentMethod, tags, isRecurring } = data;

    // Validate required fields
    if (!title || !amount || !category || !date) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          required: ["title", "amount", "category", "date"] 
        }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prepare expense data
    const expenseData = {
      title,
      amount: parseFloat(amount),
      category: category.toUpperCase(),
      date: new Date(date),
      location: location || null,
      notes: notes || null,
      paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : null,
      tags: tags || [],
      isRecurring: isRecurring || false,
      user: {
        connect: {
          id: userByEmail.id
        }
      },
    };

    console.log('Creating expense with data:', JSON.stringify(expenseData, null, 2));

    // Create expense
    const expense = await prisma.expense.create({
      data: expenseData,
    });

    return new Response(JSON.stringify(expense), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
