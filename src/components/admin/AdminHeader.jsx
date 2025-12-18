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
      "h-16 flex items-center justify-between px-6 border-b",
      theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
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
          <Bell className={cn("w-5 h-5", theme === 'dark' ? "text-slate-300" : "text-gray-600")} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#D89C42] rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-[#42C0B9] text-white"
              )}>
                <User className="w-4 h-4" />
              </div>
              <span className={cn(
                "hidden md:inline",
                theme === 'dark' ? "text-white" : "text-gray-700"
              )}>
                {user?.full_name || 'Admin'}
              </span>
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