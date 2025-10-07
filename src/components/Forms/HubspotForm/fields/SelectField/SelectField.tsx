import React from 'react';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '../types';

export const SelectField: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const getCleanLabel = (label: string) => {
    return label.replace(/\s*-\s*\d+$/, '').trim();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {getCleanLabel(field.label)}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <select
        id={field.name}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select an option</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {field.description && (
        <p className="text-xs text-gray-600">{field.description}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">
          {Array.isArray(error) ? error.join(', ') : String(error)}
        </p>
      )}
    </div>
  );
};
