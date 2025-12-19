import React from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'teal' }) {
  const { theme, isRTL } = useLanguage();

  return (
    <div className={cn(
      "rounded-xl p-6 transition-all border shadow-sm hover:shadow-md",
      theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200"
    )}>
      <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            theme === 'dark' ? "text-slate-400" : "text-gray-500"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold mb-2",
            theme === 'dark' ? "text-white" : "text-[#114B5F]"
          )}>
            {value}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1",
              trend === 'up' ? "text-green-600" : "text-red-600"
            )}>
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          color === 'navy' && "bg-[#114B5F]/10",
          color === 'teal' && "bg-[#42C0B9]/10",
          color === 'gold' && "bg-[#D89C42]/10",
          color === 'green' && "bg-green-500/10"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            color === 'navy' && "text-[#114B5F]",
            color === 'teal' && "text-[#42C0B9]",
            color === 'gold' && "text-[#D89C42]",
            color === 'green' && "text-green-600"
          )} />
        </div>
      </div>
    </div>
  );
}