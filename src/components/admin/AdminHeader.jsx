import React from 'react';
import { useLanguage } from './LanguageContext';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function AdminHeader({ title, user }) {
  const { t, isRTL, theme } = useLanguage();

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-8 border-b shadow-sm",
      theme === 'dark' ? "bg-[#0d1117] border-slate-800" : "bg-white border-gray-200"
    )}>
      <h1 className={cn(
        "text-2xl font-bold",
        theme === 'dark' ? "text-white" : "text-[#114B5F]"
      )}>
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4",
            isRTL ? "right-3" : "left-3",
            theme === 'dark' ? "text-slate-400" : "text-gray-400"
          )} />
          <Input
            placeholder={t('search')}
            className={cn(
              "w-64",
              isRTL ? "pr-10" : "pl-10",
              theme === 'dark' ? "bg-slate-800 border-slate-600 text-white" : ""
            )}
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn("w-5 h-5", theme === 'dark' ? "text-slate-400" : "text-gray-600")} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn(
              "flex items-center gap-3 rounded-xl transition-all",
              theme === 'dark' ? "hover:bg-slate-800" : "hover:bg-gray-100"
            )}>
              <div className="text-right hidden md:block">
                <div className={cn("text-sm font-medium", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                  {user?.full_name || 'Admin'}
                </div>
                <div className={cn("text-xs", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>{user?.email}</div>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#114B5F] flex items-center justify-center text-white shadow-lg ring-2 ring-white/20">
                  <User className="w-5 h-5" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
            <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">{t('logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}