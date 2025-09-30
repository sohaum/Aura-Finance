"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Brain,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { generateFinancialInsights } from "@/lib/insightsGenerator";

const CATEGORY_COLORS = {
  FOOD: "#FF6B6B",
  TRANSPORTATION: "#4ECDC4",
  SHOPPING: "#45B7D1",
  ENTERTAINMENT: "#96CEB4",
  BILLS: "#FFEAA7",
  HEALTHCARE: "#DDA0DD",
  EDUCATION: "#98D8C8",
  TRAVEL: "#F7DC6F",
  GROCERIES: "#BB8FCE",
  FITNESS: "#85C1E9",
  SUBSCRIPTIONS: "#F8C471",
  OTHER: "#AED6F1",
};

// Alternative: Create a more vibrant color palette
const VIBRANT_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Purple
  "#FFB347", // Orange
  "#87CEEB", // Sky Blue
  "#98FB98", // Pale Green
  "#F0E68C", // Khaki
  "#FFB6C1", // Light Pink
  "#D3D3D3", // Light Gray
];

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

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
      router.push("/sign-in");
    }
  }, [status, router]);

  // const generateAIInsights = async () => {
  //   if (expenses.length === 0) return;

  //   setGeneratingInsights(true);
  //   try {
  //     // Prepare expense data for AI analysis
  //     const totalSpent = expenses.reduce(
  //       (sum, exp) => sum + (exp.amount || 0),
  //       0
  //     );
  //     const categoryBreakdown = categoryData.map((cat) => ({
  //       category: cat.category,
  //       amount: cat.amount,
  //       percentage: ((cat.amount / totalSpent) * 100).toFixed(1),
  //     }));

  //     const recentExpenses = expenses
  //       .sort((a, b) => new Date(b.date) - new Date(a.date))
  //       .slice(0, 10)
  //       .map((exp) => ({
  //         title: exp.title,
  //         amount: exp.amount,
  //         category: exp.category,
  //         date: exp.date,
  //       }));

  //     const analysisData = {
  //       totalExpenses: totalSpent,
  //       transactionCount: expenses.length,
  //       thisMonthSpending: thisMonthTotal,
  //       lastMonthSpending: lastMonthTotal,
  //       categoryBreakdown,
  //       recentExpenses,
  //       averageTransaction: totalSpent / expenses.length,
  //       topCategory: categoryData[0]?.category || "None",
  //     };

  //     const response = await fetch("/api/ai-insights", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(analysisData),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to generate AI insights");
  //     }

  //     const insights = await response.json();
  //     setAiInsights(insights);
  //   } catch (error) {
  //     console.error("Error generating AI insights:", error);
  //     // Set a fallback message
  //     setAiInsights({
  //       error:
  //         "Unable to generate insights at this time. Please try again later.",
  //     });
  //   }
  //   setGeneratingInsights(false);
  // };

  const generateInsights = () => {
    if (expenses.length === 0) return;

    setGeneratingInsights(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const insights = generateFinancialInsights(expenses);
      setAiInsights(insights);
      setGeneratingInsights(false);
    }, 800);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Analytics
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Calculate analytics data
  const today = new Date();
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));

  const thisMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= thisMonthStart && expDate <= thisMonthEnd;
  });

  const lastMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= lastMonthStart && expDate <= lastMonthEnd;
  });

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    if (exp.category && exp.amount) {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    }
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category:
        category.charAt(0).toUpperCase() + category.slice(1).replace("_", " "),
      amount,
      originalCategory: category,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(today, 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });

    return {
      month: format(date, "MMM yyyy"),
      amount: monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    };
  });

  // Daily trend for current month
  const dailyTrend = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const dayExpenses = expenses.filter(
      (exp) =>
        format(new Date(exp.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    return {
      date: format(date, "MMM dd"),
      amount: dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    };
  });

  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0
  );
  const lastMonthTotal = lastMonthExpenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0
  );
  const dailyAverage =
    thisMonthExpenses.length > 0 ? thisMonthTotal / new Date().getDate() : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Analytics & Insights
            </h1>
            <p className="text-slate-600">
              Deep dive into your spending patterns
            </p>
          </div>

          {expenses.length > 0 && (
            <Button
              onClick={generateInsights}
              disabled={generatingInsights}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {generatingInsights ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Generate Insights
                </div>
              )}
            </Button>
          )}
        </div>

        {expenses.length === 0 ? (
          <Card className="glass-card text-center p-8">
            <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Data Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start adding expenses to see analytics and insights.
            </p>
            <Button
              onClick={() => router.push("/add-expense")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              Add Your First Expense
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      This Month
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(thisMonthTotal)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {thisMonthExpenses.length} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Last Month
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(lastMonthTotal)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lastMonthExpenses.length} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Daily Average
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(dailyAverage)}
                    </div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Spending Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Daily Spending (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148, 163, 184, 0.3)"
                        />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            borderRadius: "8px",
                            backdropFilter: "blur(10px)",
                          }}
                          formatter={(value) => {
                            const val = Array.isArray(value) ? value[0] : value;
                            return [formatCurrency(val), "Amount"];
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#667eea"
                          strokeWidth={2}
                          dot={{ fill: "#667eea", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#667eea",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {!aiInsights ? (
                <Card className="glass-card text-center p-8">
                  <Brain className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    AI-Powered Insights
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Get personalized financial insights and recommendations
                    based on your spending patterns using AI analysis.
                  </p>
                  {expenses.length > 0 ? (
                    <Button
                      onClick={generateInsights}
                      disabled={generatingInsights}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      {generatingInsights ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Analyzing your data...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Generate AI Insights
                        </div>
                      )}
                    </Button>
                  ) : (
                    <div className="text-slate-500">
                      <p className="mb-4">
                        Add some expenses first to get personalized insights.
                      </p>
                      <Button
                        onClick={() => router.push("/add-expense")}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      >
                        Add Your First Expense
                      </Button>
                    </div>
                  )}
                </Card>
              ) : aiInsights.error ? (
                <Card className="glass-card text-center p-8">
                  <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-red-600 mb-2">
                    Unable to Generate Insights
                  </h3>
                  <p className="text-slate-600 mb-6">{aiInsights.error}</p>
                  <Button
                    onClick={generateInsights}
                    disabled={generatingInsights}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  {aiInsights.summary && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-500" />
                          Financial Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">
                          {aiInsights.summary}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Spending Patterns */}
                    {aiInsights.patterns && aiInsights.patterns.length > 0 && (
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Spending Patterns
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {aiInsights.patterns.map((pattern, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-slate-700">
                                  {pattern}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Money-Saving Tips */}
                    {aiInsights.suggestions &&
                      aiInsights.suggestions.length > 0 && (
                        <Card className="glass-card">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-500" />
                              Money-Saving Tips
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {aiInsights.suggestions.map(
                                (suggestion, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-slate-700">
                                      {suggestion}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                    {/* Budget Recommendations */}
                    {aiInsights.budgetTips && aiInsights.budgetTips.length > 0 && (
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-500" />
                            Budget Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {aiInsights.budgetTips.map((tip, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-slate-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Concerns */}
                    {aiInsights.concerns && aiInsights.concerns.length > 0 && (
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Areas to Watch
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {aiInsights.concerns.map((concern, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-slate-700">
                                  {concern}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              {categoryData.length > 0 ? (
                <>
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Category Breakdown Bar Chart */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={categoryData.slice(0, 8)}
                              layout="horizontal"
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(148, 163, 184, 0.3)"
                              />
                              <XAxis
                                type="number"
                                stroke="#64748b"
                                fontSize={12}
                              />
                              <YAxis
                                type="category"
                                dataKey="category"
                                stroke="#64748b"
                                fontSize={12}
                                width={80}
                              />
                              <Tooltip
                                formatter={(value) => {
                                  const val = Array.isArray(value)
                                    ? value[0]
                                    : value;
                                  return [formatCurrency(val), "Amount"];
                                }}
                              />
                              <Bar
                                dataKey="amount"
                                fill="#667eea"
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Category Pie Chart */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={categoryData.slice(0, 6)}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="amount"
                                label={({ category, percent }) =>
                                  `${category} ${(percent * 100).toFixed(2)}%`
                                }
                              >
                                {categoryData
                                  .slice(0, 6)
                                  .map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        // First try to match by original category name
                                        CATEGORY_COLORS[
                                          entry.originalCategory
                                        ] ||
                                        // Fallback to vibrant colors by index
                                        VIBRANT_COLORS[
                                          index % VIBRANT_COLORS.length
                                        ]
                                      }
                                    />
                                  ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => {
                                  const val = Array.isArray(value)
                                    ? value[0]
                                    : value;
                                  return [formatCurrency(val), "Amount"];
                                }}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category List */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>All Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {categoryData.map((category, index) => (
                          <div
                            key={category.category}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/40"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor:
                                    CATEGORY_COLORS[
                                      category.originalCategory
                                    ] || "#AED6F1",
                                }}
                              />
                              <span className="font-medium">
                                {category.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                {formatCurrency(category.amount)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {
                                  expenses.filter(
                                    (exp) =>
                                      exp.category === category.originalCategory
                                  ).length
                                }{" "}
                                items
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="glass-card text-center p-8">
                  <PieChart className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    No Categories Yet
                  </h3>
                  <p className="text-slate-600">
                    Add some expenses to see category breakdowns.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {/* Monthly Trend */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>6-Month Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={last6Months}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148, 163, 184, 0.3)"
                        />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          formatter={(value) => {
                            const val = Array.isArray(value) ? value[0] : value;
                            return [formatCurrency(val), "Amount"];
                          }}
                        />
                        <Bar
                          dataKey="amount"
                          fill="#667eea"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Spending Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Spending Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Highest single expense:</span>
                        <span className="font-semibold">
                          {expenses.length > 0
                            ? formatCurrency(
                                Math.max(
                                  ...expenses.map((exp) => exp.amount || 0)
                                )
                              )
                            : formatCurrency(0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most expensive category:</span>
                        <span className="font-semibold">
                          {categoryData[0]?.category || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average transaction:</span>
                        <span className="font-semibold">
                          {expenses.length > 0
                            ? formatCurrency(
                                expenses.reduce(
                                  (sum, exp) => sum + (exp.amount || 0),
                                  0
                                ) / expenses.length
                              )
                            : formatCurrency(0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total transactions:</span>
                        <Badge variant="secondary">{expenses.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Categories used:</span>
                        <Badge variant="secondary">{categoryData.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>This month vs last:</span>
                        <Badge
                          variant={
                            thisMonthTotal > lastMonthTotal
                              ? "destructive"
                              : "default"
                          }
                        >
                          {thisMonthTotal > lastMonthTotal
                            ? "↑ Higher"
                            : "↓ Lower"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </div>
  );
}
