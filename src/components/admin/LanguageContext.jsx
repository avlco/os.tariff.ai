import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  he: {
    // Navigation
    dashboard: 'לוח בקרה',
    users: 'משתמשים',
    reports: 'דוחות',
    shipments: 'משלוחים',
    analytics: 'אנליטיקס',
    financial: 'פיננסי',
    dbLinks: 'קישורי DB',
    communication: 'תקשורת',
    settings: 'הגדרות',
    logout: 'התנתקות',
    
    // Dashboard
    totalUsers: 'סה״כ משתמשים',
    activeUsers: 'משתמשים פעילים',
    totalReports: 'סה״כ דוחות',
    monthlyRevenue: 'הכנסות החודש',
    recentActivity: 'פעילות אחרונה',
    quickStats: 'סטטיסטיקות מהירות',
    newUsers: 'משתמשים חדשים',
    pendingTickets: 'פניות ממתינות',
    reportsToday: 'דוחות היום',
    
    // Users
    userManagement: 'ניהול משתמשים',
    searchUsers: 'חיפוש משתמשים...',
    allPlans: 'כל התוכניות',
    allStatuses: 'כל הסטטוסים',
    name: 'שם',
    email: 'אימייל',
    plan: 'תוכנית',
    status: 'סטטוס',
    reportsUsed: 'דוחות',
    lastActive: 'פעילות אחרונה',
    actions: 'פעולות',
    viewDetails: 'צפייה בפרטים',
    editUser: 'עריכת משתמש',
    suspendUser: 'השעיית משתמש',
    deleteUser: 'מחיקת משתמש',
    
    // Reports
    reportManagement: 'מאגר דוחות',
    searchReports: 'חיפוש דוחות...',
    reportId: 'מזהה דוח',
    productName: 'שם המוצר',
    hsCode: 'קוד HS',
    confidence: 'ציון ביטחון',
    createdAt: 'תאריך יצירה',
    viewReport: 'צפייה בדוח',
    downloadReport: 'הורדת דוח',
    
    // Analytics
    analyticsTitle: 'אנליטיקס',
    pageViews: 'צפיות בדף',
    sessions: 'סשנים',
    conversionRate: 'שיעור המרה',
    avgSessionDuration: 'משך סשן ממוצע',
    topPages: 'דפים מובילים',
    usersByCountry: 'משתמשים לפי מדינה',
    deviceBreakdown: 'התפלגות מכשירים',
    trafficSources: 'מקורות תנועה',
    
    // Financial
    financialOverview: 'סקירה פיננסית',
    totalRevenue: 'סה״כ הכנסות',
    monthlyRecurring: 'הכנסה חודשית חוזרת',
    averageOrderValue: 'ערך הזמנה ממוצע',
    transactions: 'עסקאות',
    revenueByPlan: 'הכנסות לפי תוכנית',
    recentTransactions: 'עסקאות אחרונות',
    
    // Communication
    supportCenter: 'מרכז תמיכה',
    allTickets: 'כל הפניות',
    openTickets: 'פניות פתוחות',
    inProgress: 'בטיפול',
    resolved: 'נפתרו',
    ticketId: 'מזהה פנייה',
    subject: 'נושא',
    category: 'קטגוריה',
    priority: 'עדיפות',
    assignedTo: 'משויך ל',
    reply: 'השב',
    close: 'סגור',
    
    // Status labels
    active: 'פעיל',
    inactive: 'לא פעיל',
    suspended: 'מושעה',
    pending: 'ממתין',
    completed: 'הושלם',
    failed: 'נכשל',
    open: 'פתוח',
    closed: 'סגור',
    in_transit: 'בדרך',
    customs_clearance: 'מכס',
    delivered: 'נמסר',
    cancelled: 'בוטל',
    
    // Plans
    free: 'חינם',
    per_use: 'לפי שימוש',
    basic: 'בסיסי',
    pro: 'מקצועי',
    agency: 'סוכנות',
    enterprise: 'ארגוני',
    
    // Categories
    billing: 'חיוב',
    technical: 'טכני',
    classification: 'סיווג',
    account: 'חשבון',
    feature_request: 'בקשת פיצ׳ר',
    other: 'אחר',
    
    // Priority
    low: 'נמוכה',
    medium: 'בינונית',
    high: 'גבוהה',
    urgent: 'דחוף',
    
    // Common
    search: 'חיפוש',
    filter: 'סינון',
    export: 'ייצוא',
    refresh: 'רענון',
    save: 'שמירה',
    cancel: 'ביטול',
    delete: 'מחיקה',
    edit: 'עריכה',
    view: 'צפייה',
    loading: 'טוען...',
    noData: 'אין נתונים להצגה',
    showMore: 'הצג עוד',
    
    // Time
    today: 'היום',
    yesterday: 'אתמול',
    thisWeek: 'השבוע',
    thisMonth: 'החודש',
    lastMonth: 'חודש שעבר',
    custom: 'מותאם אישית',
    
    // Misc
    darkMode: 'מצב כהה',
    lightMode: 'מצב בהיר',
    language: 'שפה',
    hebrew: 'עברית',
    english: 'English',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    users: 'Users',
    reports: 'Reports',
    shipments: 'Shipments',
    analytics: 'Analytics',
    financial: 'Financial',
    dbLinks: 'DB Links',
    communication: 'Communication',
    settings: 'Settings',
    logout: 'Logout',
    
    // Dashboard
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    totalReports: 'Total Reports',
    monthlyRevenue: 'Monthly Revenue',
    recentActivity: 'Recent Activity',
    quickStats: 'Quick Stats',
    newUsers: 'New Users',
    pendingTickets: 'Pending Tickets',
    reportsToday: 'Reports Today',
    
    // Users
    userManagement: 'User Management',
    searchUsers: 'Search users...',
    allPlans: 'All Plans',
    allStatuses: 'All Statuses',
    name: 'Name',
    email: 'Email',
    plan: 'Plan',
    status: 'Status',
    reportsUsed: 'Reports',
    lastActive: 'Last Active',
    actions: 'Actions',
    viewDetails: 'View Details',
    editUser: 'Edit User',
    suspendUser: 'Suspend User',
    deleteUser: 'Delete User',
    
    // Reports
    reportManagement: 'Report Management',
    searchReports: 'Search reports...',
    reportId: 'Report ID',
    productName: 'Product Name',
    hsCode: 'HS Code',
    confidence: 'Confidence',
    createdAt: 'Created At',
    viewReport: 'View Report',
    downloadReport: 'Download Report',
    
    // Analytics
    analyticsTitle: 'Analytics',
    pageViews: 'Page Views',
    sessions: 'Sessions',
    conversionRate: 'Conversion Rate',
    avgSessionDuration: 'Avg. Session Duration',
    topPages: 'Top Pages',
    usersByCountry: 'Users by Country',
    deviceBreakdown: 'Device Breakdown',
    trafficSources: 'Traffic Sources',
    
    // Financial
    financialOverview: 'Financial Overview',
    totalRevenue: 'Total Revenue',
    monthlyRecurring: 'Monthly Recurring',
    averageOrderValue: 'Average Order Value',
    transactions: 'Transactions',
    revenueByPlan: 'Revenue by Plan',
    recentTransactions: 'Recent Transactions',
    
    // Communication
    supportCenter: 'Support Center',
    allTickets: 'All Tickets',
    openTickets: 'Open Tickets',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    ticketId: 'Ticket ID',
    subject: 'Subject',
    category: 'Category',
    priority: 'Priority',
    assignedTo: 'Assigned To',
    reply: 'Reply',
    close: 'Close',
    
    // Status labels
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    open: 'Open',
    closed: 'Closed',
    in_transit: 'In Transit',
    customs_clearance: 'Customs Clearance',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    
    // Plans
    free: 'Free',
    per_use: 'Per Use',
    basic: 'Basic',
    pro: 'Pro',
    agency: 'Agency',
    enterprise: 'Enterprise',
    
    // Categories
    billing: 'Billing',
    technical: 'Technical',
    classification: 'Classification',
    account: 'Account',
    feature_request: 'Feature Request',
    other: 'Other',
    
    // Priority
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    
    // Common
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    refresh: 'Refresh',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    loading: 'Loading...',
    noData: 'No data to display',
    showMore: 'Show More',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    custom: 'Custom',
    
    // Misc
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    hebrew: 'עברית',
    english: 'English',
    rawData: 'נתונים גולמיים',
    pageViewsData: 'נתוני צפיות עמודים',
    userActionsData: 'נתוני פעולות משתמש',
    conversionsData: 'נתוני המרות',
    analyticsEventsData: 'נתוני אירועי אנליטיקס',
    selectDataType: 'בחר סוג נתונים',
    visualAnalytics: 'אנליטיקס ויזואלי',
    },
    en: {
    // Navigation
    dashboard: 'Dashboard',
    users: 'Users',
    reports: 'Reports',
    shipments: 'Shipments',
    analytics: 'Analytics',
    financial: 'Financial',
    dbLinks: 'DB Links',
    communication: 'Communication',
    settings: 'Settings',
    logout: 'Logout',

    // Dashboard
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    totalReports: 'Total Reports',
    monthlyRevenue: 'Monthly Revenue',
    recentActivity: 'Recent Activity',
    quickStats: 'Quick Stats',
    newUsers: 'New Users',
    pendingTickets: 'Pending Tickets',
    reportsToday: 'Reports Today',

    // Users
    userManagement: 'User Management',
    searchUsers: 'Search users...',
    allPlans: 'All Plans',
    allStatuses: 'All Statuses',
    name: 'Name',
    email: 'Email',
    plan: 'Plan',
    status: 'Status',
    reportsUsed: 'Reports',
    lastActive: 'Last Active',
    actions: 'Actions',
    viewDetails: 'View Details',
    editUser: 'Edit User',
    suspendUser: 'Suspend User',
    deleteUser: 'Delete User',

    // Reports
    reportManagement: 'Report Management',
    searchReports: 'Search reports...',
    reportId: 'Report ID',
    productName: 'Product Name',
    hsCode: 'HS Code',
    confidence: 'Confidence',
    createdAt: 'Created At',
    viewReport: 'View Report',
    downloadReport: 'Download Report',

    // Analytics
    analyticsTitle: 'Analytics',
    pageViews: 'Page Views',
    sessions: 'Sessions',
    conversionRate: 'Conversion Rate',
    avgSessionDuration: 'Avg. Session Duration',
    topPages: 'Top Pages',
    usersByCountry: 'Users by Country',
    deviceBreakdown: 'Device Breakdown',
    trafficSources: 'Traffic Sources',

    // Financial
    financialOverview: 'Financial Overview',
    totalRevenue: 'Total Revenue',
    monthlyRecurring: 'Monthly Recurring',
    averageOrderValue: 'Average Order Value',
    transactions: 'Transactions',
    revenueByPlan: 'Revenue by Plan',
    recentTransactions: 'Recent Transactions',

    // Communication
    supportCenter: 'Support Center',
    allTickets: 'All Tickets',
    openTickets: 'Open Tickets',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    ticketId: 'Ticket ID',
    subject: 'Subject',
    category: 'Category',
    priority: 'Priority',
    assignedTo: 'Assigned To',
    reply: 'Reply',
    close: 'Close',

    // Status labels
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    open: 'Open',
    closed: 'Closed',
    in_transit: 'In Transit',
    customs_clearance: 'Customs Clearance',
    delivered: 'Delivered',
    cancelled: 'Cancelled',

    // Plans
    free: 'Free',
    per_use: 'Per Use',
    basic: 'Basic',
    pro: 'Pro',
    agency: 'Agency',
    enterprise: 'Enterprise',

    // Categories
    billing: 'Billing',
    technical: 'Technical',
    classification: 'Classification',
    account: 'Account',
    feature_request: 'Feature Request',
    other: 'Other',

    // Priority
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',

    // Common
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    refresh: 'Refresh',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    loading: 'Loading...',
    noData: 'No data to display',
    showMore: 'Show More',

    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    custom: 'Custom',

    // Misc
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    hebrew: 'עברית',
    english: 'English',

    rawData: 'Raw Data',
    pageViewsData: 'Page Views Data',
    userActionsData: 'User Actions Data',
    conversionsData: 'Conversions Data',
    analyticsEventsData: 'Analytics Events Data',
    selectDataType: 'Select Data Type',
    visualAnalytics: 'Visual Analytics',
    }
    };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('he');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedLang = localStorage.getItem('tariff-admin-lang') || 'he';
    const savedTheme = localStorage.getItem('tariff-admin-theme') || 'light';
    setLanguage(savedLang);
    setTheme(savedTheme);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    localStorage.setItem('tariff-admin-lang', newLang);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('tariff-admin-theme', newTheme);
  };

  const t = (key) => translations[language][key] || key;
  const isRTL = language === 'he';

  return (
    <LanguageContext.Provider value={{ language, theme, toggleLanguage, toggleTheme, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);