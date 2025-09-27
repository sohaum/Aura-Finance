import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new Response(JSON.stringify({ message: "User with this email already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Return success (don't return password hash)
    return new Response(JSON.stringify({ 
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ 
      message: "Failed to create account. Please try again." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}