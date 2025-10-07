import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '../types';

export const EmailField: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const getCleanLabel = (label: string) => {
    return label.replace(/\s*-\s*\d+$/, '').trim();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {getCleanLabel(field.label)}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.name}
        type="email"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? 'Enter your email'}
        className={error ? 'border-red-500' : ''}
      />
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
