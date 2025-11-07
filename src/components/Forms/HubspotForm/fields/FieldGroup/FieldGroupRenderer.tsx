import React from 'react';
import { cn } from '@/lib/utils';
import { FieldRenderer } from '../FieldRenderer';
import type { FieldGroup, HubSpotFormField } from '../types';

interface FieldGroupRendererProps {
  group: FieldGroup;
  values: Record<string, unknown>;
  onChange: (fieldName: string, value: string | number | boolean | string[] | null | undefined) => void;
  errors: Record<string, string | string[]>;
  theme?: 'light' | 'dark';
}

export const FieldGroupRenderer: React.FC<FieldGroupRendererProps> = ({
  group,
  values,
  onChange,
  errors,
  theme = 'dark'
}) => {
  const textClass = theme === 'light' ? 'text-gray-900' : 'text-gray-200';
  const mutedTextClass = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

  // Handle multiselect checkbox groups specially
  if (group.groupType === 'multiselect') {
    // If it's a single field that already has options, use it directly
    if (group.fields.length === 1 && group.fields[0]?.options?.length) {
      const field = group.fields[0];
      const multiselectField: HubSpotFormField = {
        ...field,
        fieldType: 'multiselect_checkbox', // Force multiselect type
      };

      return (
        <div className="space-y-2">
          <FieldRenderer
            field={multiselectField}
            value={values[field.name] as string | number | boolean | string[] | null | undefined}
            onChange={(value) => onChange(field.name, value)}
            error={errors[field.name]}
            theme={theme}
          />
        </div>
      );
    }

    // For multiple fields, combine them into a single multiselect component
    const multiselectField: HubSpotFormField = {
      fieldType: 'multiselect_checkbox',
      objectTypeId: group.fields[0]?.objectTypeId || '',
      name: group.fields[0]?.name || 'multiselect_group',
      label: group.label || group.fields[0]?.label || 'Select Options',
      description: group.description || group.fields[0]?.description,
      required: group.required || group.fields.some(f => f.required),
      hidden: false,
      displayOrder: group.fields[0]?.displayOrder || 0,
      options: group.fields.map((field, index) => ({
        label: field.label,
        value: field.name,
        displayOrder: field.displayOrder || index
      }))
    };

    // Combine values from all fields in the group
    const groupValue = group.fields
      .map(field => values[field.name])
      .filter(Boolean)
      .flat() as string[];

    const handleGroupChange = (newValue: string | number | boolean | string[] | null | undefined) => {
      const selectedValues = Array.isArray(newValue) ? newValue : (newValue ? [String(newValue)] : []);
      
      // Update each field in the group based on whether its name is in the selected values
      group.fields.forEach(field => {
        const isSelected = selectedValues.includes(field.name);
        onChange(field.name, isSelected ? field.name : null);
      });
    };

    // Combine errors from all fields in the group
    const groupErrors = group.fields
      .map(field => errors[field.name])
      .filter((error): error is string | string[] => Boolean(error))
      .flat()
      .filter((error): error is string => typeof error === 'string');

    return (
      <div className="space-y-2">
        <FieldRenderer
          field={multiselectField}
          value={groupValue}
          onChange={handleGroupChange}
          error={groupErrors.length > 0 ? groupErrors : undefined}
          theme={theme}
        />
      </div>
    );
  }

  // For other group types or default groups, render fields individually
  return (
    <div className="space-y-4">
      {group.label && (
        <div>
          <h3 className={cn('text-lg font-medium mb-2', textClass)}>
            {group.label}
            {group.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {group.description && (
            <p className={cn('text-sm mb-4', mutedTextClass)}>
              {group.description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {group.fields
          .filter(field => !field.hidden)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map(field => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={values[field.name] as string | number | boolean | string[] | null | undefined}
              onChange={(value) => onChange(field.name, value)}
              error={errors[field.name]}
              theme={theme}
            />
          ))}
      </div>
    </div>
  );
};
