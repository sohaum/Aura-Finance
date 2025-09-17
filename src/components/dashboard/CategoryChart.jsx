import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from "framer-motion";

const CATEGORY_COLORS = {
  food: '#FF6B6B',        // Coral Red
  transportation: '#4ECDC4', // Turquoise
  shopping: '#9B59B6',    // Purple
  entertainment: '#2ECC71', // Emerald Green
  bills: '#F1C40F',      // Yellow
  healthcare: '#FF69B4',  // Hot Pink
  education: '#3498DB',   // Blue
  travel: '#E67E22',     // Orange
  groceries: '#27AE60',  // Nephritis Green
  fitness: '#00CED1',    // Dark Turquoise
  subscriptions: '#FFA07A', // Light Salmon
  other: '#95A5A6'       // Gray
};

export default function CategoryChart({ data, title = "Spending by Category" }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 capitalize">{payload[0].payload.category}</p>
          <p className="text-blue-600 font-semibold">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-slate-900 font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ category, percent }) => 
                    `${category} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.category] || '#AED6F1'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}