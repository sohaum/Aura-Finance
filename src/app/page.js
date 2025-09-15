// src/app/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, BarChart3, Brain, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Effortless Tracking",
    description: "Quickly add expenses with smart categorization and tagging.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "Understand your spending with beautiful, interactive charts and graphs.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized tips and insights to save money and improve habits.",
  },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // If the user is already logged in, redirect them to the dashboard.
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200">
            <p className="text-sm font-medium text-purple-600">
              Your Financial Clarity Awaits
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Track, Analyze, and Master</span> Your Spending.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            ExpenseTracker gives you the tools and AI-powered insights to take control of your finances like never before.
          </p>
          <a href__="/api/auth/signin/google">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-7 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group">
              Get Started for Free <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
          {features.map((feature) => (
            <div key={feature.title} className="p-8 rounded-2xl glass-card hover:shadow-xl transition-all duration-300">
              <div className="p-3 mb-4 inline-block rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
