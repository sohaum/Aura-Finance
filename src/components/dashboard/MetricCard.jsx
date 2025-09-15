import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  gradient,
  delay = 0 
}) {
  const changeColor = changeType === 'increase' ? 'text-red-500' : 'text-green-500';
  const changeIcon = changeType === 'increase' ? '↑' : '↓';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="glass-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="p-6 relative overflow-hidden">
          <div 
            className={`absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 rounded-full opacity-20 ${gradient}`}
          />
          
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${gradient} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            {change && (
              <div className={`text-sm font-semibold ${changeColor} flex items-center gap-1`}>
                <span>{changeIcon}</span>
                <span>{change}</span>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}