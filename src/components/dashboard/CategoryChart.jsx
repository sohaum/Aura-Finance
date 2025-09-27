import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from "framer-motion";

// Updated color mapping to match your database enum (uppercase keys)
const CATEGORY_COLORS = {
  FOOD: '#FF6B6B',           // Coral Red
  TRANSPORTATION: '#4ECDC4',  // Turquoise  
  SHOPPING: '#9B59B6',       // Purple
  ENTERTAINMENT: '#2ECC71',   // Emerald Green
  BILLS: '#F1C40F',          // Sunny Yellow
  HEALTHCARE: '#FF69B4',     // Hot Pink
  EDUCATION: '#3498DB',      // Bright Blue
  TRAVEL: '#E67E22',         // Vibrant Orange
  GROCERIES: '#27AE60',      // Forest Green
  FITNESS: '#00CED1',        // Dark Turquoise
  SUBSCRIPTIONS: '#FFA07A',   // Light Salmon
  OTHER: '#95A5A6'           // Cool Gray
};

// Fallback colors for dynamic assignment
const VIBRANT_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#9B59B6', // Purple
  '#2ECC71', // Emerald
  '#F1C40F', // Yellow
  '#FF69B4', // Hot Pink
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#27AE60', // Green
  '#00CED1', // Dark Turquoise
  '#FFA07A', // Salmon
  '#95A5A6'  // Gray
];

export default function CategoryChart({ data, title = "Spending by Category" }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const categoryName = payload[0].payload.category;
      const amount = payload[0].value;
      
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
          <p className="font-semibold text-slate-800 capitalize mb-1">
            {categoryName}
          </p>
          <p className="text-blue-600 font-bold text-lg">
            {new Intl.NumberFormat('en-IN', { 
              style: 'currency', 
              currency: 'INR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            }).format(amount)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, category }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is significant enough
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="glass-card hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-900 font-bold text-lg">
            {title}
          </CardTitle>
          <p className="text-slate-600 text-sm">
            Visual breakdown of your spending patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  strokeWidth={2}
                  stroke="white"
                >
                  {data.map((entry, index) => {
                    // Try to get color by category name (both original and display formats)
                    let color = CATEGORY_COLORS[entry.originalCategory] || 
                               CATEGORY_COLORS[entry.category?.toUpperCase()] ||
                               VIBRANT_COLORS[index % VIBRANT_COLORS.length];
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Category Legend */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            {data.slice(0, 6).map((entry, index) => {
              const color = CATEGORY_COLORS[entry.originalCategory] || 
                           CATEGORY_COLORS[entry.category?.toUpperCase()] ||
                           VIBRANT_COLORS[index % VIBRANT_COLORS.length];
              
              return (
                <div key={entry.category} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-white/30"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-700 font-medium truncate">
                    {entry.category}
                  </span>
                  <span className="text-slate-500 text-xs ml-auto">
                    {new Intl.NumberFormat('en-IN', { 
                      style: 'currency', 
                      currency: 'INR',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(entry.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}