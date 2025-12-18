import React from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function DataTable({ columns, data, loading, onRowClick }) {
  const { theme, isRTL, t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn(
        "text-center py-12",
        theme === 'dark' ? "text-slate-400" : "text-gray-500"
      )}>
        {t('noData')}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      theme === 'dark' ? "border-slate-700" : "border-gray-200"
    )}>
      <Table>
        <TableHeader>
          <TableRow className={theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-gray-50"}>
            {columns.map((col) => (
              <TableHead 
                key={col.key} 
                className={cn(
                  theme === 'dark' ? "text-slate-300" : "text-gray-600",
                  isRTL && "text-right"
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow 
              key={row.id || idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                "cursor-pointer transition-colors",
                theme === 'dark' 
                  ? "hover:bg-slate-800 border-slate-700" 
                  : "hover:bg-gray-50"
              )}
            >
              {columns.map((col) => (
                <TableCell 
                  key={col.key}
                  className={cn(
                    theme === 'dark' ? "text-slate-300" : "text-gray-700",
                    isRTL && "text-right"
                  )}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}