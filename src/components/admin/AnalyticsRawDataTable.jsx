import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from './LanguageContext';
import DataTable from './DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function AnalyticsRawDataTable({
  filteredPageViews,
  filteredUserActions,
  filteredConversions,
  filteredExternalEvents,
}) {
  const { t, theme } = useLanguage();
  const [selectedEntityType, setSelectedEntityType] = useState('ArchivedPageView');
  const [columns, setColumns] = useState([]);

  const entityMap = {
    ArchivedPageView: { data: filteredPageViews, translationKey: 'pageViewsData' },
    ArchivedUserAction: { data: filteredUserActions, translationKey: 'userActionsData' },
    ArchivedConversion: { data: filteredConversions, translationKey: 'conversionsData' },
    ArchivedAnalyticsEvent: { data: filteredExternalEvents, translationKey: 'analyticsEventsData' },
  };

  const currentData = entityMap[selectedEntityType]?.data || [];

  useEffect(() => {
    const fetchSchemaAndSetColumns = async () => {
      try {
        const schema = await base44.entities[selectedEntityType].schema();
        const newColumns = Object.keys(schema.properties).map(key => ({
          accessorKey: key,
          header: key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
          cell: ({ getValue }) => {
            const value = getValue();
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value);
            }
            return String(value || '');
          }
        }));
        
        newColumns.unshift(
          { accessorKey: 'id', header: 'ID' },
          { 
            accessorKey: 'created_date', 
            header: 'Created Date', 
            cell: ({ getValue }) => new Date(getValue()).toLocaleString() 
          },
          { 
            accessorKey: 'updated_date', 
            header: 'Updated Date', 
            cell: ({ getValue }) => new Date(getValue()).toLocaleString() 
          },
          { accessorKey: 'created_by', header: 'Created By' }
        );

        setColumns(newColumns);
      } catch (error) {
        console.error(`Failed to fetch schema for ${selectedEntityType}:`, error);
        setColumns([]);
      }
    };

    fetchSchemaAndSetColumns();
  }, [selectedEntityType]);

  return (
    <div className={cn(
      "space-y-6",
      theme === 'dark' ? "text-white" : "text-gray-900"
    )}>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">{t('selectDataType')}:</label>
        <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
          <SelectTrigger className={cn(
            "w-[250px]",
            theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : ""
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(entityMap).map(entityType => (
              <SelectItem key={entityType} value={entityType}>
                {t(entityMap[entityType].translationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={currentData}
        isLoading={false}
        noDataMessage={t('noData')}
      />
    </div>
  );
}