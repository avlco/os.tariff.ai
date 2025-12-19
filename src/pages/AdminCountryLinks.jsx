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
  Upload,
  Square,
  CheckSquare
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
import ImportProgressDialog from '@/components/admin/ImportProgressDialog';

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
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [importProgress, setImportProgress] = useState({
    open: false,
    progress: 0,
    total: 0,
    status: 'idle',
    errors: [],
    successCount: 0
  });
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

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.CountryLink.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['countryLinks']);
      setSelectedCountries([]);
    }
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

  const handleSelectAll = () => {
    if (selectedCountries.length === filteredCountries.length) {
      setSelectedCountries([]);
    } else {
      const allCountryIds = filteredCountries
        .map(country => countryLinks.find(c => c.country === country)?.id)
        .filter(Boolean);
      setSelectedCountries(allCountryIds);
    }
  };

  const handleSelectCountry = (countryId) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedCountries.length > 0 && confirm(`Delete ${selectedCountries.length} selected countries?`)) {
      deleteMultipleMutation.mutate(selectedCountries);
    }
  };

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

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }
      
      if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        i++;
        continue;
      }
      
      current += char;
      i++;
    }
    
    result.push(current);
    return result;
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        
        // Split by newlines but handle quoted newlines
        const allLines = [];
        let currentLine = '';
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              currentLine += '""';
              i++;
              continue;
            }
            inQuotes = !inQuotes;
          }
          
          if ((char === '\n' || char === '\r') && !inQuotes) {
            if (currentLine.trim()) {
              allLines.push(currentLine);
            }
            currentLine = '';
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
            continue;
          }
          
          currentLine += char;
        }
        
        if (currentLine.trim()) {
          allLines.push(currentLine);
        }
        
        // Remove header
        const rows = allLines.slice(1);
        
        setImportProgress({
          open: true,
          progress: 0,
          total: rows.length,
          status: 'importing',
          errors: [],
          successCount: 0
        });

        let successCount = 0;
        const errors = [];
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNumber = i + 2;
          
          try {
            const columns = parseCSVLine(row);

            if (columns.length < 9) {
              errors.push({ row: rowNumber, message: `מספר עמודות: ${columns.length} במקום 9` });
              continue;
            }

            const [no, country, hsCode, customLinks, regLinks, tradeLinks, govLinks, regionalAgreements, notes] = columns;
            
            if (!country || !country.trim()) {
              errors.push({ row: rowNumber, message: 'שם מדינה חסר' });
              continue;
            }

            const parseLinks = (linkStr) => {
              if (!linkStr || !linkStr.trim()) return [];
              return linkStr.split(';').map(link => {
                const colonIndex = link.indexOf(':');
                if (colonIndex === -1) return null;
                const label = link.substring(0, colonIndex).trim();
                const url = link.substring(colonIndex + 1).trim();
                return (label && url) ? { label, url } : null;
              }).filter(Boolean);
            };

            const data = {
              country: country.trim(),
              hs_code_digit_structure: hsCode?.trim() || '',
              custom_links: parseLinks(customLinks),
              regulation_links: parseLinks(regLinks),
              trade_agreement_links: parseLinks(tradeLinks),
              government_trade_links: parseLinks(govLinks),
              regional_agreements_parties: regionalAgreements?.trim() || '',
              notes: notes?.trim() || ''
            };

            const existing = countryLinks.find(c => c.country === data.country);
            if (existing) {
              await updateMutation.mutateAsync({ id: existing.id, data });
            } else {
              await createMutation.mutateAsync(data);
            }
            
            successCount++;
          } catch (error) {
            errors.push({ row: rowNumber, message: error.message || 'שגיאה בייבוא שורה' });
          }
          
          setImportProgress(prev => ({
            ...prev,
            progress: i + 1,
            successCount,
            errors
          }));
        }
        
        setImportProgress(prev => ({
          ...prev,
          status: 'completed',
          successCount,
          errors
        }));
        
        queryClient.invalidateQueries(['countryLinks']);
      } catch (error) {
        setImportProgress(prev => ({
          ...prev,
          status: 'error',
          errors: [{ row: 0, message: error.message }]
        }));
      }
    };
    
    reader.onerror = () => {
      setImportProgress({
        open: true,
        progress: 0,
        total: 0,
        status: 'error',
        errors: [{ row: 0, message: 'שגיאה בקריאת הקובץ' }],
        successCount: 0
      });
    };
    
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
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
            "border shadow-sm",
            theme === 'dark' ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200"
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
                  {selectedCountries.length > 0 && (
                    <Button 
                      onClick={handleDeleteSelected}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedCountries.length})
                    </Button>
                  )}
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
                    className="bg-[#114B5F] hover:bg-[#0d3a47] text-white shadow-md"
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
                      <TableHead className={cn("font-medium text-xs uppercase w-12", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                        <button onClick={handleSelectAll} className="hover:opacity-70">
                          {selectedCountries.length === filteredCountries.filter(c => countryLinks.find(cl => cl.country === c)).length && selectedCountries.length > 0 ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </TableHead>
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
                              theme === 'dark' ? "border-slate-700/50" : "border-gray-200/50",
                              selectedCountries.includes(countryData?.id) && "bg-blue-50 dark:bg-blue-900/20"
                            )}
                          >
                            <TableCell className="w-12">
                              {countryData && (
                                <button 
                                  onClick={() => handleSelectCountry(countryData.id)}
                                  className="hover:opacity-70"
                                >
                                  {selectedCountries.includes(countryData.id) ? (
                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{idx + 1}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[var(--primary-teal)]" />
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
              <Button onClick={handleSave} className="bg-[#114B5F] hover:bg-[#0d3a47] text-white shadow-md">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImportProgressDialog
        open={importProgress.open}
        onClose={() => setImportProgress(prev => ({ ...prev, open: false }))}
        progress={importProgress.progress}
        total={importProgress.total}
        status={importProgress.status}
        errors={importProgress.errors}
        successCount={importProgress.successCount}
      />
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