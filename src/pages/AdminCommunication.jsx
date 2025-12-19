import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter,
  MessageSquare,
  Clock,
  User,
  Send,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

function CommunicationContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchExternalTickets', {});
      return response.data || [];
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await base44.functions.invoke('updateExternalTicket', {
        entityId: id,
        updateData: data
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['supportTickets']);
    }
  });

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const updatedMessages = [
      ...(selectedTicket.messages || []),
      {
        sender: 'Admin',
        sender_type: 'admin',
        message: replyMessage,
        timestamp: new Date().toISOString()
      }
    ];

    await updateTicketMutation.mutateAsync({
      id: selectedTicket.id,
      data: { 
        messages: updatedMessages,
        status: 'waiting_response'
      }
    });

    setReplyMessage('');
    setSelectedTicket({
      ...selectedTicket,
      messages: updatedMessages
    });
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    await updateTicketMutation.mutateAsync({
      id: selectedTicket.id,
      data: { 
        status: 'resolved',
        resolved_at: new Date().toISOString()
      }
    });

    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stats
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminCommunication" collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? (isRTL ? "mr-16" : "ml-16") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('supportCenter')} />
        
        <main className={cn(
          "p-8",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50",
          "min-h-screen"
        )}>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className={cn(
              "cursor-pointer transition-all hover:shadow-md border rounded-xl",
              theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200",
              statusFilter === 'all' && "ring-2 ring-[#42C0B9]"
            )} onClick={() => setStatusFilter('all')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      {t('allTickets')}
                    </p>
                    <p className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      {tickets.length}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-[#42C0B9]" />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "cursor-pointer transition-all hover:shadow-md border rounded-xl",
              theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200",
              statusFilter === 'open' && "ring-2 ring-[#114B5F]"
            )} onClick={() => setStatusFilter('open')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      {t('openTickets')}
                    </p>
                    <p className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      {openCount}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "cursor-pointer transition-all hover:shadow-md border rounded-xl",
              theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200",
              statusFilter === 'in_progress' && "ring-2 ring-[#D89C42]"
            )} onClick={() => setStatusFilter('in_progress')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      {t('inProgress')}
                    </p>
                    <p className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      {inProgressCount}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "cursor-pointer transition-all hover:shadow-md border rounded-xl",
              theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200",
              statusFilter === 'resolved' && "ring-2 ring-[#42C0B9]"
            )} onClick={() => setStatusFilter('resolved')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                      {t('resolved')}
                    </p>
                    <p className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-[#114B5F]")}>
                      {resolvedCount}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className={cn(
            "mb-6 border shadow-sm rounded-xl",
            theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200"
          )}>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-4 h-4",
                    isRTL ? "right-3" : "left-3",
                    theme === 'dark' ? "text-slate-400" : "text-gray-400"
                  )} />
                  <Input
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      isRTL ? "pr-10" : "pl-10",
                      theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                    )}
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className={cn(
                    "w-40",
                    theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                  )}>
                    <SelectValue placeholder={t('category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('category')}</SelectItem>
                    <SelectItem value="billing">{t('billing')}</SelectItem>
                    <SelectItem value="technical">{t('technical')}</SelectItem>
                    <SelectItem value="classification">{t('classification')}</SelectItem>
                    <SelectItem value="account">{t('account')}</SelectItem>
                    <SelectItem value="feature_request">{t('feature_request')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className={cn(
                "text-center py-12",
                theme === 'dark' ? "text-slate-400" : "text-gray-500"
              )}>
                {t('loading')}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className={cn(
                "text-center py-12",
                theme === 'dark' ? "text-slate-400" : "text-gray-500"
              )}>
                {t('noData')}
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <Card 
                  key={ticket.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border rounded-xl",
                    theme === 'dark' ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800" : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={ticket.status} />
                          <StatusBadge status={ticket.priority} />
                          <Badge variant="outline" className={cn(
                            theme === 'dark' ? "border-slate-600" : ""
                          )}>
                            {t(ticket.category)}
                          </Badge>
                        </div>
                        <h3 className={cn(
                          "text-base font-semibold mb-1",
                          theme === 'dark' ? "text-white" : "text-[#114B5F]"
                        )}>
                          {ticket.subject}
                        </h3>
                        <p className={cn(
                          "text-sm line-clamp-2",
                          theme === 'dark' ? "text-slate-400" : "text-gray-500"
                        )}>
                          {ticket.message}
                        </p>
                      </div>
                      <div className={cn(
                        "text-sm text-right shrink-0",
                        theme === 'dark' ? "text-slate-400" : "text-gray-500"
                      )}>
                        <div className="flex items-center gap-1 mb-1">
                          <User className="w-4 h-4" />
                          {ticket.user_name || ticket.user_email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {ticket.created_date ? format(new Date(ticket.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Ticket Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] flex flex-col",
          theme === 'dark' ? "bg-slate-800 text-white" : ""
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTicket?.subject}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTicket?.status} />
                <StatusBadge status={selectedTicket?.priority} />
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Ticket Info */}
              <div className={cn(
                "p-4 rounded-lg mb-4",
                theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
              )}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{selectedTicket.user_name || selectedTicket.user_email}</span>
                  </div>
                  <Badge variant="outline">{t(selectedTicket.category)}</Badge>
                  <span className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {selectedTicket.created_date ? format(new Date(selectedTicket.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                  </span>
                </div>
                <p className={theme === 'dark' ? "text-slate-300" : "text-gray-700"}>
                  {selectedTicket.message}
                </p>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 pr-4">
                  {selectedTicket.messages?.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg",
                        msg.sender_type === 'admin'
                          ? "bg-[#42C0B9]/10 ml-8"
                          : theme === 'dark' ? "bg-slate-700 mr-8" : "bg-gray-100 mr-8"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-medium text-sm",
                          msg.sender_type === 'admin' ? "text-[#42C0B9]" : theme === 'dark' ? "text-white" : "text-[#114B5F]"
                        )}>
                          {msg.sender}
                        </span>
                        <span className={cn("text-xs", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                          {msg.timestamp ? format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm') : '-'}
                        </span>
                      </div>
                      <p className={theme === 'dark' ? "text-slate-300" : "text-gray-700"}>
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Box */}
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div className="space-y-3">
                  <Textarea
                    placeholder={t('reply')}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className={cn(
                      "min-h-[100px]",
                      theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : ""
                    )}
                  />
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleCloseTicket}
                      className={cn(
                        theme === 'dark' ? "border-slate-600 text-slate-300" : ""
                      )}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('close')} Ticket
                    </Button>
                    <Button 
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="bg-[var(--primary-teal)] hover:bg-[var(--teal-dark)] text-white shadow-sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {t('reply')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCommunication() {
  return (
    <LanguageProvider>
      <CommunicationContent />
    </LanguageProvider>
  );
}