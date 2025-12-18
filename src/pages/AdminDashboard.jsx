import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

function DashboardContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['appUsers'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalUsers', {});
      return response.data || [];
    }
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalReports', {});
      return response.data || [];
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalPayments', {});
      return response.data || [];
    }
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalTickets', {});
      return response.data || [];
    }
  });

  // Calculate stats
  const activeUsers = users.filter(u => u.status === 'active').length;
  const monthlyRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingTickets = tickets.filter(t => t.status === 'open').length;

  // Mock chart data
  const chartData = [
    { name: 'Sun', reports: 12, revenue: 240 },
    { name: 'Mon', reports: 19, revenue: 380 },
    { name: 'Tue', reports: 15, revenue: 300 },
    { name: 'Wed', reports: 25, revenue: 500 },
    { name: 'Thu', reports: 22, revenue: 440 },
    { name: 'Fri', reports: 18, revenue: 360 },
    { name: 'Sat', reports: 8, revenue: 160 },
  ];

  const recentActivity = [
    ...reports.slice(0, 3).map(r => ({
      type: 'report',
      title: r.product_name,
      time: r.created_date,
      status: r.status
    })),
    ...tickets.slice(0, 2).map(t => ({
      type: 'ticket',
      title: t.subject,
      time: t.created_date,
      status: t.status
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminDashboard" collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "transition-all duration-300",
        collapsed ? (isRTL ? "mr-20" : "ml-20") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('dashboard')} />
        
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title={t('totalUsers')}
              value={users.length}
              icon={Users}
              trend="up"
              trendValue="+12%"
              color="navy"
            />
            <StatsCard
              title={t('activeUsers')}
              value={activeUsers}
              icon={Activity}
              trend="up"
              trendValue="+8%"
              color="teal"
            />
            <StatsCard
              title={t('totalReports')}
              value={reports.length}
              icon={FileText}
              trend="up"
              trendValue="+24%"
              color="gold"
            />
            <StatsCard
              title={t('monthlyRevenue')}
              value={`$${monthlyRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend="up"
              trendValue="+18%"
              color="green"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Reports Chart */}
            <Card className={cn(
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('reportsToday')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#42C0B9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#42C0B9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reports" 
                      stroke="#42C0B9" 
                      fillOpacity={1} 
                      fill="url(#colorReports)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className={cn(
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('monthlyRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D89C42" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D89C42" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#D89C42" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className={cn(
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('quickStats')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#42C0B9]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#42C0B9]" />
                    </div>
                    <span className={theme === 'dark' ? "text-slate-300" : "text-gray-600"}>
                      {t('newUsers')}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xl font-bold",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>
                    {users.filter(u => {
                      const created = new Date(u.created_date);
                      const now = new Date();
                      return created.getMonth() === now.getMonth();
                    }).length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D89C42]/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-[#D89C42]" />
                    </div>
                    <span className={theme === 'dark' ? "text-slate-300" : "text-gray-600"}>
                      {t('pendingTickets')}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xl font-bold",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>
                    {pendingTickets}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#114B5F]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#114B5F]" />
                    </div>
                    <span className={theme === 'dark' ? "text-slate-300" : "text-gray-600"}>
                      {t('reportsToday')}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xl font-bold",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>
                    {reports.filter(r => {
                      const created = new Date(r.created_date);
                      const now = new Date();
                      return created.toDateString() === now.toDateString();
                    }).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className={cn(
              "lg:col-span-2",
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('recentActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
                      {t('noData')}
                    </p>
                  ) : (
                    recentActivity.map((item, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg",
                          theme === 'dark' ? "bg-slate-700/50" : "bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            item.type === 'report' ? "bg-[#42C0B9]/10" : "bg-[#D89C42]/10"
                          )}>
                            {item.type === 'report' ? (
                              <FileText className="w-5 h-5 text-[#42C0B9]" />
                            ) : (
                              <MessageSquare className="w-5 h-5 text-[#D89C42]" />
                            )}
                          </div>
                          <div>
                            <p className={cn(
                              "font-medium",
                              theme === 'dark' ? "text-white" : "text-gray-900"
                            )}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-3 h-3" />
                              <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
                                {item.time ? format(new Date(item.time), 'dd/MM/yyyy HH:mm') : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}