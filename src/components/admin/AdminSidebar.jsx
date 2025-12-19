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

export default function AdminSidebar({ currentPage }) {
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
            theme === 'dark' ? "bg-slate-900 border-r border-slate-800" : "bg-white border-r border-gray-100",
            "w-16",
            isRTL ? "right-0" : "left-0"
          )}
        >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center justify-center",
        theme === 'dark' ? "border-b border-slate-800" : "border-b border-gray-100"
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-xl font-bold">T</span>
        </div>
      </div>



      {/* Navigation */}
      <nav className="mt-6 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <Link
                  to={createPageUrl(item.id)}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg transition-all group relative",
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
                  <span className={cn(
                    "absolute whitespace-nowrap px-2 py-1 rounded-md text-sm font-medium shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50",
                    theme === 'dark' ? "bg-slate-800 text-white" : "bg-gray-900 text-white",
                    isRTL ? "right-full mr-2" : "left-full ml-2"
                  )}>
                    {t(item.label)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className={cn(
        "absolute bottom-0 w-full p-2",
        theme === 'dark' ? "border-t border-slate-800" : "border-t border-gray-100",
        "space-y-1"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={cn(
            "w-full",
            theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className={cn(
            "w-full",
            theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <Languages className="w-5 h-5" />
        </Button>
      </div>
    </aside>
  );
}