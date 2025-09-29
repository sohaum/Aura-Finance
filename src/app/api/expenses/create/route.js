export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    // console.log('POST Session:', JSON.stringify(session, null, 2));
    
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
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
      userId: session.user.id, // Use session.user.id directly from JWT
    };

    // console.log('Creating expense with data:', JSON.stringify(expenseData, null, 2));

    // Create expense
    const expense = await prisma.expense.create({
      data: expenseData,
    });

    // console.log('Created expense:', JSON.stringify(expense, null, 2));

    return new Response(JSON.stringify(expense), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}