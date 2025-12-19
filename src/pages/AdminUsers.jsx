import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Trash2,
  UserPlus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

function UsersContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['appUsers'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalUsers', {});
      return response.data || [];
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await base44.functions.invoke('updateExternalUser', {
        entityId: id,
        updateData: data
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries(['appUsers'])
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const columns = [
    {
      key: 'full_name',
      label: t('name'),
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white font-medium",
            "bg-gradient-to-br from-[#114B5F] to-[#42C0B9]"
          )}>
            {(value || row.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className={cn(
              "font-medium",
              theme === 'dark' ? "text-white" : "text-[#114B5F]"
            )}>{value || '-'}</p>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? "text-slate-400" : "text-gray-500"
            )}>
              {row.company || '-'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: t('email')
    },
    {
      key: 'plan',
      label: t('plan'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'status',
      label: t('status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'reports_this_month',
      label: t('reportsUsed'),
      render: (value, row) => {
        const limits = { free: 3, basic: 15, pro: 50, agency: 200, enterprise: '∞' };
        const limit = limits[row.plan] || '∞';
        return `${value || 0} / ${limit}`;
      }
    },
    {
      key: 'last_active',
      label: t('lastActive'),
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'
    },
    {
      key: 'actions',
      label: t('actions'),
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"}>
            <DropdownMenuItem onClick={() => setSelectedUser(row)}>
              <Eye className="w-4 h-4 mr-2" />
              {t('viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              {t('editUser')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateUserMutation.mutate({
                id: row.id,
                data: { status: row.status === 'suspended' ? 'active' : 'suspended' }
              })}
            >
              <Ban className="w-4 h-4 mr-2" />
              {row.status === 'suspended' ? t('active') : t('suspendUser')}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              {t('deleteUser')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminUsers" collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? (isRTL ? "mr-16" : "ml-16") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('userManagement')} />
        
        <main className={cn(
          "p-8",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50",
          "min-h-screen"
        )}>
          <Card className={cn(
            "border shadow-sm rounded-xl",
            theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-1 gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-4 h-4",
                      isRTL ? "right-3" : "left-3",
                      theme === 'dark' ? "text-slate-400" : "text-gray-400"
                    )} />
                    <Input
                      placeholder={t('searchUsers')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        isRTL ? "pr-10" : "pl-10",
                        theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                      )}
                    />
                  </div>

                  {/* Plan Filter */}
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className={cn(
                      "w-40",
                      theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                    )}>
                      <SelectValue placeholder={t('allPlans')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allPlans')}</SelectItem>
                      <SelectItem value="free">{t('free')}</SelectItem>
                      <SelectItem value="per_use">{t('per_use')}</SelectItem>
                      <SelectItem value="basic">{t('basic')}</SelectItem>
                      <SelectItem value="pro">{t('pro')}</SelectItem>
                      <SelectItem value="agency">{t('agency')}</SelectItem>
                      <SelectItem value="enterprise">{t('enterprise')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className={cn(
                      "w-40",
                      theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                    )}>
                      <SelectValue placeholder={t('allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses')}</SelectItem>
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="inactive">{t('inactive')}</SelectItem>
                      <SelectItem value="suspended">{t('suspended')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className={cn(
                    theme === 'dark' ? "border-slate-600 text-slate-300" : ""
                  )}>
                    <Download className="w-4 h-4 mr-2" />
                    {t('export')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns}
                data={filteredUsers}
                loading={isLoading}
                onRowClick={setSelectedUser}
              />
            </CardContent>
          </Card>
        </main>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className={cn(
          "max-w-2xl",
          theme === 'dark' ? "bg-slate-800 text-white" : ""
        )}>
          <DialogHeader>
            <DialogTitle>{t('viewDetails')}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold",
                  "bg-gradient-to-br from-[#114B5F] to-[#42C0B9]"
                )}>
                  {(selectedUser.full_name || selectedUser.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className={cn(
                    "text-xl font-bold",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>{selectedUser.full_name || '-'}</h3>
                  <p className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('plan')}
                  </p>
                  <StatusBadge status={selectedUser.plan} />
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('status')}
                  </p>
                  <StatusBadge status={selectedUser.status} />
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('totalReports')}
                  </p>
                  <p className={cn(
                    "font-medium",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>{selectedUser.total_reports || 0}</p>
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('reportsUsed')}
                  </p>
                  <p className={cn(
                    "font-medium",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>{selectedUser.reports_this_month || 0}</p>
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('createdAt')}
                  </p>
                  <p className={cn(
                    "font-medium",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>
                    {selectedUser.created_date ? format(new Date(selectedUser.created_date), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {t('lastActive')}
                  </p>
                  <p className={cn(
                    "font-medium",
                    theme === 'dark' ? "text-white" : "text-[#114B5F]"
                  )}>
                    {selectedUser.last_active ? format(new Date(selectedUser.last_active), 'dd/MM/yyyy HH:mm') : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <LanguageProvider>
      <UsersContent />
    </LanguageProvider>
  );
}