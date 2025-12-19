import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Info,
  XCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CSVPreviewDialog({ 
  open, 
  onClose, 
  previewData,
  onConfirmImport 
}) {
  const { theme, t } = useLanguage();
  const [duplicateAction, setDuplicateAction] = useState('update'); // 'update', 'skip', 'create_new'

  if (!previewData) return null;

  const { rows, existingCountries } = previewData;
  
  // סיווג שורות לפי סטטוס
  const validRows = rows.filter(r => r.status === 'valid');
  const errorRows = rows.filter(r => r.status === 'error');
  const duplicateRows = rows.filter(r => r.status === 'duplicate');
  const newRows = rows.filter(r => r.status === 'new');

  const getStatusBadge = (status) => {
    const badges = {
      valid: <Badge className="bg-green-500/10 text-green-700 border-green-500/30">תקין</Badge>,
      error: <Badge className="bg-red-500/10 text-red-700 border-red-500/30">שגיאה</Badge>,
      duplicate: <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">כפילות</Badge>,
      new: <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">חדש</Badge>,
    };
    return badges[status] || null;
  };

  const handleConfirm = () => {
    onConfirmImport(duplicateAction);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-6xl max-h-[90vh] overflow-hidden flex flex-col",
        theme === 'dark' ? "bg-slate-800 text-white" : ""
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--primary-teal)]" />
            תצוגה מקדימה של ייבוא CSV
          </DialogTitle>
        </DialogHeader>

        {/* סיכום */}
        <div className="grid grid-cols-4 gap-3 py-4">
          <div className={cn(
            "p-3 rounded-lg border",
            theme === 'dark' ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium">שורות תקינות</span>
            </div>
            <div className="text-2xl font-bold">{validRows.length}</div>
          </div>

          <div className={cn(
            "p-3 rounded-lg border",
            theme === 'dark' ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium">כפילויות</span>
            </div>
            <div className="text-2xl font-bold">{duplicateRows.length}</div>
          </div>

          <div className={cn(
            "p-3 rounded-lg border",
            theme === 'dark' ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium">רשומות חדשות</span>
            </div>
            <div className="text-2xl font-bold">{newRows.length}</div>
          </div>

          <div className={cn(
            "p-3 rounded-lg border",
            theme === 'dark' ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium">שגיאות</span>
            </div>
            <div className="text-2xl font-bold">{errorRows.length}</div>
          </div>
        </div>

        {/* בחירת פעולה לכפילויות */}
        {duplicateRows.length > 0 && (
          <div className={cn(
            "p-4 rounded-lg border mb-4",
            theme === 'dark' ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"
          )}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm mb-2">נמצאו {duplicateRows.length} כפילויות</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">איך לטפל בכפילויות?</span>
                  <Select value={duplicateAction} onValueChange={setDuplicateAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update">עדכן קיימות (דריסה)</SelectItem>
                      <SelectItem value="skip">דלג על כפילויות</SelectItem>
                      <SelectItem value="create_new">צור כפילויות חדשות</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* טבלת תצוגה מקדימה */}
        <ScrollArea className="flex-1 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className={theme === 'dark' ? "border-slate-700" : ""}>
                <TableHead className="w-12">שורה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>מדינה</TableHead>
                <TableHead>מבנה HS Code</TableHead>
                <TableHead>קישורים</TableHead>
                <TableHead>שגיאות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow 
                  key={idx}
                  className={cn(
                    theme === 'dark' ? "border-slate-700" : "",
                    row.status === 'error' && (theme === 'dark' ? "bg-red-900/10" : "bg-red-50")
                  )}
                >
                  <TableCell className="text-xs text-gray-500">{row.rowNumber}</TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                  <TableCell className="font-medium">{row.data.country}</TableCell>
                  <TableCell className="text-sm">{row.data.hs_code_digit_structure || '-'}</TableCell>
                  <TableCell className="text-xs">
                    {row.data.custom_links?.length > 0 && (
                      <div className="text-gray-600">
                        {row.data.custom_links.length} קישורים
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.errors?.length > 0 && (
                      <div className="text-xs text-red-600 space-y-0.5">
                        {row.errors.map((err, i) => (
                          <div key={i}>• {err}</div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* כפתורי פעולה */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {errorRows.length > 0 ? (
              <span className="text-red-600 font-medium">
                ⚠️ שורות עם שגיאות לא ייובאו
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                ✓ כל השורות תקינות לייבוא
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              onClick={handleConfirm}
              style={{
                backgroundColor: 'var(--primary-teal)',
                color: 'white'
              }}
              className="hover:opacity-90"
            >
              אשר ייבוא ({validRows.length + (duplicateAction !== 'skip' ? duplicateRows.length : 0)} רשומות)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}