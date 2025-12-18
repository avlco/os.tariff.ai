import React from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'teal' }) {
  const { theme, isRTL } = useLanguage();

  const colors = {
    teal: 'bg-[#42C0B9]',
    navy: 'bg-[#114B5F]',
    gold: 'bg-[#D89C42]',
    red: 'bg-red-500',
    green: 'bg-green-500'
  };

  return (
    <div className={cn(
      "rounded-xl p-6 transition-all hover:shadow-lg",
      theme === 'dark' ? "bg-slate-800" : "bg-white",
      "border",
      theme === 'dark' ? "border-slate-700" : "border-gray-100"
    )}>
      <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
        <div>
          <p className={cn(
            "text-sm font-medium",
            theme === 'dark' ? "text-slate-400" : "text-gray-500"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold mt-2",
            theme === 'dark' ? "text-white" : "text-[#114B5F]"
          )}>
            {value}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              trend === 'up' ? "text-green-500" : "text-red-500"
            )}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          colors[color]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}