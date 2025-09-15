import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from "framer-motion";

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

export default function CategoryChart({ data, title = "Spending by Category" }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 capitalize">{payload[0].payload.category}</p>
          <p className="text-blue-600 font-semibold">
            ${payload[0].value.toFixed(2)}
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