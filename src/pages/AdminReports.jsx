import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Download,
  MoreVertical,
  Eye,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function ReportsContent() {
  const { t, theme, isRTL } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalReports', {});
      return response.data || [];
    }
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.hs_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.report_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'report_id',
      label: t('reportId'),
      render: (value) => (
        <span className="font-mono text-sm">{value?.slice(0, 8) || '-'}</span>
      )
    },
    {
      key: 'product_name',
      label: t('productName'),
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#42C0B9]" />
          <span className="font-medium">{value || '-'}</span>
        </div>
      )
    },
    {
      key: 'hs_code',
      label: t('hsCode'),
      render: (value) => (
        <Badge variant="outline" className="font-mono bg-[#114B5F]/10 text-[#114B5F] border-[#114B5F]/20">
          {value || '-'}
        </Badge>
      )
    },
    {
      key: 'confidence_score',
      label: t('confidence'),
      render: (value) => {
        const score = value || 0;
        const color = score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600';
        return (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-12 h-2 rounded-full overflow-hidden",
              theme === 'dark' ? "bg-slate-700" : "bg-gray-200"
            )}>
              <div 
                className={cn(
                  "h-full rounded-full",
                  score >= 90 ? "bg-green-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={cn("font-medium", color)}>{score}%</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: t('status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'user_email',
      label: t('email'),
      render: (value) => (
        <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'created_date',
      label: t('createdAt'),
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'
    },
    {
      key: 'actions',
      label: t('actions'),
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"}>
            <DropdownMenuItem onClick={() => setSelectedReport(row)}>
              <Eye className="w-4 h-4 mr-2" />
              {t('viewReport')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              {t('downloadReport')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminReports" />
      
      <div className={cn(
        "transition-all duration-300",
        collapsed ? (isRTL ? "mr-20" : "ml-20") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('reportManagement')} />
        
        <main className="p-6">
          <Card className={cn(
            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
          )}>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-1 gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-4 h-4",
                      isRTL ? "right-3" : "left-3",
                      theme === 'dark' ? "text-slate-400" : "text-gray-400"
                    )} />
                    <Input
                      placeholder={t('searchReports')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        isRTL ? "pr-10" : "pl-10",
                        theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                      )}
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className={cn(
                      "w-40",
                      theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                    )}>
                      <SelectValue placeholder={t('allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses')}</SelectItem>
                      <SelectItem value="completed">{t('completed')}</SelectItem>
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="failed">{t('failed')}</SelectItem>
                      <SelectItem value="review">{t('review')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className={cn(
                  theme === 'dark' ? "border-slate-600 text-slate-300" : ""
                )}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('export')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns}
                data={filteredReports}
                loading={isLoading}
                onRowClick={setSelectedReport}
              />
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className={cn(
          "max-w-4xl max-h-[90vh] overflow-y-auto",
          theme === 'dark' ? "bg-slate-800 text-white" : ""
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#42C0B9]" />
              {selectedReport?.product_name || t('viewReport')}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className={cn(
                "grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg",
                theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
              )}>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('reportId')}
                  </p>
                  <p className="font-mono font-medium">{selectedReport.report_id?.slice(0, 8) || '-'}</p>
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('status')}
                  </p>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('confidence')}
                  </p>
                  <p className="font-bold text-lg text-[#42C0B9]">{selectedReport.confidence_score || 0}%</p>
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('createdAt')}
                  </p>
                  <p className="font-medium">
                    {selectedReport.created_date ? format(new Date(selectedReport.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                  </p>
                </div>
              </div>

              {/* HS Code */}
              <div className={cn(
                "p-6 rounded-lg border-2 border-dashed",
                theme === 'dark' ? "border-[#42C0B9]/30 bg-[#42C0B9]/5" : "border-[#42C0B9]/30 bg-[#42C0B9]/5"
              )}>
                <p className={cn("text-sm mb-2", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                  {t('hsCode')}
                </p>
                <p className="text-4xl font-bold font-mono text-[#114B5F]">
                  {selectedReport.hs_code || '-'}
                </p>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className={cn(
                  "p-4 rounded-lg",
                  theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
                )}>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    Origin Country
                  </p>
                  <p className="font-medium">{selectedReport.origin_country || '-'}</p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg",
                  theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
                )}>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    Manufacturing Country
                  </p>
                  <p className="font-medium">{selectedReport.manufacturing_country || '-'}</p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg",
                  theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
                )}>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    Destination Country
                  </p>
                  <p className="font-medium">{selectedReport.destination_country || '-'}</p>
                </div>
              </div>

              {/* Classification Reasoning */}
              {selectedReport.classification_reasoning && (
                <div>
                  <h4 className="font-semibold mb-2">Classification Reasoning</h4>
                  <p className={cn(
                    "p-4 rounded-lg",
                    theme === 'dark' ? "bg-slate-700 text-slate-300" : "bg-gray-50 text-gray-700"
                  )}>
                    {selectedReport.classification_reasoning}
                  </p>
                </div>
              )}

              {/* Product Characteristics */}
              {selectedReport.product_characteristics?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Product Characteristics</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedReport.product_characteristics.map((char, idx) => (
                      <li key={idx} className={theme === 'dark' ? "text-slate-300" : "text-gray-700"}>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tariff Info */}
              {selectedReport.tariff_info && (
                <div>
                  <h4 className="font-semibold mb-2">Tariff Information</h4>
                  <p className={cn(
                    "p-4 rounded-lg",
                    theme === 'dark' ? "bg-slate-700 text-slate-300" : "bg-gray-50 text-gray-700"
                  )}>
                    {selectedReport.tariff_info}
                  </p>
                </div>
              )}

              {/* Alternative Codes */}
              {selectedReport.alternative_codes?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Alternative Classifications</h4>
                  <div className="space-y-2">
                    {selectedReport.alternative_codes.map((alt, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg flex items-start gap-3",
                          theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
                        )}
                      >
                        <Badge variant="outline" className="font-mono shrink-0">
                          {alt.code}
                        </Badge>
                        <p className={theme === 'dark' ? "text-slate-300" : "text-gray-600"}>
                          {alt.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Sources */}
              {selectedReport.official_sources?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Official Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.official_sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
                          "bg-[#114B5F]/10 text-[#114B5F] hover:bg-[#114B5F]/20"
                        )}
                      >
                        {source.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminReports() {
  return (
    <LanguageProvider>
      <ReportsContent />
    </LanguageProvider>
  );
}