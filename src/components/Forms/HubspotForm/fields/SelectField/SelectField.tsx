import React from 'react';
import { Label } from '@/components/ui/label';
import type { FieldRendererProps } from '../types';

export const SelectField: React.FC<FieldRendererProps> = ({ field, value, onChange, error, theme = 'dark' }) => {
  const getCleanLabel = (label: string) => {
    return label.replace(/\s*-\s*\d+$/, '').trim();
  };


  const textClass = theme === 'light' ? 'text-black' : 'text-text-on-invert';

  return (
    <div className="flex flex-col space-y-[0.5rem]">
      <Label htmlFor={field.name} className={`${textClass} text-[1rem] font-normal leading-[120%] tracking-[0.002rem]`}>
        {getCleanLabel(field.label)}
        {field.required && <span className={`${textClass} ml-1`}>*</span>}
      </Label>
      <select
        id={field.name}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className={`flex flex-col p-[1rem] border border-[#d4d4d4] rounded-[0.125rem] w-full ${textClass} ${
          error ? 'border-red-500' : ''
        }`}
      >
        <option value="" className="bg-white text-black">
          {field.placeholder ?? `Select ${getCleanLabel(field.label).toLowerCase()}`}
        </option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-black">
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
