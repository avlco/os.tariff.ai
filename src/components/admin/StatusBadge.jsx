import React from 'react';
import { useLanguage } from './LanguageContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, type = 'status' }) {
  const { t } = useLanguage();

  const statusStyles = {
    // User/Report status
    active: 'bg-green-50 text-green-700 border-green-200/50',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200/50',
    suspended: 'bg-red-50 text-red-700 border-red-200/50',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
    completed: 'bg-green-50 text-green-700 border-green-200/50',
    failed: 'bg-red-50 text-red-700 border-red-200/50',
    review: 'bg-blue-50 text-blue-700 border-blue-200/50',
    
    // Ticket status
    open: 'bg-blue-50 text-blue-700 border-blue-200/50',
    in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
    waiting_response: 'bg-orange-50 text-orange-700 border-orange-200/50',
    resolved: 'bg-green-50 text-green-700 border-green-200/50',
    closed: 'bg-gray-50 text-gray-600 border-gray-200/50',
    
    // Plans
    free: 'bg-gray-50 text-gray-600 border-gray-200/50',
    per_use: 'bg-blue-50 text-blue-700 border-blue-200/50',
    basic: 'bg-teal-50 text-teal-700 border-teal-200/50',
    pro: 'bg-purple-50 text-purple-700 border-purple-200/50',
    agency: 'bg-amber-50 text-amber-700 border-amber-200/50',
    enterprise: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
    
    // Priority
    low: 'bg-gray-50 text-gray-600 border-gray-200/50',
    medium: 'bg-blue-50 text-blue-700 border-blue-200/50',
    high: 'bg-orange-50 text-orange-700 border-orange-200/50',
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