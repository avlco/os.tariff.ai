import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import { cn } from '@/lib/utils';
import { 
  Eye,
  Users,
  Clock,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function AnalyticsContent() {
  const { t, theme, isRTL } = useLanguage();

  const [timeRange, setTimeRange] = useState('thisWeek');

  const { data: events = [] } = useQuery({
    queryKey: ['analyticsEvents'],
    queryFn: () => base44.entities.AnalyticsEvent.list()
  });

  // Traffic data
  const trafficData = [
    { name: 'Sun', views: 1200, sessions: 800 },
    { name: 'Mon', views: 1900, sessions: 1200 },
    { name: 'Tue', views: 1500, sessions: 1000 },
    { name: 'Wed', views: 2500, sessions: 1600 },
    { name: 'Thu', views: 2200, sessions: 1400 },
    { name: 'Fri', views: 1800, sessions: 1100 },
    { name: 'Sat', views: 800, sessions: 500 },
  ];

  // Device breakdown
  const deviceData = [
    { name: 'Desktop', value: 55, color: '#114B5F' },
    { name: 'Mobile', value: 35, color: '#42C0B9' },
    { name: 'Tablet', value: 10, color: '#D89C42' },
  ];

  // Top pages
  const topPages = [
    { page: 'Dashboard', views: 4500, percentage: 30 },
    { page: 'Create Report', views: 3200, percentage: 22 },
    { page: 'Reports', views: 2800, percentage: 19 },
    { page: 'Profile', views: 2100, percentage: 14 },
    { page: 'Support', views: 1400, percentage: 10 },
  ];

  // Countries
  const countryData = [
    { country: 'Israel', users: 4500, flag: '🇮🇱' },
    { country: 'United States', users: 2100, flag: '🇺🇸' },
    { country: 'United Kingdom', users: 1200, flag: '🇬🇧' },
    { country: 'Germany', users: 800, flag: '🇩🇪' },
    { country: 'France', users: 600, flag: '🇫🇷' },
  ];

  // Traffic sources
  const sourceData = [
    { name: 'Direct', value: 40 },
    { name: 'Organic', value: 30 },
    { name: 'Referral', value: 20 },
    { name: 'Social', value: 10 },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminAnalytics" />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        isRTL ? "mr-16" : "ml-16"
      )}>
        <AdminHeader title={t('analyticsTitle')} />
        
        <main className={cn(
          "p-8",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50",
          "min-h-screen"
        )}>
          {/* Time Range Filter */}
          <div className="flex justify-end mb-6">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className={cn(
                "w-40",
                theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : ""
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t('today')}</SelectItem>
                <SelectItem value="yesterday">{t('yesterday')}</SelectItem>
                <SelectItem value="thisWeek">{t('thisWeek')}</SelectItem>
                <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
                <SelectItem value="lastMonth">{t('lastMonth')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title={t('pageViews')}
              value="12,345"
              icon={Eye}
              trend="up"
              trendValue="+15%"
              color="navy"
            />
            <StatsCard
              title={t('sessions')}
              value="8,234"
              icon={Users}
              trend="up"
              trendValue="+12%"
              color="teal"
            />
            <StatsCard
              title={t('conversionRate')}
              value="4.8%"
              icon={TrendingUp}
              trend="up"
              trendValue="+2.1%"
              color="gold"
            />
            <StatsCard
              title={t('avgSessionDuration')}
              value="3m 42s"
              icon={Clock}
              trend="down"
              trendValue="-8%"
              color="navy"
            />
          </div>

          {/* Main Chart */}
          <Card className={cn(
            "mb-8",
            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-lg",
                theme === 'dark' ? "text-white" : "text-[#114B5F]"
              )}>
                {t('pageViews')} & {t('sessions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#114B5F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#114B5F" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
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
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#114B5F" 
                    fillOpacity={1} 
                    fill="url(#colorViews)"
                    name={t('pageViews')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#42C0B9" 
                    fillOpacity={1} 
                    fill="url(#colorSessions)"
                    name={t('sessions')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Breakdown */}
            <Card className={cn(
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('deviceBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {deviceData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={cn(
                        "text-sm",
                        theme === 'dark' ? "text-slate-300" : "text-gray-600"
                      )}>
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className={cn(
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('topPages')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPages.map((page, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className={theme === 'dark' ? "text-slate-300" : "text-gray-700"}>
                          {page.page}
                        </span>
                        <span className={cn(
                          "text-sm",
                          theme === 'dark' ? "text-slate-400" : "text-gray-500"
                        )}>
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                      <div className={cn(
                        "w-full h-2 rounded-full overflow-hidden",
                        theme === 'dark' ? "bg-slate-700" : "bg-gray-200"
                      )}>
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#114B5F] to-[#42C0B9]"
                          style={{ width: `${page.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Users by Country */}
            <Card className={cn(
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  theme === 'dark' ? "text-white" : "text-[#114B5F]"
                )}>
                  {t('usersByCountry')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countryData.map((country, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{country.flag}</span>
                        <span className={theme === 'dark' ? "text-slate-300" : "text-gray-700"}>
                          {country.country}
                        </span>
                      </div>
                      <span className={cn(
                        "font-medium",
                        theme === 'dark' ? "text-white" : "text-[#114B5F]"
                      )}>
                        {country.users.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Sources */}
          <Card className={cn(
            "mt-6",
            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-lg",
                theme === 'dark' ? "text-white" : "text-[#114B5F]"
              )}>
                {t('trafficSources')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                  <XAxis type="number" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                  <YAxis dataKey="name" type="category" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#42C0B9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <LanguageProvider>
      <AnalyticsContent />
    </LanguageProvider>
  );
}