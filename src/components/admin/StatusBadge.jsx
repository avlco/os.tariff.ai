import React from 'react';
import { useLanguage } from './LanguageContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, type = 'status' }) {
  const { t } = useLanguage();

  const statusStyles = {
    // User/Report status
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    review: 'bg-blue-100 text-blue-700 border-blue-200',
    
    // Ticket status
    open: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    waiting_response: 'bg-orange-100 text-orange-700 border-orange-200',
    resolved: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
    
    // Plans
    free: 'bg-gray-100 text-gray-700 border-gray-200',
    per_use: 'bg-blue-100 text-blue-700 border-blue-200',
    basic: 'bg-teal-100 text-teal-700 border-teal-200',
    pro: 'bg-purple-100 text-purple-700 border-purple-200',
    agency: 'bg-amber-100 text-amber-700 border-amber-200',
    enterprise: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    
    // Priority
    low: 'bg-gray-100 text-gray-700 border-gray-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    urgent: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium",
        statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      )}
    >
      {t(status) || status}
    </Badge>
  );
}