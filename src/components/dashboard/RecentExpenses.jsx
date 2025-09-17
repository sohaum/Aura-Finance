import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Car, 
  Utensils, 
  Gamepad2, 
  Receipt, 
  Heart, 
  GraduationCap, 
  Plane,
  Dumbbell,
  Smartphone
} from "lucide-react";

const categoryIcons = {
  food: Utensils,
  transportation: Car,
  shopping: ShoppingBag,
  entertainment: Gamepad2,
  bills: Receipt,
  healthcare: Heart,
  education: GraduationCap,
  travel: Plane,
  groceries: Utensils,
  fitness: Dumbbell,
  subscriptions: Smartphone,
  other: Receipt
};

const categoryColors = {
  food: 'bg-red-100 text-red-800',
  transportation: 'bg-blue-100 text-blue-800',
  shopping: 'bg-purple-100 text-purple-800',
  entertainment: 'bg-green-100 text-green-800',
  bills: 'bg-yellow-100 text-yellow-800',
  healthcare: 'bg-pink-100 text-pink-800',
  education: 'bg-indigo-100 text-indigo-800',
  travel: 'bg-orange-100 text-orange-800',
  groceries: 'bg-emerald-100 text-emerald-800',
  fitness: 'bg-cyan-100 text-cyan-800',
  subscriptions: 'bg-amber-100 text-amber-800',
  other: 'bg-gray-100 text-gray-800'
};

export default function RecentExpenses({ expenses }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-slate-900 font-bold">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {expenses.map((expense, index) => {
                const IconComponent = categoryIcons[expense.category] || Receipt;
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/60 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-200">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{expense.title}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{expense.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</p>
                      <Badge className={`text-xs ${categoryColors[expense.category]}`}>
                        {expense.category}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {expenses.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No expenses yet. Start tracking your spending!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}