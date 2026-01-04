import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { FileText, Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function LegalContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    version: '',
    change_summary: '',
    content_html: ''
  });

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['legalVersions'],
    queryFn: async () => {
      const result = await base44.entities.LegalDocumentVersion.list('-published_at', 100);
      return result;
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (data) => {
      // First, set all existing versions to inactive
      const activeVersions = versions.filter(v => v.is_active);
      for (const version of activeVersions) {
        await base44.entities.LegalDocumentVersion.update(version.id, { is_active: false });
      }

      // Create new version
      return await base44.entities.LegalDocumentVersion.create({
        ...data,
        is_active: true,
        published_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalVersions'] });
      setFormData({ version: '', change_summary: '', content_html: '' });
    }
  });

  const handlePublish = () => {
    if (!formData.version || !formData.content_html) {
      alert(t('fillRequiredFields') || 'Please fill in all required fields');
      return;
    }
    publishMutation.mutate(formData);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminLegal" collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? (isRTL ? "mr-16" : "ml-16") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('legalPolicyManager') || 'Legal Policy Manager'} />
        
        <main className={cn(
          "p-8",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50",
          "min-h-screen"
        )}>
          <Tabs defaultValue="publish" className="w-full">
            <TabsList className={cn(
              "grid w-[400px] grid-cols-2 mb-6",
              theme === 'dark' ? "bg-slate-800" : ""
            )}>
              <TabsTrigger value="publish">
                <FileText className="w-4 h-4 mr-2" />
                {t('publishNewVersion') || 'Publish New Version'}
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="w-4 h-4 mr-2" />
                {t('versionHistory') || 'Version History'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="publish">
              <Card className={cn(
                "border",
                theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-lg font-semibold",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    {t('publishNewVersion') || 'Publish New Version'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                      {t('versionNumber') || 'Version Number'} *
                    </Label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: e.target.value})}
                      placeholder="1.1"
                      className={cn(
                        "mt-2",
                        theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                      )}
                    />
                  </div>

                  <div>
                    <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                      {t('changeSummary') || 'Change Summary'}
                    </Label>
                    <Textarea
                      value={formData.change_summary}
                      onChange={(e) => setFormData({...formData, change_summary: e.target.value})}
                      placeholder={t('describeChanges') || 'Describe what changed in this version...'}
                      rows={4}
                      className={cn(
                        "mt-2",
                        theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                      )}
                    />
                  </div>

                  <div>
                    <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                      {t('contentHtml') || 'Content HTML'} *
                    </Label>
                    <Textarea
                      value={formData.content_html}
                      onChange={(e) => setFormData({...formData, content_html: e.target.value})}
                      placeholder="<h1>Terms of Service</h1><p>...</p>"
                      rows={12}
                      className={cn(
                        "mt-2 font-mono text-sm",
                        theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                      )}
                    />
                  </div>

                  <Button
                    onClick={handlePublish}
                    disabled={publishMutation.isPending}
                    className="w-full bg-[#114B5F] hover:bg-[#0d3a47] text-white"
                  >
                    {publishMutation.isPending ? (t('publishing') || 'Publishing...') : (t('publishVersion') || 'Publish Version')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className={cn(
                "border",
                theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
              )}>
                <CardHeader>
                  <CardTitle className={cn(
                    "text-lg font-semibold",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    {t('versionHistory') || 'Version History'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
                        {t('loading') || 'Loading...'}
                      </p>
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className={cn(
                        "w-12 h-12 mx-auto mb-4",
                        theme === 'dark' ? "text-slate-600" : "text-gray-300"
                      )} />
                      <p className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
                        {t('noVersionsYet') || 'No versions published yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className={cn(
                            "p-4 rounded-lg border",
                            theme === 'dark' ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                            version.is_active && "ring-2 ring-[#42C0B9]"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h3 className={cn(
                                "text-lg font-semibold",
                                theme === 'dark' ? "text-white" : "text-gray-900"
                              )}>
                                {t('version') || 'Version'} {version.version}
                              </h3>
                              {version.is_active && (
                                <Badge className="bg-[#42C0B9] text-white">
                                  <Check className="w-3 h-3 mr-1" />
                                  {t('active') || 'Active'}
                                </Badge>
                              )}
                            </div>
                            <span className={cn(
                              "text-sm",
                              theme === 'dark' ? "text-slate-400" : "text-gray-500"
                            )}>
                              {version.published_at ? format(new Date(version.published_at), 'PPP') : '-'}
                            </span>
                          </div>
                          
                          {version.change_summary && (
                            <p className={cn(
                              "text-sm mb-3",
                              theme === 'dark' ? "text-slate-300" : "text-gray-700"
                            )}>
                              {version.change_summary}
                            </p>
                          )}

                          <details className="mt-2">
                            <summary className={cn(
                              "cursor-pointer text-sm",
                              theme === 'dark' ? "text-slate-400" : "text-gray-500"
                            )}>
                              {t('viewContent') || 'View Content'}
                            </summary>
                            <div className={cn(
                              "mt-2 p-3 rounded border overflow-auto max-h-60 text-xs font-mono",
                              theme === 'dark' ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"
                            )}>
                              {version.content_html}
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default function AdminLegal() {
  return (
    <LanguageProvider>
      <LegalContent />
    </LanguageProvider>
  );
}