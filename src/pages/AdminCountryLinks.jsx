import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '@/components/admin/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Globe,
  Download,
  Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import LinkArrayEditor from '@/components/admin/LinkArrayEditor';

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", 
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", 
  "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
  "Brazil", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", 
  "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", 
  "Congo (Republic of the)", "Cook Islands", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Curaçao", 
  "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", 
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", 
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea‑Bissau", "Guyana", "Haiti", "Honduras", 
  "Hong Kong, China", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", 
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Korea (Republic of)", "Kosovo", "Kuwait", "Kyrgyzstan", "Lao PDR", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau, China", "Madagascar", "Malawi", 
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritius", "Mauritania", "Mexico", 
  "Micronesia", "Moldova", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nepal", 
  "Netherlands", "New Caledonia (French Terr.)", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", 
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", 
  "Paraguay", "Peru", "Philippines", "Poland", "Polynesia (French Terr.)", "Portugal", "Qatar", "Romania", 
  "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon", 
  "Saint Vincent and the Grenadines", "Samoa", "Sao Tome and Principe", "Saudi Arabia", "Senegal", 
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
  "Syrian Arab Republic", "Tajikistan", "Tanzania", "Thailand", "Timor‑Leste", "Togo", "Tonga", 
  "Trinidad and Tobago", "Tunisia", "Türkiye", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "Union of Myanmar", "United Arab Emirates", "United Kingdom", "USA", "Uruguay", "Uzbekistan", "Vanuatu", 
  "Venezuela", "Viet Nam", "Wallis and Futuna", "Yemen", "Zambia", "Zimbabwe"
];

function CountryLinksContent() {
  const { t, theme, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    hs_code_digit_structure: '',
    custom_links: [],
    regulation_links: [],
    trade_agreement_links: [],
    government_trade_links: [],
    regional_agreements_parties: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: countryLinks = [], isLoading } = useQuery({
    queryKey: ['countryLinks'],
    queryFn: () => base44.entities.CountryLink.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CountryLink.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['countryLinks']);
      setIsEditing(false);
      setFormData({
        country: '',
        hs_code_digit_structure: '',
        custom_links: [],
        regulation_links: [],
        trade_agreement_links: [],
        government_trade_links: [],
        regional_agreements_parties: '',
        notes: ''
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CountryLink.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['countryLinks']);
      setIsEditing(false);
      setSelectedCountry(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CountryLink.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['countryLinks'])
  });

  const handleEdit = (country) => {
    setSelectedCountry(country);
    setFormData(country);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedCountry) {
      updateMutation.mutate({ id: selectedCountry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const headers = ['No', 'Country', 'HS-Code Digit Structure', 'Custom Links', 'Regulation Links', 'Trade Agreements Links', 'Government Trade Links', 'Regional Agreements - parties', 'Notes'];
    
    const csvData = filteredCountries.map((country, idx) => {
      const countryData = countryLinks.find(c => c.country === country);
      return [
        idx + 1,
        country,
        countryData?.hs_code_digit_structure || '',
        countryData?.custom_links?.map(l => `${l.label}: ${l.url}`).join('; ') || '',
        countryData?.regulation_links?.map(l => `${l.label}: ${l.url}`).join('; ') || '',
        countryData?.trade_agreement_links?.map(l => `${l.label}: ${l.url}`).join('; ') || '',
        countryData?.government_trade_links?.map(l => `${l.label}: ${l.url}`).join('; ') || '',
        countryData?.regional_agreements_parties || '',
        countryData?.notes || ''
      ];
    });

    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'country_links.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      const rows = text.split('\n').slice(1); // Skip header
      
      for (const row of rows) {
        if (!row.trim()) continue;
        
        const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(col => col.replace(/^"|"$/g, '').trim());
        if (!columns || columns.length < 9) continue;

        const [no, country, hsCode, customLinks, regLinks, tradeLinks, govLinks, regionalAgreements, notes] = columns;
        
        const parseLinks = (linkStr) => {
          if (!linkStr) return [];
          return linkStr.split(';').map(link => {
            const [label, url] = link.split(':').map(s => s.trim());
            return url ? { label: label || '', url } : null;
          }).filter(Boolean);
        };

        const data = {
          country: country || '',
          hs_code_digit_structure: hsCode || '',
          custom_links: parseLinks(customLinks),
          regulation_links: parseLinks(regLinks),
          trade_agreement_links: parseLinks(tradeLinks),
          government_trade_links: parseLinks(govLinks),
          regional_agreements_parties: regionalAgreements || '',
          notes: notes || ''
        };

        const existing = countryLinks.find(c => c.country === country);
        if (existing) {
          await updateMutation.mutateAsync({ id: existing.id, data });
        } else {
          await createMutation.mutateAsync(data);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      theme === 'dark' ? "bg-slate-900" : "bg-gray-50",
      isRTL ? "rtl" : "ltr"
    )}>
      <AdminSidebar currentPage="AdminCountryLinks" collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? (isRTL ? "mr-16" : "ml-16") : (isRTL ? "mr-64" : "ml-64")
      )}>
        <AdminHeader title={t('dbLinks')} />
        
        <main className={cn(
          "p-8",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50",
          "min-h-screen"
        )}>
          <Card className={cn(
            "border",
            theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200/50"
          )}>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
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
                <div className="flex gap-2">
                  <Button 
                    onClick={handleExport}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => document.getElementById('import-file').click()}
                    variant="outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                  <input 
                    id="import-file" 
                    type="file" 
                    accept=".csv" 
                    onChange={handleImport} 
                    className="hidden" 
                  />
                  <Button 
                    onClick={() => {
                      setSelectedCountry(null);
                      setFormData({
                        country: '',
                        hs_code_digit_structure: '',
                        custom_links: [],
                        regulation_links: [],
                        trade_agreement_links: [],
                        government_trade_links: [],
                        regional_agreements_parties: '',
                        notes: ''
                      });
                      setIsEditing(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Country
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={theme === 'dark' ? "border-slate-700/50" : "border-gray-200/50"}>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>No</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Country</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>HS-Code Structure</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Custom Links</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Regulation Links</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Trade Agreements</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Gov. Trade Links</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Regional Agreements</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Notes</TableHead>
                      <TableHead className={cn("font-medium text-xs uppercase", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          {t('loading')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCountries.map((country, idx) => {
                        const countryData = countryLinks.find(c => c.country === country);
                        return (
                          <TableRow 
                            key={country}
                            className={cn(
                              theme === 'dark' ? "border-slate-700/50" : "border-gray-200/50"
                            )}
                          >
                            <TableCell className="text-sm">{idx + 1}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-500" />
                                {country}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {countryData?.hs_code_digit_structure || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {countryData?.custom_links?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {countryData.custom_links.slice(0, 2).map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener" className="text-indigo-600 hover:underline text-xs flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" />
                                      {link.label || link.url}
                                    </a>
                                  ))}
                                  {countryData.custom_links.length > 2 && <span className="text-xs text-gray-500">+{countryData.custom_links.length - 2} more</span>}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {countryData?.regulation_links?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {countryData.regulation_links.slice(0, 2).map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener" className="text-indigo-600 hover:underline text-xs flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" />
                                      {link.label || link.url}
                                    </a>
                                  ))}
                                  {countryData.regulation_links.length > 2 && <span className="text-xs text-gray-500">+{countryData.regulation_links.length - 2} more</span>}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {countryData?.trade_agreement_links?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {countryData.trade_agreement_links.slice(0, 2).map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener" className="text-indigo-600 hover:underline text-xs flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" />
                                      {link.label || link.url}
                                    </a>
                                  ))}
                                  {countryData.trade_agreement_links.length > 2 && <span className="text-xs text-gray-500">+{countryData.trade_agreement_links.length - 2} more</span>}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {countryData?.government_trade_links?.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {countryData.government_trade_links.slice(0, 2).map((link, i) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener" className="text-indigo-600 hover:underline text-xs flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" />
                                      {link.label || link.url}
                                    </a>
                                  ))}
                                  {countryData.government_trade_links.length > 2 && <span className="text-xs text-gray-500">+{countryData.government_trade_links.length - 2} more</span>}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm max-w-xs truncate">
                              {countryData?.regional_agreements_parties || '-'}
                            </TableCell>
                            <TableCell className="text-sm max-w-xs truncate">
                              {countryData?.notes || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => countryData ? handleEdit(countryData) : handleEdit({ country })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {countryData && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteMutation.mutate(countryData.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          theme === 'dark' ? "bg-slate-800 text-white" : ""
        )}>
          <DialogHeader>
            <DialogTitle>
              {selectedCountry ? `Edit ${formData.country}` : 'Add Country Links'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                disabled={!!selectedCountry}
                className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}
              />
            </div>
            <div>
              <Label>HS Code Digit Structure</Label>
              <Input
                value={formData.hs_code_digit_structure}
                onChange={(e) => setFormData({...formData, hs_code_digit_structure: e.target.value})}
                placeholder="e.g., 6 digits"
                className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}
              />
            </div>

            <LinkArrayEditor
              label="Custom Links"
              links={formData.custom_links}
              onChange={(links) => setFormData({...formData, custom_links: links})}
            />

            <LinkArrayEditor
              label="Regulation Links"
              links={formData.regulation_links}
              onChange={(links) => setFormData({...formData, regulation_links: links})}
            />

            <LinkArrayEditor
              label="Trade Agreement Links"
              links={formData.trade_agreement_links}
              onChange={(links) => setFormData({...formData, trade_agreement_links: links})}
            />

            <LinkArrayEditor
              label="Government Trade Links"
              links={formData.government_trade_links}
              onChange={(links) => setFormData({...formData, government_trade_links: links})}
            />

            <div>
              <Label>Regional Agreements Parties</Label>
              <Input
                value={formData.regional_agreements_parties}
                onChange={(e) => setFormData({...formData, regional_agreements_parties: e.target.value})}
                className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className={theme === 'dark' ? "bg-slate-700 border-slate-600" : ""}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCountryLinks() {
  return (
    <LanguageProvider>
      <CountryLinksContent />
    </LanguageProvider>
  );
}