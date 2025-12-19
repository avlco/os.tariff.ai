import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import { 
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format } from 'date-fns';

function FinancialContent() {
  const { t, theme, isRTL } = useLanguage();

  const [timeRange, setTimeRange] = useState('thisMonth');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalPayments', {});
      return response.data || [];
    }
  });

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const monthlyRevenue = payments
    .filter(p => {
      const date = new Date(p.created_date);
      const now = new Date();
      return p.status === 'completed' && 
        date.getMonth() === now.getMonth() && 
        date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const avgOrderValue = payments.length > 0 
    ? totalRevenue / payments.filter(p => p.status === 'completed').length 
    : 0;

  // Revenue by plan
  const revenueByPlan = [
    { name: 'Free', value: 0, color: '#9CA3AF' },
    { name: 'Per Use', value: payments.filter(p => p.plan === 'per_use' && p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0), color: '#3B82F6' },
    { name: 'Basic', value: payments.filter(p => p.plan === 'basic' && p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0), color: '#42C0B9' },
    { name: 'Pro', value: payments.filter(p => p.plan === 'pro' && p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0), color: '#8B5CF6' },
    { name: 'Agency', value: payments.filter(p => p.plan === 'agency' && p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0), color: '#D89C42' },
    { name: 'Enterprise', value: payments.filter(p => p.plan === 'enterprise' && p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0), color: '#114B5F' },
  ].filter(item => item.value > 0);

  // Monthly trend data
  const revenueData = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 15200 },
    { month: 'Mar', revenue: 18700 },
    { month: 'Apr', revenue: 16800 },
    { month: 'May', revenue: 21300 },
    { month: 'Jun', revenue: 24500 },
    { month: 'Jul', revenue: 22800 },
  ];

  const columns = [
    {
      key: 'transaction_id',
      label: t('ticketId'),
      render: (value) => (
        <span className="font-mono text-sm">{value?.slice(0, 8) || '-'}</span>
      )
    },
    {
      key: 'user_email',
      label: t('email')
    },
    {
      key: 'plan',
      label: t('plan'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <span className="font-bold text-[#114B5F]">${(value || 0).toFixed(2)}</span>
      )
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

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminFinancial" />
      
      <div className={cn(
        "transition-all duration-300",
        collapsed ? (isRTL ? "mr-20" : "ml-20") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('financialOverview')} />
        
        <main className="p-6">
          {/* Time Range Filter */}
          <div className="flex justify-between items-center mb-6">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className={cn(
                "w-40",
                theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : ""
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">{t('thisWeek')}</SelectItem>
                <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
                <SelectItem value="lastMonth">{t('lastMonth')}</SelectItem>
                <SelectItem value="custom">{t('custom')}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className={cn(
              theme === 'dark' ? "border-slate-600 text-slate-300" : ""
            )}>
              <Download className="w-4 h-4 mr-2" />
              {t('export')}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title={t('totalRevenue')}
              value={`$${totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend="up"
              trendValue="+23%"
              color="navy"
            />
            <StatsCard
              title={t('monthlyRecurring')}
              value={`$${monthlyRevenue.toLocaleString()}`}
              icon={TrendingUp}
              trend="up"
              trendValue="+18%"
              color="teal"
            />
            <StatsCard
              title={t('averageOrderValue')}
              value={`$${avgOrderValue.toFixed(2)}`}
              icon={Receipt}
              trend="up"
              trendValue="+5%"
              color="gold"
            />
            <StatsCard
              title={t('transactions')}
              value={payments.filter(p => p.status === 'completed').length}
              icon={CreditCard}
              trend="up"
              trendValue="+32%"
              color="green"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Trend */}
            <Card className={cn(
              "lg:col-span-2",
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#42C0B9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#42C0B9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#42C0B9" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Plan */}
            <Card className={cn(
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('revenueByPlan')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByPlan.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={revenueByPlan}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {revenueByPlan.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {revenueByPlan.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className={cn(
                            "text-sm",
                            theme === 'dark' ? "text-slate-300" : "text-gray-600"
                          )}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={cn(
                    "text-center py-12",
                    theme === 'dark' ? "text-slate-400" : "text-gray-500"
                  )}>
                    {t('noData')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { plan: 'free', price: '$0', limit: '3/month' },
              { plan: 'per_use', price: '$1.99', limit: 'Per report' },
              { plan: 'basic', price: '$9.99', limit: '15/month' },
              { plan: 'pro', price: '$19.99', limit: '50/month' },
              { plan: 'agency', price: '$49.99', limit: '200/month' },
              { plan: 'enterprise', price: 'Custom', limit: 'Unlimited' },
            ].map((item, idx) => (
              <Card key={idx} className={cn(
                theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
              )}>
                <CardContent className="pt-4">
                  <StatusBadge status={item.plan} />
                  <p className={cn(
                    "text-2xl font-bold mt-2",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>
                    {item.price}
                  </p>
                  <p className={cn(
                    "text-sm",
                    theme === 'dark' ? "text-slate-400" : "text-gray-500"
                  )}>
                    {item.limit}
                  </p>
                  <p className={cn(
                    "text-sm font-medium mt-2",
                    theme === 'dark' ? "text-slate-300" : "text-gray-600"
                  )}>
                    {payments.filter(p => p.plan === item.plan && p.status === 'completed').length} subscribers
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Transactions */}
          <Card className={cn(
            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-lg",
                theme === 'dark' ? "text-white" : "text-[#114B5F]"
              )}>
                {t('recentTransactions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns}
                data={payments.slice(0, 10)}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function AdminFinancial() {
  return (
    <LanguageProvider>
      <FinancialContent />
    </LanguageProvider>
  );
}