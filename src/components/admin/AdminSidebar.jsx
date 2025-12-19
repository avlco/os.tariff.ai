import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from './LanguageContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  DollarSign, 
  MessageSquare,
  Globe2,
  Sun,
  Moon,
  Languages,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminSidebar({ currentPage, collapsed, setCollapsed }) {
  const { t, isRTL, theme, toggleTheme, toggleLanguage, language } = useLanguage();

  const menuItems = [
    { id: 'AdminDashboard', icon: LayoutDashboard, label: 'dashboard' },
    { id: 'AdminUsers', icon: Users, label: 'users' },
    { id: 'AdminReports', icon: FileText, label: 'reports' },
    { id: 'AdminAnalytics', icon: BarChart3, label: 'analytics' },
    { id: 'AdminFinancial', icon: DollarSign, label: 'financial' },
    { id: 'AdminCountryLinks', icon: Globe2, label: 'dbLinks' },
    { id: 'AdminCommunication', icon: MessageSquare, label: 'communication' },
  ];

  return (
    <aside 
          className={cn(
            "fixed top-0 h-screen transition-all duration-300 z-50",
            theme === 'dark' ? "bg-[#0d1117] border-r border-slate-800" : "bg-white border-r border-gray-200",
            collapsed ? "w-16" : "w-64",
            isRTL ? "right-0" : "left-0"
          )}
        >
      {/* Logo */}
      {/* Logo Section */}
      <div className={cn(
        "h-16 flex items-center border-b",
        theme === 'dark' ? "border-slate-800" : "border-gray-100",
        "px-4",
        collapsed ? "justify-center" : "justify-start"
      )}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm p-1.5">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69442549f334f63b00b21e4f/80970ea07_tariffailogo.png"
              alt="Tariff.AI"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69442549f334f63b00b21e4f/80970ea07_tariffailogo.png"
            alt="Tariff.AI"
            className="h-8 object-contain"
          />
        )}
      </div>

      {/* Control Buttons */}
      <div className={cn(
        "p-3 border-b",
        theme === 'dark' ? "border-slate-800" : "border-gray-100",
        "flex items-center gap-2",
        collapsed ? "flex-col" : "justify-center flex-wrap"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={cn(
            "gap-2 text-xs font-medium",
            collapsed ? "w-full" : "",
            theme === 'dark' ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className={cn(
            "gap-2 text-xs font-medium",
            collapsed ? "w-full" : "",
            theme === 'dark' ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <Globe2 className="w-4 h-4" />
          {!collapsed && <span>{language === 'he' ? 'EN' : 'עב'}</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "gap-2 text-xs font-medium",
            collapsed ? "w-full" : "",
            theme === 'dark' ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          {collapsed ? (isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : (isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)}
        </Button>
      </div>



      {/* Navigation */}
      <nav className="mt-6 px-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <Link
                  to={createPageUrl(item.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all group relative",
                    collapsed ? "justify-center" : "justify-start",
                    isActive 
                      ? theme === 'dark' 
                        ? "bg-[var(--primary-teal)] text-white shadow-lg" 
                        : "bg-gradient-to-r from-[var(--primary-teal)]/10 to-[var(--primary-navy)]/10 text-[var(--primary-navy)] border-r-2 border-[var(--primary-teal)]"
                      : theme === 'dark'
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{t(item.label)}</span>}
                  {collapsed && (
                    <span className={cn(
                      "absolute whitespace-nowrap px-2 py-1 rounded-md text-sm font-medium shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50",
                      theme === 'dark' ? "bg-slate-800 text-white" : "bg-gray-900 text-white",
                      isRTL ? "right-full mr-2" : "left-full ml-2"
                    )}>
                      {t(item.label)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>


    </aside>
  );
}