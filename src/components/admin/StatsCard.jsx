import React from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'teal' }) {
  const { theme, isRTL } = useLanguage();

  return (
    <div className={cn(
      "rounded-lg p-6 transition-all border",
      theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
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
            "text-2xl font-semibold mb-2",
            theme === 'dark' ? "text-white" : "text-gray-900"
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
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          theme === 'dark' ? "bg-slate-700" : "bg-gray-100"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            theme === 'dark' ? "text-slate-400" : "text-gray-600"
          )} />
        </div>
      </div>
    </div>
  );
}