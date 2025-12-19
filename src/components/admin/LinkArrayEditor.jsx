import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from './LanguageContext';

export default function LinkArrayEditor({ label, links, onChange }) {
  const { theme } = useLanguage();

  const addLink = () => {
    onChange([...(links || []), { label: '', url: '' }]);
  };

  const updateLink = (index, field, value) => {
    const updated = [...(links || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeLink = (index) => {
    onChange((links || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={addLink}>
          <Plus className="w-4 h-4 mr-1" />
          Add Link
        </Button>
      </div>
      {(links || []).map((link, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Label"
              value={link.label}
              onChange={(e) => updateLink(idx, 'label', e.target.value)}
              className={cn(theme === 'dark' ? "bg-slate-700 border-slate-600" : "")}
            />
            <Input
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(idx, 'url', e.target.value)}
              className={cn(theme === 'dark' ? "bg-slate-700 border-slate-600" : "")}
            />
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={() => removeLink(idx)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
}