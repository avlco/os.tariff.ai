import React from 'react';
import { useLanguage } from './LanguageContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, type = 'status' }) {
  const { t } = useLanguage();

  const statusStyles = {
    // User/Report status
    active: 'bg-[#42C0B9]/10 text-[#2e9a94] border-[#42C0B9]/30',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200/50',
    suspended: 'bg-red-50 text-red-700 border-red-200/50',
    pending: 'bg-[#D89C42]/10 text-[#b8822f] border-[#D89C42]/30',
    completed: 'bg-[#42C0B9]/10 text-[#2e9a94] border-[#42C0B9]/30',
    failed: 'bg-red-50 text-red-700 border-red-200/50',
    review: 'bg-[#114B5F]/10 text-[#114B5F] border-[#114B5F]/30',
    
    // Ticket status
    open: 'bg-[#114B5F]/10 text-[#114B5F] border-[#114B5F]/30',
    in_progress: 'bg-[#D89C42]/10 text-[#b8822f] border-[#D89C42]/30',
    waiting_response: 'bg-orange-50 text-orange-700 border-orange-200/50',
    resolved: 'bg-[#42C0B9]/10 text-[#2e9a94] border-[#42C0B9]/30',
    closed: 'bg-gray-50 text-gray-600 border-gray-200/50',
    
    // Plans
    free: 'bg-gray-50 text-gray-600 border-gray-200/50',
    per_use: 'bg-[#114B5F]/10 text-[#114B5F] border-[#114B5F]/30',
    basic: 'bg-[#42C0B9]/10 text-[#2e9a94] border-[#42C0B9]/30',
    pro: 'bg-[#114B5F]/15 text-[#0d3a47] border-[#114B5F]/40',
    agency: 'bg-[#D89C42]/10 text-[#b8822f] border-[#D89C42]/30',
    enterprise: 'bg-[#114B5F]/20 text-[#0d3a47] border-[#114B5F]/50',
    
    // Priority
    low: 'bg-gray-50 text-gray-600 border-gray-200/50',
    medium: 'bg-[#114B5F]/10 text-[#114B5F] border-[#114B5F]/30',
    high: 'bg-[#D89C42]/10 text-[#b8822f] border-[#D89C42]/30',
    urgent: 'bg-red-50 text-red-700 border-red-200/50',
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium text-xs px-2 py-0.5",
        statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-200/50'
      )}
    >
      {t(status) || status}
    </Badge>
  );
}