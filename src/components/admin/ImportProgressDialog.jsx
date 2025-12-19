import React from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImportProgressDialog({ 
  open, 
  onClose, 
  progress, 
  total, 
  status,
  errors,
  successCount 
}) {
  const { theme } = useLanguage();
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
  const isComplete = status === 'completed' || status === 'error';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-md",
        theme === 'dark' ? "bg-slate-800 text-white" : ""
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === 'importing' && <Loader2 className="w-5 h-5 animate-spin text-[var(--primary-teal)]" />}
            {status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
            ייבוא נתונים מ-CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {status === 'importing' && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>מייבא רשומות...</span>
                  <span className="font-medium">{progress} / {total}</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-center text-gray-500">{percentage}%</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                אנא המתן, מייבא נתונים...
              </div>
            </>
          )}
          
          {status === 'completed' && (
            <div className="space-y-3">
              <div className={cn(
                "p-4 rounded-lg border",
                theme === 'dark' ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
              )}>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">הייבוא הושלם בהצלחה!</span>
                </div>
                <p className="text-sm">
                  {successCount} מתוך {total} רשומות יובאו בהצלחה
                </p>
              </div>
              
              {errors.length > 0 && (
                <div className={cn(
                  "p-4 rounded-lg border",
                  theme === 'dark' ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
                )}>
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{errors.length} שגיאות</span>
                  </div>
                  <div className="text-xs max-h-32 overflow-y-auto space-y-1">
                    {errors.map((error, idx) => (
                      <div key={idx} className="text-gray-600 dark:text-gray-400">
                        שורה {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className={cn(
              "p-4 rounded-lg border",
              theme === 'dark' ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">שגיאה בייבוא</span>
              </div>
              <p className="text-sm mt-2">
                הייבוא נכשל. אנא בדוק את הקובץ ונסה שוב.
              </p>
            </div>
          )}
          
          {isComplete && (
            <Button 
              onClick={onClose} 
              className="w-full bg-[var(--primary-teal)] hover:bg-[var(--teal-dark)]"
            >
              סגור
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}