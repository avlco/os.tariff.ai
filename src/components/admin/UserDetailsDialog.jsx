import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from './LanguageContext';
import StatusBadge from './StatusBadge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Package, 
  FileText, 
  DollarSign, 
  MessageSquare,
  Calendar,
  Mail,
  Building2,
  Phone,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

export default function UserDetailsDialog({ user, open, onOpenChange }) {
  const { t, theme } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's shipments
  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['userShipments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await base44.functions.invoke('fetchShipments', {});
      const allShipments = response.data || [];
      return allShipments.filter(s => s.created_by === user.email);
    },
    enabled: !!user?.email && open
  });

  // Fetch user's reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['userReports', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await base44.functions.invoke('fetchExternalReports', {});
      const allReports = response.data || [];
      return allReports.filter(r => r.user_email === user.email || r.created_by === user.email);
    },
    enabled: !!user?.email && open
  });

  // Fetch user's payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['userPayments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await base44.functions.invoke('fetchExternalPayments', {});
      const allPayments = response.data || [];
      return allPayments.filter(p => p.user_email === user.email || p.created_by === user.email);
    },
    enabled: !!user?.email && open
  });

  // Fetch user's support tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['userTickets', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await base44.functions.invoke('fetchExternalTickets', {});
      const allTickets = response.data || [];
      return allTickets.filter(t => t.user_email === user.email || t.created_by === user.email);
    },
    enabled: !!user?.email && open
  });

  if (!user) return null;

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-6xl max-h-[90vh] overflow-y-auto",
        theme === 'dark' ? "bg-slate-800 text-white" : ""
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-xl text-white font-bold",
              "bg-gradient-to-br from-[#114B5F] to-[#42C0B9]"
            )}>
              {(user.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className={cn(
                "text-xl font-bold",
                theme === 'dark' ? "text-white" : "text-[#114B5F]"
              )}>{user.full_name || '-'}</h2>
              <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                {user.email}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-5",
            theme === 'dark' ? "bg-slate-700" : ""
          )}>
            <TabsTrigger value="overview">
              <User className="w-4 h-4 mr-2" />
              {t('viewDetails')}
            </TabsTrigger>
            <TabsTrigger value="shipments">
              <Package className="w-4 h-4 mr-2" />
              {t('shipments')} ({shipments.length})
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              {t('reports')} ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="w-4 h-4 mr-2" />
              {t('financial')}
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('communication')} ({tickets.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                <CardHeader>
                  <CardTitle className="text-sm">{t('plan')} & {t('status')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>{t('plan')}</span>
                    <StatusBadge status={user.plan} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>{t('status')}</span>
                    <StatusBadge status={user.status} />
                  </div>
                </CardContent>
              </Card>

              <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                <CardHeader>
                  <CardTitle className="text-sm">{t('reportsUsed')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>{t('thisMonth')}</span>
                    <span className={cn("font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      {user.reports_this_month || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>{t('totalReports')}</span>
                    <span className={cn("font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      {user.total_reports || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                <CardHeader>
                  <CardTitle className="text-sm">פרטי קשר</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className={cn("text-sm", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
                      {user.email}
                    </span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className={cn("text-sm", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
                        {user.phone}
                      </span>
                    </div>
                  )}
                  {user.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className={cn("text-sm", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
                        {user.company}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                <CardHeader>
                  <CardTitle className="text-sm">תאריכים</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className={cn("text-xs", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                        {t('createdAt')}
                      </p>
                      <p className={cn("text-sm font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>
                        {user.created_date ? format(new Date(user.created_date), 'dd/MM/yyyy') : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className={cn("text-xs", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                        {t('lastActive')}
                      </p>
                      <p className={cn("text-sm font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>
                        {user.last_active ? format(new Date(user.last_active), 'dd/MM/yyyy HH:mm') : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Shipments Tab */}
          <TabsContent value="shipments">
            <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
              <CardHeader>
                <CardTitle>{t('shipments')} ({shipments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {shipmentsLoading ? (
                  <p className="text-center py-8">{t('loading')}</p>
                ) : shipments.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">{t('noData')}</p>
                ) : (
                  <div className="space-y-3">
                    {shipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          theme === 'dark' ? "bg-slate-800 border-slate-600" : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={cn("font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>
                              {shipment.shipment_id}
                            </p>
                            <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                              {shipment.description || '-'}
                            </p>
                            <p className={cn("text-xs mt-1", theme === 'dark' ? "text-slate-500" : "text-gray-400")}>
                              {typeof shipment.origin === 'object' ? shipment.origin.country : shipment.origin} → {typeof shipment.destination === 'object' ? shipment.destination.country : shipment.destination}
                            </p>
                          </div>
                          <StatusBadge status={shipment.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
              <CardHeader>
                <CardTitle>{t('reports')} ({reports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <p className="text-center py-8">{t('loading')}</p>
                ) : reports.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">{t('noData')}</p>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          theme === 'dark' ? "bg-slate-800 border-slate-600" : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={cn("font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>
                              {report.product_name}
                            </p>
                            <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                              HS Code: {report.hs_code || '-'}
                            </p>
                            <p className={cn("text-xs mt-1", theme === 'dark' ? "text-slate-500" : "text-gray-400")}>
                              {report.created_date ? format(new Date(report.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                            </p>
                          </div>
                          <StatusBadge status={report.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                  <CardHeader>
                    <CardTitle className="text-sm">סה״כ הכנסות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      ${totalRevenue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                  <CardHeader>
                    <CardTitle className="text-sm">סה״כ תשלומים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      {payments.length}
                    </p>
                  </CardContent>
                </Card>
                <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                  <CardHeader>
                    <CardTitle className="text-sm">תשלום ממוצע</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      ${payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : '0.00'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
                <CardHeader>
                  <CardTitle>היסטוריית תשלומים</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <p className="text-center py-8">{t('loading')}</p>
                  ) : payments.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">{t('noData')}</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className={cn(
                            "p-4 rounded-lg border",
                            theme === 'dark' ? "bg-slate-800 border-slate-600" : "bg-gray-50 border-gray-200"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className={cn("font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>
                                  ${payment.amount} {payment.currency || 'USD'}
                                </p>
                                <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                                  <StatusBadge status={payment.plan} /> • {payment.payment_type}
                                </p>
                                <p className={cn("text-xs mt-1", theme === 'dark' ? "text-slate-500" : "text-gray-400")}>
                                  {payment.created_date ? format(new Date(payment.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={payment.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <Card className={theme === 'dark' ? "bg-slate-700/50 border-slate-600" : ""}>
              <CardHeader>
                <CardTitle>פניות תמיכה ({tickets.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <p className="text-center py-8">{t('loading')}</p>
                ) : tickets.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">{t('noData')}</p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          theme === 'dark' ? "bg-slate-800 border-slate-600" : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={cn("font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>
                              {ticket.subject}
                            </p>
                            <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                              <StatusBadge status={ticket.category} /> • <StatusBadge status={ticket.priority} />
                            </p>
                            <p className={cn("text-xs mt-1", theme === 'dark' ? "text-slate-500" : "text-gray-400")}>
                              {ticket.created_date ? format(new Date(ticket.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                            </p>
                          </div>
                          <StatusBadge status={ticket.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}