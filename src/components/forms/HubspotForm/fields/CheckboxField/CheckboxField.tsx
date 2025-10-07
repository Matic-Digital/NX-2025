import React from 'react';

import { Label } from '@/components/ui/label';

import type { FieldRendererProps } from '../types';

export const CheckboxField: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const getCleanLabel = (label: string) => {
    return label.replace(/\s*-\s*\d+$/, '').trim();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          id={field.name}
          type="checkbox"
          checked={Boolean(value ?? false)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded size-4 accent-primary"
        />
        <Label htmlFor={field.name} className="text-sm font-medium">
          {getCleanLabel(field.label)}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {field.description && <p className="text-xs text-gray-600">{field.description}</p>}
      {error && (
        <p className="text-xs text-red-500">
          {Array.isArray(error) ? error.join(', ') : String(error)}
        </p>
      )}
    </div>
  );
};
