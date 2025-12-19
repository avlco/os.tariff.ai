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
      "h-16 flex items-center justify-between px-8 border-b",
      theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"
    )}>
      <h1 className={cn(
        "text-2xl font-semibold",
        theme === 'dark' ? "text-white" : "text-gray-900"
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
            <Button variant="ghost" className="flex items-center gap-3 hover:bg-transparent">
              <div className="text-right hidden md:block">
                <div className={cn("text-sm font-medium", theme === 'dark' ? "text-white" : "text-gray-900")}>
                  {user?.full_name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {(user?.full_name || 'A')[0].toUpperCase()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"}>
            <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">{t('logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}