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
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 h-screen transition-all duration-300 z-50",
        "bg-gradient-to-b from-[#D89C42] to-[#C88A35] text-white shadow-xl",
        collapsed ? "w-20" : "w-64",
        isRTL ? "right-0" : "left-0"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/20 bg-white/10">
        {collapsed ? (
          <span className="text-2xl font-bold text-white drop-shadow-lg">T</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white drop-shadow-lg">tariff</span>
            <span className="text-2xl font-bold text-[#114B5F] drop-shadow-lg">.ai</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-20 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg",
          "hover:bg-[#114B5F] transition-colors text-[#D89C42] hover:text-white",
          isRTL ? "-left-3" : "-right-3"
        )}
      >
        {isRTL ? (
          collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <Link
                  to={createPageUrl(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
                    isActive 
                      ? "bg-white/20 text-white shadow-md backdrop-blur-sm" 
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{t(item.label)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className={cn(
        "absolute bottom-0 w-full p-4 border-t border-white/20 bg-black/10",
        "space-y-2"
      )}>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn(
            "w-full text-white/70 hover:text-white hover:bg-white/10",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className={cn("mr-2", !isRTL && "ml-2 mr-0")}>{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>}
        </Button>

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleLanguage}
          className={cn(
            "w-full text-white/70 hover:text-white hover:bg-white/10",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <Languages className="w-5 h-5" />
          {!collapsed && <span className={cn("mr-2", !isRTL && "ml-2 mr-0")}>{language === 'he' ? 'English' : 'עברית'}</span>}
        </Button>
      </div>
    </aside>
  );
}