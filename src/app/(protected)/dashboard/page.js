"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  PlusCircle,
  CreditCard,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/utils";

import MetricCard from "@/components/dashboard/MetricCard";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecentExpenses from "@/components/dashboard/RecentExpenses";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (!response.ok) throw new Error('Failed to fetch expenses');
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error("Error loading data:", error);
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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 mb-4">Please sign in to view your dashboard</p>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // Calculate metrics
  const today = new Date();
  const thisWeekStart = startOfWeek(today);
  const thisWeekEnd = endOfWeek(today);
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  
  const thisWeekExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= thisWeekStart && expDate <= thisWeekEnd;
  });
  
  const thisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= thisMonthStart && expDate <= thisMonthEnd;
  });

  const totalThisWeek = thisWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageDaily = expenses.length > 0 ? totalThisMonth / new Date().getDate() : 0;

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dayExpenses = expenses.filter(exp => 
      format(new Date(exp.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'MMM dd'),
      amount: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    };
  });

  // Category data for pie chart
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
  
  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const recentExpenses = expenses.slice(0, 5);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">Welcome to ExpenseTracker</h1>
          <p className="text-slate-600 mb-8 text-lg">Smart insights for your financial journey</p>
          <Link href="/sign-in">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-slate-600">
            Here's your financial overview for {format(today, 'MMMM yyyy')}
          </p>
        </div>
        
        <Link href="/add-expense">
          <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
            <PlusCircle className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="This Week"
          value={formatCurrency(totalThisWeek)}
          change="12% vs last week"
          changeType="increase"
          icon={Calendar}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          delay={0}
        />
        <MetricCard
          title="This Month"
          value={formatCurrency(totalThisMonth)}
          change="8% vs last month"
          changeType="increase"
          icon={DollarSign}
          gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
          delay={0.1}
        />
        <MetricCard
          title="Daily Average"
          value={formatCurrency(averageDaily)}
          icon={TrendingUp}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          delay={0.2}
        />
        <MetricCard
          title="Total Expenses"
          value={expenses.length}
          icon={CreditCard}
          gradient="bg-gradient-to-r from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <ExpenseChart data={last7Days} title="Last 7 Days Spending" />
        {categoryData.length > 0 && (
          <CategoryChart data={categoryData} title="Spending by Category" />
        )}
      </div>

      {/* Recent Expenses & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentExpenses expenses={recentExpenses} />
        </div>
        
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/add-expense">
                <Button variant="outline" className="w-full justify-start group hover:bg-white/60">
                  <PlusCircle className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Add New Expense
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start group hover:bg-white/60">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {expenses.length === 0 && (
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Start Tracking!</h3>
              <p className="text-slate-600 text-sm mb-4">
                Add your first expense to see personalized insights and analytics.
              </p>
              <Link href="/add-expense">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  Add First Expense
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}