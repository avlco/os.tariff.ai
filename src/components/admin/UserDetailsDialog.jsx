import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from './LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import DataTable from './DataTable';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  User, 
  FileText, 
  MessageSquare, 
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function UserDetailsDialog({ user, open, onClose }) {
  const { t, theme, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user reports
  const { data: userReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['userReports', user?.user_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalReports', {});
      const reports = response.data || [];
      return reports.filter(r => r.user_id === user?.user_id || r.user_id === user?.id || r.user_id === user?.email);
    },
    enabled: !!user && activeTab === 'reports'
  });

  // Fetch user tickets
  const { data: userTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['userTickets', user?.user_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalTickets', {});
      const tickets = response.data || [];
      return tickets.filter(t => t.user_id === user?.user_id);
    },
    enabled: !!user && activeTab === 'communication'
  });

  // Fetch user payments
  const { data: userPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['userPayments', user?.user_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalPayments', {});
      const payments = response.data || [];
      return payments.filter(p => p.user_id === user?.user_id);
    },
    enabled: !!user && activeTab === 'financial'
  });

  if (!user) return null;

  const reportColumns = [
    {
      key: 'product_name',
      label: t('productName'),
      render: (value) => (
        <div className="max-w-xs truncate">{value || '-'}</div>
      )
    },
    {
      key: 'hs_code',
      label: t('hsCode'),
      render: (value) => <span className="font-mono">{value || '-'}</span>
    },
    {
      key: 'confidence_score',
      label: t('confidence'),
      render: (value) => value ? `${Math.round(value)}%` : '-'
    },
    {
      key: 'status',
      label: t('status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'created_date',
      label: t('createdAt'),
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'
    }
  ];

  const ticketColumns = [
    {
      key: 'subject',
      label: t('subject')
    },
    {
      key: 'category',
      label: t('category'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'priority',
      label: t('priority'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'status',
      label: t('status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'created_date',
      label: t('createdAt'),
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
    }
  ];

  const paymentColumns = [
    {
      key: 'amount',
      label: t('totalRevenue'),
      render: (value) => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      key: 'plan',
      label: t('plan'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'status',
      label: t('status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      render: (value) => value || '-'
    },
    {
      key: 'created_date',
      label: t('createdAt'),
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
    }
  ];

  const totalRevenue = userPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-6xl max-h-[90vh] overflow-y-auto",
        theme === 'dark' ? "bg-slate-800 text-white" : ""
      )}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('viewDetails')}</DialogTitle>
        </DialogHeader>

        {/* User Header */}
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-lg",
          theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
        )}>
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold",
            "bg-gradient-to-br from-[#114B5F] to-[#42C0B9]"
          )}>
            {(user.full_name || user.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{user.full_name || '-'}</h3>
            <p className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
              {user.email}
            </p>
            {user.company && (
              <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                {user.company}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <StatusBadge status={user.plan} />
            <StatusBadge status={user.status} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-4",
            theme === 'dark' ? "bg-slate-700" : ""
          )}>
            <TabsTrigger value="overview">
              <User className="w-4 h-4 mr-2" />
              {t('dashboard')}
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              {t('reports')}
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('communication')}
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="w-4 h-4 mr-2" />
              {t('financial')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('totalReports')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{user.total_reports || 0}</p>
                </CardContent>
              </Card>

              <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('reportsUsed')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{user.reports_this_month || 0}</p>
                </CardContent>
              </Card>

              <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('totalRevenue')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('pendingTickets')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {userTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
              <CardHeader>
                <CardTitle>{t('userManagement')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      {t('email')}
                    </p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      Phone
                    </p>
                    <p className="font-medium">{user.phone || '-'}</p>
                  </div>
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      {t('createdAt')}
                    </p>
                    <p className="font-medium">
                      {user.created_date ? format(new Date(user.created_date), 'dd/MM/yyyy') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      {t('lastActive')}
                    </p>
                    <p className="font-medium">
                      {user.last_active ? format(new Date(user.last_active), 'dd/MM/yyyy HH:mm') : '-'}
                    </p>
                  </div>
                  {user.subscription_start && (
                    <div>
                      <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                        Subscription Start
                      </p>
                      <p className="font-medium">
                        {format(new Date(user.subscription_start), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                  {user.subscription_end && (
                    <div>
                      <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                        Subscription End
                      </p>
                      <p className="font-medium">
                        {format(new Date(user.subscription_end), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
              <CardHeader>
                <CardTitle>{t('reports')} ({userReports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={reportColumns}
                  data={userReports}
                  loading={reportsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
              <CardHeader>
                <CardTitle>{t('supportCenter')} ({userTickets.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={ticketColumns}
                  data={userTickets}
                  loading={ticketsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('totalRevenue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('transactions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{userPayments.length}</p>
                  </CardContent>
                </Card>

                <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('plan')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatusBadge status={user.plan} />
                  </CardContent>
                </Card>
              </div>

              <Card className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}>
                <CardHeader>
                  <CardTitle>{t('recentTransactions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable 
                    columns={paymentColumns}
                    data={userPayments}
                    loading={paymentsLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}