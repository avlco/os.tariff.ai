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
  Tablet,
  FileText,
  UserPlus,
  DollarSign,
  MessageSquare
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import AnalyticsRawDataTable from '@/components/admin/AnalyticsRawDataTable';
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
import { format, subDays } from 'date-fns';

const filterEventsByTimeRange = (events, range) => {
  const now = new Date();
  return events.filter(event => {
    const eventDate = new Date(event.created_date);
    switch (range) {
      case 'today':
        return format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      case 'yesterday':
        return format(eventDate, 'yyyy-MM-dd') === format(subDays(now, 1), 'yyyy-MM-dd');
      case 'thisWeek':
        return eventDate >= subDays(now, 7);
      case 'thisMonth':
        return eventDate >= subDays(now, 30);
      case 'lastMonth':
        return eventDate >= subDays(now, 60);
      default:
        return true;
    }
  });
};

function AnalyticsContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState('thisWeek');
  const [activeTab, setActiveTab] = useState('website');
  const [activeBase44Tab, setActiveBase44Tab] = useState('visual');

  const { data: externalEvents = [], isLoading } = useQuery({
    queryKey: ['externalAnalyticsEvents'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalAnalyticsEvents', {});
      return response.data || [];
    }
  });

  const { data: base44PageViews = [] } = useQuery({
    queryKey: ['base44PageViews'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchBase44PageViews', {});
      return response.data || [];
    }
  });

  const { data: base44UserActions = [] } = useQuery({
    queryKey: ['base44UserActions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchBase44UserActions', {});
      return response.data || [];
    }
  });

  const { data: base44Conversions = [] } = useQuery({
    queryKey: ['base44Conversions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchBase44Conversions', {});
      return response.data || [];
    }
  });

  const filteredExternalEvents = filterEventsByTimeRange(externalEvents, timeRange);
  const filteredPageViews = filterEventsByTimeRange(base44PageViews, timeRange);
  const filteredUserActions = filterEventsByTimeRange(base44UserActions, timeRange);
  const filteredConversions = filterEventsByTimeRange(base44Conversions, timeRange);

  const websiteEvents = filteredExternalEvents.filter(e => e.event_type === 'page_view');
  const pageViews = websiteEvents.length;
  const sessions = new Set(websiteEvents.map(e => e.user_id)).size;

  // Base44 Analytics Stats
  const base44TotalPageViews = filteredPageViews.length;
  const base44UniqueSessions = new Set(filteredPageViews.map(pv => pv.session_id)).size;
  const base44TotalActions = filteredUserActions.length;
  const base44TotalConversions = filteredConversions.length;
  const base44ConversionRate = base44UniqueSessions > 0 ? ((base44TotalConversions / base44UniqueSessions) * 100).toFixed(1) : '0.0';

  // Device breakdown for Base44
  const base44DeviceBreakdown = filteredPageViews.reduce((acc, pv) => {
    const device = pv.device_type || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const base44DeviceData = [
    { name: 'Desktop', value: base44DeviceBreakdown.desktop || 0, color: '#114B5F' },
    { name: 'Mobile', value: base44DeviceBreakdown.mobile || 0, color: '#42C0B9' },
    { name: 'Tablet', value: base44DeviceBreakdown.tablet || 0, color: '#D89C42' },
  ];

  // Top pages for Base44
  const base44TopPages = Object.entries(
    filteredPageViews.reduce((acc, pv) => {
      const page = pv.page_url || 'Unknown';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {})
  ).sort(([, a], [, b]) => b - a).slice(0, 5);

  // Country breakdown for Base44
  const base44TopCountries = Object.entries(
    filteredPageViews.reduce((acc, pv) => {
      const country = pv.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {})
  ).sort(([, a], [, b]) => b - a).slice(0, 5);

  // Daily traffic for Base44
  const base44DailyStats = filteredPageViews.reduce((acc, pv) => {
    const date = format(new Date(pv.created_date), 'EEE');
    if (!acc[date]) {
      acc[date] = { views: 0, sessions: new Set() };
    }
    acc[date].views++;
    acc[date].sessions.add(pv.session_id);
    return acc;
  }, {});

  const base44TrafficChartData = Object.keys(base44DailyStats).map(day => ({
    name: day,
    views: base44DailyStats[day].views,
    sessions: base44DailyStats[day].sessions.size,
  }));

  const appEvents = filteredExternalEvents.filter(e => 
    ['report_created', 'user_signup', 'payment', 'upgrade', 'support_ticket'].includes(e.event_type)
  );

  const appReportCreated = appEvents.filter(e => e.event_type === 'report_created').length;
  const appUserSignups = appEvents.filter(e => e.event_type === 'user_signup').length;
  const appPayments = appEvents.filter(e => e.event_type === 'payment').length;
  const appSupportTickets = appEvents.filter(e => e.event_type === 'support_ticket').length;

  const appChartData = [
    { name: 'Reports', value: appReportCreated, color: '#114B5F' },
    { name: 'Signups', value: appUserSignups, color: '#42C0B9' },
    { name: 'Payments', value: appPayments, color: '#D89C42' },
    { name: 'Tickets', value: appSupportTickets, color: '#6B7280' },
  ];

  const dailyWebsiteStats = websiteEvents.reduce((acc, event) => {
    const date = format(new Date(event.created_date), 'EEE');
    if (!acc[date]) {
      acc[date] = { views: 0, sessions: 0, uniqueUsers: new Set() };
    }
    acc[date].views++;
    acc[date].uniqueUsers.add(event.user_id);
    acc[date].sessions = acc[date].uniqueUsers.size;
    return acc;
  }, {});

  const websiteTrafficChartData = Object.keys(dailyWebsiteStats).map(day => ({
    name: day,
    views: dailyWebsiteStats[day].views,
    sessions: dailyWebsiteStats[day].sessions,
  }));

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
      <AdminSidebar currentPage="AdminAnalytics" collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? (isRTL ? "mr-16" : "ml-16") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('analyticsTitle')} />
        
        <main className={cn(
          "p-8",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50",
          "min-h-screen"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className={cn(
                "grid w-[400px] grid-cols-2",
                theme === 'dark' ? "bg-slate-800" : ""
              )}>
                <TabsTrigger value="website">
                  <Globe className="w-4 h-4 mr-2" />
                  Website Analytics
                </TabsTrigger>
                <TabsTrigger value="app">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  App Analytics
                </TabsTrigger>
              </TabsList>

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

            <TabsContent value="website">
              <Tabs defaultValue="base44" className="w-full">
                <TabsList className={cn(
                  "grid w-[400px] grid-cols-2 mb-6",
                  theme === 'dark' ? "bg-slate-800" : ""
                )}>
                  <TabsTrigger value="base44">
                    Base44 Analytics
                  </TabsTrigger>
                  <TabsTrigger value="google">
                    <Globe className="w-4 h-4 mr-2" />
                    Google Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="base44">
                  <Tabs value={activeBase44Tab} onValueChange={setActiveBase44Tab} className="w-full">
                    <TabsList className={cn(
                      "grid w-[400px] grid-cols-2 mb-6",
                      theme === 'dark' ? "bg-slate-800" : ""
                    )}>
                      <TabsTrigger value="visual">
                        {t('visualAnalytics')}
                      </TabsTrigger>
                      <TabsTrigger value="raw-data">
                        {t('rawData')}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="visual">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                      title={t('pageViews')}
                      value={base44TotalPageViews.toLocaleString()}
                      icon={Eye}
                      trend="up"
                      trendValue="+15%"
                      color="navy"
                    />
                    <StatsCard
                      title={t('sessions')}
                      value={base44UniqueSessions.toLocaleString()}
                      icon={Users}
                      trend="up"
                      trendValue="+12%"
                      color="teal"
                    />
                    <StatsCard
                      title={t('conversionRate')}
                      value={`${base44ConversionRate}%`}
                      icon={TrendingUp}
                      trend="up"
                      trendValue="+2.1%"
                      color="gold"
                    />
                    <StatsCard
                      title="פעולות משתמש"
                      value={base44TotalActions.toLocaleString()}
                      icon={Clock}
                      trend="up"
                      trendValue="+8%"
                      color="navy"
                    />
                  </div>

              {/* Main Chart */}
              <Card className={cn(
                "mb-8 border",
                theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-base font-semibold",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    {t('pageViews')} & {t('sessions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={base44TrafficChartData.length > 0 ? base44TrafficChartData : trafficData}>
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
                  "border",
                  theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
                )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-base font-semibold",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  {t('deviceBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={base44DeviceData.filter(d => d.value > 0).length > 0 ? base44DeviceData : deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(base44DeviceData.filter(d => d.value > 0).length > 0 ? base44DeviceData : deviceData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {(base44DeviceData.filter(d => d.value > 0).length > 0 ? base44DeviceData : deviceData).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={cn(
                        "text-sm",
                        theme === 'dark' ? "text-slate-300" : "text-gray-600"
                      )}>
                        {item.name} ({item.value > 0 ? item.value : `${item.value}%`})
                      </span>
                    </div>
                  ))}
                </div>
                  </CardContent>
                </Card>

                {/* Top Pages */}
                <Card className={cn(
                  "border",
                  theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
                )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-base font-semibold",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  {t('topPages')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(base44TopPages.length > 0 ? base44TopPages.map(([page, views]) => ({
                    page, 
                    views, 
                    percentage: base44TotalPageViews > 0 ? (views / base44TotalPageViews * 100) : 0
                  })) : topPages).map((page, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className={cn("text-sm truncate max-w-[180px]", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
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
                  "border",
                  theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
                )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-base font-semibold",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  {t('usersByCountry')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(base44TopCountries.length > 0 ? base44TopCountries.map(([country, users]) => ({
                    country,
                    users,
                    flag: '🌍'
                  })) : countryData).map((country, idx) => (
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
                "mt-6 border",
                theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
              )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-base font-semibold",
                theme === 'dark' ? "text-white" : "text-gray-900"
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
                    </TabsContent>

                    <TabsContent value="raw-data">
                      <AnalyticsRawDataTable
                        filteredPageViews={filteredPageViews}
                        filteredUserActions={filteredUserActions}
                        filteredConversions={filteredConversions}
                        filteredExternalEvents={filteredExternalEvents}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="google">
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Globe className={cn("w-16 h-16 mx-auto mb-4", theme === 'dark' ? "text-slate-600" : "text-gray-300")} />
                      <h3 className={cn("text-xl font-semibold mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                        Google Analytics Integration
                      </h3>
                      <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                        התחבר ל-Google Analytics כדי לראות נתונים מפורטים על תעבורת האתר
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="app">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="דוחות נוצרו"
                  value={appReportCreated.toLocaleString()}
                  icon={FileText}
                  trend="up"
                  trendValue="+20%"
                  color="navy"
                />
                <StatsCard
                  title="הרשמות חדשות"
                  value={appUserSignups.toLocaleString()}
                  icon={UserPlus}
                  trend="up"
                  trendValue="+10%"
                  color="teal"
                />
                <StatsCard
                  title="תשלומים בוצעו"
                  value={appPayments.toLocaleString()}
                  icon={DollarSign}
                  trend="up"
                  trendValue="+5%"
                  color="gold"
                />
                <StatsCard
                  title="פניות תמיכה"
                  value={appSupportTickets.toLocaleString()}
                  icon={MessageSquare}
                  trend="down"
                  trendValue="-3%"
                  color="red"
                />
              </div>

              <Card className={cn(
                "mb-8 border",
                theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-base font-semibold",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    אירועי אפליקציה
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {appChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className={cn(
                "border",
                theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-base font-semibold",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    משתמשים פעילים ביותר
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(appEvents.reduce((acc, event) => {
                      const email = event.created_by || 'Unknown';
                      acc[email] = (acc[email] || 0) + 1;
                      return acc;
                    }, {})).sort(([, a], [, b]) => b - a).slice(0, 5).map(([email, count], idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className={theme === 'dark' ? "text-slate-300" : "text-gray-700"}>{email}</span>
                        <span className={cn("font-medium", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>{count} פעולות</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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