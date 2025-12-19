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
    { id: 'AdminCommunication', icon: MessageSquare, label: 'communication' },
    { id: 'AdminCountryLinks', icon: Globe2, label: 'countryLinks' },
  ];

  return (
    <aside 
          className={cn(
            "fixed top-0 h-screen transition-all duration-300 z-50",
            theme === 'dark' ? "bg-slate-900 border-r border-slate-800" : "bg-white border-r border-gray-100",
            collapsed ? "w-16" : "w-64",
            isRTL ? "right-0" : "left-0"
          )}
        >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center justify-center border-b",
        theme === 'dark' ? "border-slate-800" : "border-gray-100",
        "px-4"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">T</span>
          </div>
          {!collapsed && (
            <span className={cn(
              "text-lg font-semibold",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              Tariff.AI
            </span>
          )}
        </div>
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
                        ? "bg-indigo-600 text-white" 
                        : "bg-indigo-50 text-indigo-600"
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

      {/* Bottom Actions */}
      <div className={cn(
        "p-2 border-t",
        theme === 'dark' ? "border-slate-800" : "border-gray-100",
        "space-y-1"
      )}>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn(
            "w-full",
            collapsed ? "justify-center" : "justify-start",
            theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className={cn("text-sm", isRTL ? "mr-2" : "ml-2")}>{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>}
        </Button>

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleLanguage}
          className={cn(
            "w-full",
            collapsed ? "justify-center" : "justify-start",
            theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <Languages className="w-5 h-5" />
          {!collapsed && <span className={cn("text-sm", isRTL ? "mr-2" : "ml-2")}>{language === 'he' ? 'English' : 'עברית'}</span>}
        </Button>

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full",
            collapsed ? "justify-center" : "justify-start",
            theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {collapsed ? (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />) : (isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          {!collapsed && <span className={cn("text-sm", isRTL ? "mr-2" : "ml-2")}>כווץ תפריט</span>}
        </Button>
      </div>
    </aside>
  );
}