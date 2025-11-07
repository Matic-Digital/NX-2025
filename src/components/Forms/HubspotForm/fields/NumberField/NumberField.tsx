import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { FieldRendererProps } from '../types';

export const NumberField: React.FC<FieldRendererProps> = ({
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

  const textClass = theme === 'light' ? 'text-black' : 'text-text-on-invert';
  const placeholderClass =
    theme === 'light' ? 'placeholder:text-black' : 'placeholder:text-text-on-invert';

  return (
    <div className="flex flex-col space-y-[0.5rem]">
      <Label
        htmlFor={field.name}
        className={`${textClass} text-[1rem] font-normal leading-[120%] tracking-[0.002rem]`}
      >
        {getCleanLabel(field.label)}
        {field.required && <span className={`${textClass} ml-1`}>*</span>}
      </Label>
      <Input
        id={field.name}
        type="number"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.valueAsNumber || '')}
        placeholder={field.placeholder ?? `Enter ${getCleanLabel(field.label).toLowerCase()}`}
        className={`${textClass} ${placeholderClass} ${error ? 'border-red-500' : ''}`}
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
