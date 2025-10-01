"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  BarChart3,
  Brain,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Shield,
  Zap,
  TrendingUp,
  PieChart,
  Target,
  Star,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DemoModal from "@/components/Demo/DemoModal";

const features = [
  {
    icon: Wallet,
    title: "Smart Expense Tracking",
    description:
      "Effortlessly log expenses with intelligent categorization, tags, and location tracking.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics Dashboard",
    description:
      "Beautiful interactive charts reveal spending patterns with real-time insights and trends.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Get personalized financial advice and smart recommendations to optimize your spending.",
    gradient: "from-purple-500 to-pink-600",
  },
];

const benefits = [
  "Track expenses across 12+ categories",
  "Beautiful charts and analytics",
  "Multi-platform accessibility",
  "Secure data encryption",
  "AI-powered insights",
  "Export data anytime",
];

const stats = [
  { number: "10K+", label: "Expenses Tracked" },
  { number: "500+", label: "Happy Users" },
  { number: "95%", label: "User Satisfaction" },
  { number: "24/7", label: "Available" },
];

export default function LandingPageClient() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const openDemo = () => {
    // console.log("Opening demo modal"); 
    setIsDemoOpen(true);
  };
  
  const closeDemo = () => {
    // console.log("Closing demo modal"); 
    setIsDemoOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-emerald-200 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AuraFinance
              </span>
            </div>
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="border-slate-200 hover:bg-white/80"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                Your Financial Clarity Awaits
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Master Your Money
              </span>
              <br />
              <span className="text-slate-900">with Smart Insights</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform how you track expenses with AI-powered analytics,
              beautiful visualizations, and personalized financial insights that
              actually help you save money.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/sign-in">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  Start Tracking Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 hover:bg-white/80 px-8 py-4 text-lg"
                onClick={openDemo}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"
                    ></div>
                  ))}
                </div>
                <span className="ml-2">Trusted by 500+ users</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Take Control
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to make expense tracking effortless and
              insightful.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div
                  className={`p-4 mb-6 inline-block rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  <span className="text-slate-900">Why Choose</span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    AuraFinance?
                  </span>
                </h2>
                <p className="text-xl text-slate-600 mb-8">
                  Built with modern technology and user-centric design to
                  deliver the best expense tracking experience.
                </p>
                <div className="grid gap-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 transition-colors"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                  <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                    <PieChart className="w-20 h-20 text-blue-600 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Visual Analytics
                    </h3>
                    <p className="text-slate-600">
                      Beautiful charts that make your data come alive
                    </p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Target className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Take Control of Your Finances?
                </h2>
                <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                  Join thousands of users who have transformed their financial
                  habits with AuraFinance&apos;s smart insights and analytics.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-lg"
                    >
                      Start Free Today
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                AuraFinance
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <span>© 2025 AuraFinance. All rights reserved.</span>
              <div className="flex gap-4">
                <button className="hover:text-slate-900 transition-colors">
                  Privacy
                </button>
                <button className="hover:text-slate-900 transition-colors">
                  Terms
                </button>
                <button className="hover:text-slate-900 transition-colors">
                  Support
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Demo Modal */}
      {isDemoOpen && <DemoModal isOpen={isDemoOpen} onClose={closeDemo} />}
    </div>
  );
}
