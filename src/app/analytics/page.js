import React, { useState, useEffect } from "react";
import { Expense, User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
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
  Lightbulb,
  Target,
  AlertCircle
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
  Cell
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

const CATEGORY_COLORS = {
  food: '#FF6B6B',
  transportation: '#4ECDC4',
  shopping: '#45B7D1',
  entertainment: '#96CEB4',
  bills: '#FFEAA7',
  healthcare: '#DDA0DD',
  education: '#98D8C8',
  travel: '#F7DC6F',
  groceries: '#BB8FCE',
  fitness: '#85C1E9',
  subscriptions: '#F8C471',
  other: '#AED6F1'
};

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        const expenseData = await Expense.filter(
          { created_by: userData.email }, 
          '-created_date', 
          200
        );
        setExpenses(expenseData);
      } catch (error) {
        console.error("Error loading data:", error);
        if (error.message?.includes('not authenticated')) {
          User.login();
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const generateAIInsights = async () => {
    if (expenses.length === 0) return;
    
    setGeneratingInsights(true);
    try {
      const expenseSummary = expenses.map(exp => ({
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
        title: exp.title
      }));

      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categories = [...new Set(expenses.map(exp => exp.category))];
      
      const result = await InvokeLLM({
        prompt: `Analyze this expense data and provide personalized financial insights:
        
        Total expenses: $${totalSpent.toFixed(2)}
        Number of transactions: ${expenses.length}
        Categories: ${categories.join(', ')}
        
        Sample expenses: ${JSON.stringify(expenseSummary.slice(0, 20))}
        
        Please provide:
        1. Key spending patterns and trends
        2. Top spending categories analysis
        3. Personalized money-saving suggestions
        4. Budget recommendations
        5. Any concerning spending habits
        
        Make it conversational, helpful, and actionable. Focus on practical advice.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            patterns: { type: "array", items: { type: "string" } },
            top_categories: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            budget_tips: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiInsights(result);
    } catch (error) {
      console.error("Error generating AI insights:", error);
    }
    setGeneratingInsights(false);
  };

  // Calculate analytics data
  const today = new Date();
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));

  const thisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= thisMonthStart && expDate <= thisMonthEnd;
  });

  const lastMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= lastMonthStart && expDate <= lastMonthEnd;
  });

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ 
      category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '), 
      amount,
      originalCategory: category
    }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(today, 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });

    return {
      month: format(date, 'MMM yyyy'),
      amount: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    };
  });

  // Daily trend for current month
  const dailyTrend = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const dayExpenses = expenses.filter(exp => 
      format(new Date(exp.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    return {
      date: format(date, 'MMM dd'),
      amount: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Analytics & Insights</h1>
            <p className="text-slate-600">Deep dive into your spending patterns</p>
          </div>
          
          <Button
            onClick={generateAIInsights}
            disabled={generatingInsights || expenses.length === 0}
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
                Get AI Insights
              </div>
            )}
          </Button>
        </div>

        {expenses.length === 0 ? (
          <Card className="glass-card text-center p-8">
            <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Yet</h3>
            <p className="text-slate-600">Start adding expenses to see analytics and insights.</p>
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
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {thisMonthExpenses.length} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lastMonthExpenses.length} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) / new Date().getDate()).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#667eea"
                          strokeWidth={2}
                          dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Category Breakdown Bar Chart */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData.slice(0, 8)} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                          <XAxis type="number" stroke="#64748b" fontSize={12} />
                          <YAxis 
                            type="category" 
                            dataKey="category" 
                            stroke="#64748b" 
                            fontSize={12}
                            width={80}
                          />
                          <Tooltip />
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
                              `${category} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {categoryData.slice(0, 6).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CATEGORY_COLORS[entry.originalCategory] || '#AED6F1'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip />
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
                      <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[category.originalCategory] || '#AED6F1' }}
                          />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${category.amount.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">
                            {expenses.filter(exp => exp.category === category.originalCategory).length} items
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
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
                        <span>Highest spending day:</span>
                        <span className="font-semibold">
                          {expenses.length > 0 ? 
                            format(new Date(expenses.sort((a, b) => b.amount - a.amount)[0].date), 'MMM dd') :
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most expensive category:</span>
                        <span className="font-semibold">
                          {categoryData[0]?.category || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average transaction:</span>
                        <span className="font-semibold">
                          ${expenses.length > 0 ? 
                            (expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toFixed(2) :
                            '0.00'
                          }
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
                        <Badge variant={
                          thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) > 
                          lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) ? 
                          'destructive' : 'default'
                        }>
                          {thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) > 
                           lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) ? 
                           '↑ Higher' : '↓ Lower'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {!aiInsights ? (
                <Card className="glass-card text-center p-8">
                  <Brain className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-slate-600 mb-6">
                    Get personalized financial insights and recommendations based on your spending patterns.
                  </p>
                  <Button
                    onClick={generateAIInsights}
                    disabled={generatingInsights}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    {generatingInsights ? "Analyzing your data..." : "Generate Insights"}
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        Financial Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">{aiInsights.summary}</p>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Spending Patterns */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                          Spending Patterns
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiInsights.patterns?.map((pattern, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-slate-700">{pattern}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Money-Saving Tips */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Money-Saving Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiInsights.suggestions?.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-slate-700">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Budget Recommendations */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-500" />
                          Budget Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiInsights.budget_tips?.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-slate-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Concerns */}
                    {aiInsights.concerns?.length > 0 && (
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Areas to Watch
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {aiInsights.concerns.map((concern, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-slate-700">{concern}</span>
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
          </Tabs>
        )}
      </motion.div>
    </div>
  );
}