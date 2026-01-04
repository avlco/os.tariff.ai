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
import { FileText, Check, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function LegalContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('he');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    version: '',
    terms: {
      he: '',
      en: ''
    },
    privacy: {
      he: '',
      en: ''
    },
    summary: {
      he: '',
      en: ''
    }
  });

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['legalVersions'],
    queryFn: async () => {
      const result = await base44.entities.LegalDocumentVersion.list('-published_at', 100);
      return result || [];
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('proxyPublishLegal', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalVersions'] });
      setFormData({
        version: '',
        terms: { he: '', en: '' },
        privacy: { he: '', en: '' },
        summary: { he: '', en: '' }
      });
    }
  });

  const handlePublish = () => {
    if (!formData.version || !formData.terms.he || !formData.privacy.he) {
      alert(t('fillRequiredFields') || 'Please fill in version and Hebrew content');
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
                  <div className="grid grid-cols-2 gap-4">
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


                  </div>

                  <Tabs value={activeLanguage} onValueChange={setActiveLanguage} className="w-full">
                    <TabsList className={cn(
                      "grid w-[300px] grid-cols-2",
                      theme === 'dark' ? "bg-slate-900" : ""
                    )}>
                      <TabsTrigger value="he">עברית</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>

                    <TabsContent value="he" className="space-y-4 mt-4">
                      <div>
                        <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                          סיכום שינויים (עברית)
                        </Label>
                        <Textarea
                          value={formData.summary.he}
                          onChange={(e) => setFormData({
                            ...formData,
                            summary: {...formData.summary, he: e.target.value}
                          })}
                          placeholder="סיכום קצר של השינויים..."
                          rows={2}
                          className={cn(
                            "mt-2",
                            theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                          )}
                        />
                      </div>

                      <div>
                        <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                          תנאי שימוש (עברית) *
                        </Label>
                        <Textarea
                          value={formData.terms.he}
                          onChange={(e) => setFormData({
                            ...formData,
                            terms: {...formData.terms, he: e.target.value}
                          })}
                          placeholder="<h1>תנאי שימוש</h1><p>...</p>"
                          rows={10}
                          className={cn(
                            "mt-2 font-mono text-sm",
                            theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                          )}
                        />
                      </div>

                      <div>
                        <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                          מדיניות פרטיות (עברית) *
                        </Label>
                        <Textarea
                          value={formData.privacy.he}
                          onChange={(e) => setFormData({
                            ...formData,
                            privacy: {...formData.privacy, he: e.target.value}
                          })}
                          placeholder="<h1>מדיניות פרטיות</h1><p>...</p>"
                          rows={10}
                          className={cn(
                            "mt-2 font-mono text-sm",
                            theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="en" className="space-y-4 mt-4">
                      <div>
                        <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                          Change Summary (English)
                        </Label>
                        <Textarea
                          value={formData.summary.en}
                          onChange={(e) => setFormData({
                            ...formData,
                            summary: {...formData.summary, en: e.target.value}
                          })}
                          placeholder="Brief summary of changes..."
                          rows={2}
                          className={cn(
                            "mt-2",
                            theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                          )}
                        />
                      </div>

                      <div>
                        <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                          Terms of Service (English)
                        </Label>
                        <Textarea
                          value={formData.terms.en}
                          onChange={(e) => setFormData({
                            ...formData,
                            terms: {...formData.terms, en: e.target.value}
                          })}
                          placeholder="<h1>Terms of Service</h1><p>...</p>"
                          rows={10}
                          className={cn(
                            "mt-2 font-mono text-sm",
                            theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                          )}
                        />
                      </div>

                      <div>
                        <Label className={theme === 'dark' ? "text-slate-300" : ""}>
                          Privacy Policy (English)
                        </Label>
                        <Textarea
                          value={formData.privacy.en}
                          onChange={(e) => setFormData({
                            ...formData,
                            privacy: {...formData.privacy, en: e.target.value}
                          })}
                          placeholder="<h1>Privacy Policy</h1><p>...</p>"
                          rows={10}
                          className={cn(
                            "mt-2 font-mono text-sm",
                            theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : ""
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {publishMutation.isError && (
                    <div className={cn(
                      "p-3 rounded-lg flex items-start gap-2",
                      theme === 'dark' ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
                    )}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{publishMutation.error?.message || 'Failed to publish'}</span>
                    </div>
                  )}

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
                          
                          {(version.summary?.he || version.summary?.en) && (
                            <div className={cn(
                              "text-sm mb-3 space-y-1",
                              theme === 'dark' ? "text-slate-300" : "text-gray-700"
                            )}>
                              {version.summary?.he && <p><strong>עברית:</strong> {version.summary.he}</p>}
                              {version.summary?.en && <p><strong>English:</strong> {version.summary.en}</p>}
                            </div>
                          )}

                          <Tabs defaultValue="terms-he" className="mt-3">
                            <TabsList className={cn(
                              "grid w-full grid-cols-4 h-auto",
                              theme === 'dark' ? "bg-slate-950" : "bg-gray-100"
                            )}>
                              <TabsTrigger value="terms-he" className="text-xs">Terms (HE)</TabsTrigger>
                              <TabsTrigger value="terms-en" className="text-xs">Terms (EN)</TabsTrigger>
                              <TabsTrigger value="privacy-he" className="text-xs">Privacy (HE)</TabsTrigger>
                              <TabsTrigger value="privacy-en" className="text-xs">Privacy (EN)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="terms-he">
                              <div className={cn(
                                "mt-2 p-3 rounded border overflow-auto max-h-60 text-xs",
                                theme === 'dark' ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"
                              )}>
                                <div dangerouslySetInnerHTML={{ __html: version.terms?.he || 'N/A' }} />
                              </div>
                            </TabsContent>
                            <TabsContent value="terms-en">
                              <div className={cn(
                                "mt-2 p-3 rounded border overflow-auto max-h-60 text-xs",
                                theme === 'dark' ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"
                              )}>
                                <div dangerouslySetInnerHTML={{ __html: version.terms?.en || 'N/A' }} />
                              </div>
                            </TabsContent>
                            <TabsContent value="privacy-he">
                              <div className={cn(
                                "mt-2 p-3 rounded border overflow-auto max-h-60 text-xs",
                                theme === 'dark' ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"
                              )}>
                                <div dangerouslySetInnerHTML={{ __html: version.privacy?.he || 'N/A' }} />
                              </div>
                            </TabsContent>
                            <TabsContent value="privacy-en">
                              <div className={cn(
                                "mt-2 p-3 rounded border overflow-auto max-h-60 text-xs",
                                theme === 'dark' ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"
                              )}>
                                <div dangerouslySetInnerHTML={{ __html: version.privacy?.en || 'N/A' }} />
                              </div>
                            </TabsContent>
                          </Tabs>
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