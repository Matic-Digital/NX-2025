import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { FieldRendererProps } from '../types';

export const PhoneField: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  theme = 'dark'
}) => {
  const getCleanLabel = (label: string) => {
    // Strip HTML tags and trailing numbers
    return label.replace(/<[^>]*>/g, '').replace(/\s*-\s*\d+$/, '').trim();
  };

  const labelClass = theme === 'light' ? 'text-gray-900' : 'text-white';
  const inputClass =
    theme === 'light'
      ? 'text-gray-900 bg-white border-gray-300 placeholder:text-gray-500'
      : 'text-white bg-gray-800 border-gray-600 placeholder:text-gray-400';

  return (
    <div className="flex flex-col space-y-[0.5rem]">
      <Label
        htmlFor={field.name}
        className={`${labelClass} text-[1rem] font-normal leading-[120%] tracking-[0.002rem]`}
      >
        {getCleanLabel(field.label)}
        {field.required && <span className={`${labelClass} ml-1`}>*</span>}
      </Label>
      <Input
        id={field.name}
        type="tel"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? 'Enter your phone number'}
        className={`${inputClass} ${error ? 'border-red-500' : ''}`}
      />
      {field.description && <p className="text-xs text-gray-600">{field.description}</p>}
      {error && (
        <p className="text-xs text-red-500">
          {Array.isArray(error) ? error.join(', ') : String(error)}
        </p>
      )}
    </div>
  );
};
