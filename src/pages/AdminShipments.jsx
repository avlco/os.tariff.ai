import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';
import { Search, Package, ExternalLink, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import StatusBadge from '@/components/admin/StatusBadge';

function ShipmentsContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchShipments', {});
      return response.data || [];
    }
  });

  const filteredShipments = shipments.filter(shipment => 
    shipment.shipment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setDetailsOpen(true);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminShipments" collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? (isRTL ? "mr-16" : "ml-16") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('shipments')} />
        
        <main className={cn(
          "p-8",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50",
          "min-h-screen"
        )}>
          <Card className={cn(
            "border shadow-sm",
            theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-4 h-4",
                    isRTL ? "right-3" : "left-3",
                    theme === 'dark' ? "text-slate-400" : "text-gray-400"
                  )} />
                  <Input
                    placeholder="חפש לפי מזהה משלוח, לקוח, מקור או יעד..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      isRTL ? "pr-10" : "pl-10",
                      theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <Package className="w-4 h-4 mr-2" />
                    {filteredShipments.length} משלוחים
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={theme === 'dark' ? "border-slate-700/50" : "border-gray-200/50"}>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>מזהה משלוח</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>לקוח</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>סטטוס</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>מקור</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>יעד</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>HS Code</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>ערך כולל</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>מעקב</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          טוען משלוחים...
                        </TableCell>
                      </TableRow>
                    ) : filteredShipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          לא נמצאו משלוחים
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <TableRow 
                          key={shipment.id}
                          className={cn(
                            theme === 'dark' ? "border-slate-700/50 hover:bg-slate-800/50" : "border-gray-200/50 hover:bg-gray-50",
                            "transition-colors"
                          )}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-[var(--primary-teal)]" />
                              {shipment.shipment_id}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{shipment.customer_id || '-'}</TableCell>
                          <TableCell>
                            <StatusBadge status={shipment.status} />
                          </TableCell>
                          <TableCell className="text-sm">{shipment.origin || '-'}</TableCell>
                          <TableCell className="text-sm">{shipment.destination || '-'}</TableCell>
                          <TableCell className="text-sm font-mono">{shipment.hs_code || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {shipment.total_product_value ? 
                              `${shipment.total_product_value.toLocaleString()} ${shipment.currency || 'USD'}` : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {shipment.tracking_number ? (
                              <div className="flex flex-col gap-1">
                                <span className="font-mono text-xs">{shipment.tracking_number}</span>
                                {shipment.carrier_name && (
                                  <span className="text-xs text-gray-500">{shipment.carrier_name}</span>
                                )}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(shipment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={cn(
          "max-w-4xl max-h-[90vh] overflow-y-auto",
          theme === 'dark' ? "bg-slate-800 text-white" : ""
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--primary-teal)]" />
              פרטי משלוח: {selectedShipment?.shipment_id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedShipment && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">מזהה לקוח</label>
                  <p className="text-sm mt-1">{selectedShipment.customer_id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">סטטוס</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedShipment.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">מקור</label>
                  <p className="text-sm mt-1">{selectedShipment.origin || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">יעד</label>
                  <p className="text-sm mt-1">{selectedShipment.destination || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">מדינת ייצור</label>
                  <p className="text-sm mt-1">{selectedShipment.manufacture_country || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Incoterms</label>
                  <p className="text-sm mt-1">{selectedShipment.incoterms || '-'}</p>
                </div>
              </div>

              {/* Description */}
              {selectedShipment.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">תיאור</label>
                  <p className="text-sm mt-1">{selectedShipment.description}</p>
                </div>
              )}

              {/* Financial Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ערך מוצרים</label>
                  <p className="text-sm mt-1 font-semibold">
                    {selectedShipment.total_product_value?.toLocaleString()} {selectedShipment.currency || 'USD'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">משקל כולל</label>
                  <p className="text-sm mt-1">{selectedShipment.total_weight || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">נפח כולל</label>
                  <p className="text-sm mt-1">{selectedShipment.total_volume || '-'}</p>
                </div>
              </div>

              {/* Classification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">HS Code</label>
                  <p className="text-sm mt-1 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {selectedShipment.hs_code || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">תיאור תעריף</label>
                  <p className="text-sm mt-1">{selectedShipment.tariff_description || '-'}</p>
                </div>
              </div>

              {/* Classification Reasoning */}
              {selectedShipment.classification_reasoning && (
                <div>
                  <label className="text-sm font-medium text-gray-500">נימוק סיווג</label>
                  <p className="text-sm mt-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    {selectedShipment.classification_reasoning}
                  </p>
                </div>
              )}

              {/* Product Characteristics */}
              {selectedShipment.product_characteristics?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">מאפייני מוצר</label>
                  <ul className="mt-2 space-y-1">
                    {selectedShipment.product_characteristics.map((char, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-[var(--primary-teal)]">•</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Import Requirements */}
              {selectedShipment.import_requirements?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">דרישות יבוא</label>
                  <ul className="mt-2 space-y-1">
                    {selectedShipment.import_requirements.map((req, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Analysis */}
              {selectedShipment.ai_analysis_summary && (
                <div>
                  <label className="text-sm font-medium text-gray-500">סיכום ניתוח AI</label>
                  <p className="text-sm mt-1 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                    {selectedShipment.ai_analysis_summary}
                  </p>
                </div>
              )}

              {/* Cost Estimates */}
              <div className="grid grid-cols-2 gap-4">
                {selectedShipment.estimated_duties_and_taxes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">אומדן מכס ומיסים</label>
                    <p className="text-sm mt-1 font-semibold text-red-600">
                      {selectedShipment.estimated_duties_and_taxes.toLocaleString()} {selectedShipment.currency || 'USD'}
                    </p>
                  </div>
                )}
                {selectedShipment.estimated_shipping_costs && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">אומדן עלויות משלוח</label>
                    <p className="text-sm mt-1 font-semibold text-blue-600">
                      {selectedShipment.estimated_shipping_costs.toLocaleString()} {selectedShipment.currency || 'USD'}
                    </p>
                  </div>
                )}
              </div>

              {/* Tracking */}
              {(selectedShipment.tracking_number || selectedShipment.carrier_name) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedShipment.tracking_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">מספר מעקב</label>
                      <p className="text-sm mt-1 font-mono">{selectedShipment.tracking_number}</p>
                    </div>
                  )}
                  {selectedShipment.carrier_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">חברת שילוח</label>
                      <p className="text-sm mt-1">{selectedShipment.carrier_name}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              {selectedShipment.uploaded_documents?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">מסמכים מצורפים</label>
                  <div className="mt-2 space-y-2">
                    {selectedShipment.uploaded_documents.map((doc, idx) => (
                      <a 
                        key={idx} 
                        href={doc} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        מסמך {idx + 1}
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

export default function AdminShipments() {
  return (
    <LanguageProvider>
      <ShipmentsContent />
    </LanguageProvider>
  );
}