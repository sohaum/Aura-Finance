"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  PlusCircle,
  CreditCard,
  ArrowRight,
  Target,
  Trophy,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getHours,
} from "date-fns";
import { formatCurrency } from "@/lib/utils";

import MetricCard from "@/components/dashboard/MetricCard";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecentExpenses from "@/components/dashboard/RecentExpenses";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/expenses");

        if (!response.ok) {
          if (response.status === 404) {
            setExpenses([]);
          } else {
            throw new Error(`Failed to fetch expenses: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setExpenses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      loadData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Welcome to ExpenseTracker
          </h1>
          <p className="text-slate-600 mb-8 text-lg">
            Smart insights for your financial journey
          </p>
          <Link href="/sign-in">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Calculate metrics with safe defaults
  const today = new Date();
  const currentHour = getHours(today);
  const thisWeekStart = startOfWeek(today);
  const thisWeekEnd = endOfWeek(today);
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);

  const thisWeekExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= thisWeekStart && expDate <= thisWeekEnd;
  });

  const thisMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= thisMonthStart && expDate <= thisMonthEnd;
  });

  const totalThisWeek = thisWeekExpenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0
  );
  const totalThisMonth = thisMonthExpenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0
  );
  const averageDaily =
    thisMonthExpenses.length > 0 ? totalThisMonth / new Date().getDate() : 0;

  // Prepare chart data with safe defaults
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dayExpenses = expenses.filter(
      (exp) =>
        format(new Date(exp.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return {
      date: format(date, "MMM dd"),
      amount: dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    };
  });

  // Category data for pie chart
  const categoryTotals = expenses.reduce((acc, exp) => {
    if (exp.category && exp.amount) {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    }
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const recentExpenses = expenses.slice(0, 5);

  // Get user's first name safely and create personalized greeting
  const firstName =
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "there";

  const getGreeting = () => {
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Gamification: Monthly tracking goal
  const monthlyGoal = 20; // Target: 20 expenses per month
  const currentProgress = thisMonthExpenses.length;
  const progressPercentage = Math.min(
    (currentProgress / monthlyGoal) * 100,
    100
  );

  // Achievement system
  const getAchievementLevel = () => {
    const totalExpenses = expenses.length;
    if (totalExpenses >= 100)
      return {
        level: "Expert Tracker",
        icon: Trophy,
        color: "text-yellow-600",
      };
    if (totalExpenses >= 50)
      return { level: "Advanced User", icon: Target, color: "text-purple-600" };
    if (totalExpenses >= 10)
      return { level: "Getting Started", icon: Zap, color: "text-blue-600" };
    return { level: "Beginner", icon: PlusCircle, color: "text-green-600" };
  };

  const achievement = getAchievementLevel();
  const AchievementIcon = achievement.icon;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Header with Personalization */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-600">
              Here's your financial overview for {format(today, "MMMM yyyy")}
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
              <AchievementIcon className={`w-4 h-4 ${achievement.color}`} />
              <span className={`text-sm font-medium ${achievement.color}`}>
                {achievement.level}
              </span>
            </div>
          </div>
        </div>

        <Link href="/add-expense" className="block">
          <Button className="w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-blue-600 hover:from-emerald-600 hover:via-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden p-4 h-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg mr-3 group-hover:bg-white/30 transition-all duration-200">
                  <PlusCircle className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Add Expense</div>
                  <div className="text-xs text-emerald-100">
                    Track your spending
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 group-hover:text-white transition-all duration-200" />
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Button>
        </Link>
      </div>

      {/* Progress Tracking - Gamification */}
      {expenses.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                Monthly Tracking Goal 🎯
              </h3>
              <p className="text-blue-700 text-sm">
                You've logged {currentProgress} out of {monthlyGoal} expenses
                this month
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-blue-600">Complete</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-blue-600">
            <span>Keep it up! Regular tracking leads to better insights.</span>
            <span>{monthlyGoal - currentProgress} more to go</span>
          </div>
        </div>
      )}

      {/* Welcome message for new users */}
      {expenses.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              Ready to take control of your finances? 🚀
            </h3>
            <p className="text-blue-700 mb-6 max-w-md mx-auto">
              Start by adding your first expense. Every journey begins with a
              single step, and every budget begins with one expense.
            </p>
            <Link href="/add-expense">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 shadow-lg">
                Add Your First Expense
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="This Week"
          value={formatCurrency(totalThisWeek)}
          change={expenses.length > 0 ? "vs last week" : "Start tracking"}
          changeType={expenses.length > 0 ? "neutral" : "neutral"}
          icon={Calendar}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          delay={0}
        />
        <MetricCard
          title="This Month"
          value={formatCurrency(totalThisMonth)}
          change={expenses.length > 0 ? "vs last month" : "No expenses yet"}
          changeType={expenses.length > 0 ? "neutral" : "neutral"}
          icon={DollarSign}
          gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
          delay={0.1}
        />
        <MetricCard
          title="Daily Average"
          value={formatCurrency(averageDaily)}
          change={expenses.length > 0 ? "this month" : "Add expenses"}
          icon={TrendingUp}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          delay={0.2}
        />
        <MetricCard
          title="Total Tracked"
          value={expenses.length.toString()}
          change={
            expenses.length > 0 ? "expenses logged" : "Start your journey"
          }
          icon={CreditCard}
          gradient="bg-gradient-to-r from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Charts - only show if there's data */}
      {expenses.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <ExpenseChart data={last7Days} title="Last 7 Days Spending" />
          {categoryData.length > 0 && (
            <CategoryChart data={categoryData} title="Spending by Category" />
          )}
        </div>
      )}

      {/* Recent Expenses & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {expenses.length > 0 ? (
            <RecentExpenses expenses={recentExpenses} />
          ) : (
            <div className="glass-card p-8 rounded-xl">
              <div className="text-center">
                <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Your expense history will appear here
                </h3>
                <p className="text-slate-600 mb-6">
                  Once you add expenses, you'll see your recent transactions,
                  spending patterns, and detailed analytics right here.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Link href="/add-expense">
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                      Add First Expense
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="outline" className="w-full">
                      Explore Features
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
  {/* Enhanced Quick Actions */}
  <div className="glass-card p-6 rounded-xl border border-white/30 shadow-lg backdrop-blur-sm">
    <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
      <div className="p-1.5 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
        <Zap className="w-5 h-5 text-yellow-600" />
      </div>
      Quick Actions
    </h3>
    <div className="space-y-3">
      <Link href="/add-expense" className="block">
        <Button
          variant="outline"
          className="w-full justify-between group border-2 border-emerald-200 hover:border-emerald-300 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 hover:from-emerald-100/80 hover:to-blue-100/80 transition-all duration-300 p-4 h-auto"
        >
          <div className="flex items-center justify-between"><div className="flex items-center">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
              <PlusCircle className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800">Add New Expense</div>
              <div className="text-xs text-slate-500">Track your spending</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </Button>
      </Link>
      
      <Link href="/analytics" className="block">
        <Button
          variant="outline"
          className="w-full justify-between group border-2 border-purple-200 hover:border-purple-300 bg-gradient-to-r from-purple-50/50 to-blue-50/50 hover:from-purple-100/80 hover:to-blue-100/80 transition-all duration-300 p-4 h-auto"
        >
          <div className="flex items-center justify-between"><div className="flex items-center">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800">View Analytics</div>
              <div className="text-xs text-slate-500">Insights & trends</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </Button>
      </Link>
    </div>
  </div>

  {/* Enhanced Tips Section */}
  <div className="glass-card p-6 rounded-xl border border-white/30 shadow-lg backdrop-blur-sm">
    <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
      <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
        <Target className="w-5 h-5 text-blue-600" />
      </div>
      {expenses.length === 0 ? "Getting Started Tips" : "Pro Tips"}
    </h3>
    
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <>
          <div className="flex items-start space-x-4 p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-slate-800 mb-1">Start with daily expenses</p>
              <p className="text-sm text-slate-600">Add coffee, lunch, transport costs to build the habit</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-3 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-100/50">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-slate-800 mb-1">Use categories wisely</p>
              <p className="text-sm text-slate-600">Organize expenses to understand spending patterns</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-3 rounded-xl bg-gradient-to-r from-purple-50/80 to-violet-50/80 border border-purple-100/50">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-slate-800 mb-1">Check your analytics</p>
              <p className="text-sm text-slate-600">Review insights after adding several expenses</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100/40">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
            <div>
              <p className="font-medium text-slate-800">Daily tracking habit</p>
              <p className="text-sm text-slate-600">Add expenses daily for accurate insights</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-green-50/60 to-emerald-50/60 border border-green-100/40">
            <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
            <div>
              <p className="font-medium text-slate-800">AI-powered insights</p>
              <p className="text-sm text-slate-600">Use AI analysis for personalized advice</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50/60 to-violet-50/60 border border-purple-100/40">
            <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
            <div>
              <p className="font-medium text-slate-800">Monthly goal setting</p>
              <p className="text-sm text-slate-600">Set and track spending targets</p>
            </div>
          </div>
        </>
      )}
    </div>
    
    {/* Progress indicator for new users */}
    {expenses.length === 0 && (
      <div className="mt-5 pt-4 border-t border-slate-200/50">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Getting started</span>
          <span>0/3 steps</span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{width: '0%'}}></div>
        </div>
      </div>
    )}
  </div>
</div>
      </div>
    </div>
  );
}
