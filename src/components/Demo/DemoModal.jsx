"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  PlusCircle,
  BarChart3,
  PieChart,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

// Sample data for demo
const SAMPLE_EXPENSES = [
  { id: 1, title: "Coffee at Starbucks", amount: 450, category: "FOOD", date: "2024-01-15" },
  { id: 2, title: "Uber Ride", amount: 280, category: "TRANSPORTATION", date: "2024-01-15" },
  { id: 3, title: "Grocery Shopping", amount: 1200, category: "GROCERIES", date: "2024-01-14" },
  { id: 4, title: "Netflix Subscription", amount: 649, category: "SUBSCRIPTIONS", date: "2024-01-14" },
  { id: 5, title: "Gym Membership", amount: 2000, category: "FITNESS", date: "2024-01-13" },
  { id: 6, title: "Movie Tickets", amount: 800, category: "ENTERTAINMENT", date: "2024-01-13" },
];

const CATEGORY_COLORS = {
  FOOD: "#FF6B6B",
  TRANSPORTATION: "#4ECDC4", 
  GROCERIES: "#45B7D1",
  SUBSCRIPTIONS: "#96CEB4",
  FITNESS: "#FFEAA7",
  ENTERTAINMENT: "#DDA0DD",
};

const DEMO_STEPS = [
  { id: 1, title: "Dashboard Overview", description: "See your spending at a glance with beautiful metrics and charts" },
  { id: 2, title: "Add New Expense", description: "Quick and intuitive expense entry with smart categorization" },
  { id: 3, title: "Visual Analytics", description: "Understand your spending patterns with interactive charts" }
];

export default function DemoModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animatedExpenses, setAnimatedExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ title: "", amount: "", category: "" });

  // Auto-advance demo steps
  useEffect(() => {
  if (!isOpen || !isPlaying) return;
  
  let interval;
  if (currentStep < 3) {
    interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 3) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
  }
  return () => clearInterval(interval);
}, [isPlaying, currentStep, isOpen]);

  // Animate expenses loading
  useEffect(() => {
    if (!isOpen) return;
    
    if (currentStep === 1) {
      setAnimatedExpenses([]);
      SAMPLE_EXPENSES.forEach((expense, index) => {
        setTimeout(() => {
          setAnimatedExpenses(prev => [...prev, expense]);
        }, index * 300);
      });
    }
  }, [currentStep, isOpen]);

  // Simulate typing for step 2
  useEffect(() => {
    if (!isOpen) return;
    
    if (currentStep === 2) {
      const simulateTyping = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setNewExpense({ title: "L", amount: "", category: "" });
        
        await new Promise(resolve => setTimeout(resolve, 150));
        setNewExpense({ title: "Lu", amount: "", category: "" });
        
        await new Promise(resolve => setTimeout(resolve, 150));
        setNewExpense({ title: "Lunch", amount: "", category: "" });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setNewExpense({ title: "Lunch", amount: "3", category: "" });
        
        await new Promise(resolve => setTimeout(resolve, 150));
        setNewExpense({ title: "Lunch", amount: "35", category: "" });
        
        await new Promise(resolve => setTimeout(resolve, 150));
        setNewExpense({ title: "Lunch", amount: "350", category: "" });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setNewExpense({ title: "Lunch", amount: "350", category: "FOOD" });
      };
      
      simulateTyping();
    }
  }, [currentStep, isOpen]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const resetDemo = () => {
    setAnimatedExpenses([]);
    setCurrentStep(1);
    setIsPlaying(false);
    setNewExpense({ title: "", amount: "", category: "" });
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Calculate demo data
  const totalAmount = animatedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryData = Object.entries(
    animatedExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({ category, amount }));

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">Dashboard Overview</h3>
              <p className="text-slate-600">Watch your expenses load with beautiful animations</p>
            </div>

            {/* Demo Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/90 rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">This Week</span>
                </div>
                <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
                <p className="text-xs text-slate-500">{animatedExpenses.length} transactions</p>
              </div>

              <div className="bg-white/90 rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Average</span>
                </div>
                <div className="text-2xl font-bold">₹{Math.round(totalAmount / (animatedExpenses.length || 1)).toLocaleString()}</div>
                <p className="text-xs text-slate-500">per transaction</p>
              </div>

              <div className="bg-white/90 rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Categories</span>
                </div>
                <div className="text-2xl font-bold">{categoryData.length}</div>
                <p className="text-xs text-slate-500">different types</p>
              </div>

              <div className="bg-white/90 rounded-lg border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</div>
                <p className="text-xs text-slate-500 mt-1">tracking enabled</p>
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white/90 rounded-lg border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold">Recent Expenses</h3>
              </div>
              <div className="p-4 space-y-3">
                {animatedExpenses.map((expense, index) => (
                  <div key={`step1-${expense.id}-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                      />
                      <div>
                        <div className="font-medium">{expense.title}</div>
                        <div className="text-xs text-slate-500">{expense.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{expense.amount}</div>
                      <div className="text-xs text-slate-500">{expense.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">Add New Expense</h3>
              <p className="text-slate-600">Watch how easy it is to log a new expense</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/90 rounded-lg border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold">Expense Form</h3>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">What did you spend on? *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newExpense.title}
                        placeholder="e.g., Coffee, Lunch, Gas..."
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        readOnly
                      />
                      {newExpense.title && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-6 bg-blue-600 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Amount *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-semibold">₹</span>
                      <input
                        type="text"
                        value={newExpense.amount}
                        placeholder="0.00"
                        className="w-full pl-8 p-3 border border-slate-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-lg font-medium"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Category *</label>
                    <div className="relative">
                      <select
                        value={newExpense.category}
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white appearance-none"
                        disabled
                      >
                        <option value="">Select a category</option>
                        <option value="FOOD">🍽️ Food & Dining</option>
                      </select>
                      {newExpense.category && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className={`w-full p-3 rounded-lg font-medium transition-all ${
                      newExpense.title && newExpense.amount && newExpense.category
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                    disabled={!newExpense.title || !newExpense.amount || !newExpense.category}
                  >
                    Save Expense
                  </button>
                </div>
              </div>

              <div className="bg-white/90 rounded-lg border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Preview</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-lg">
                    <div className="text-3xl font-bold text-slate-900 mb-2">₹{newExpense.amount || "0"}</div>
                    <div className="text-lg text-slate-600 mb-3">{newExpense.title || "Expense title"}</div>
                    {newExpense.category && (
                      <div className="inline-block px-2 py-1 bg-red-50 text-red-700 border border-red-200 text-xs rounded-full">
                        🍽️ Food & Dining
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
              <p className="text-slate-600">Understand your spending with beautiful charts</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/90 rounded-lg border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Category Breakdown</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-64 flex items-center justify-center">
                    <div className="space-y-4 w-full">
                      {categoryData.map((item, index) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                            />
                            <span className="text-sm font-medium">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded"
                              style={{ 
                                width: `${Math.max((item.amount / totalAmount) * 100, 20)}px`,
                                maxWidth: '120px'
                              }}
                            />
                            <span className="text-sm text-slate-600">₹{item.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 rounded-lg border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Expense Trends</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-64 flex items-end justify-between gap-2">
                    {animatedExpenses.slice(0, 5).map((expense, index) => (
                      <div key={`chart-${expense.id}-${index}`} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-300"
                          style={{ 
                            height: `${Math.max((expense.amount / Math.max(...animatedExpenses.map(e => e.amount))) * 150, 20)}px`
                          }}
                        />
                        <div className="text-xs text-slate-600 mt-2 text-center">
                          {expense.title.split(' ')[0]}
                        </div>
                        <div className="text-xs font-medium text-slate-900">₹{expense.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white/90 rounded-lg border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold">AI-Powered Insights</h3>
              </div>
              <div className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-semibold text-blue-900 mb-2">💡 Smart Tip</div>
                    <p className="text-sm text-blue-700">Your food spending increased 23% this week. Consider meal planning to save money.</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-semibold text-emerald-900 mb-2">📊 Pattern</div>
                    <p className="text-sm text-emerald-700">You spend most on weekends. Setting weekly limits could help control expenses.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="font-semibold text-purple-900 mb-2">🎯 Goal</div>
                    <p className="text-sm text-purple-700">You&apos;re on track to save ₹5,000 this month if you maintain current spending.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex overflow-hidden shadow-2xl">
        {/* Demo Content */}
        <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              AuraFinance Demo
            </h2>
            <p className="text-slate-600">This demo shows a step-by-step AuraFinance walkthrough.</p>
          </div>

          {renderStepContent()}
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-slate-900">Demo Controls</h4>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            {DEMO_STEPS.map((step) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  currentStep === step.id
                    ? "border-blue-300 bg-blue-50"
                    : currentStep > step.id
                    ? "border-green-300 bg-green-50"
                    : "border-slate-200 bg-slate-50"
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : currentStep > step.id
                      ? "bg-green-600 text-white"
                      : "bg-slate-300 text-slate-600"
                  }`}>
                    {step.id}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-slate-600">{step.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="space-y-3 mt-auto">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={currentStep === 3}
                className="flex-1"
              >
                Next
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Auto Play"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetDemo}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}