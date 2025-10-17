import React from 'react';

import { Label } from '@/components/ui/label';

import type { FieldRendererProps } from '../types';

export const CheckboxField: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <div className="relative flex items-center justify-center">
          <input
            id={field.name}
            type="checkbox"
            checked={Boolean(value ?? false)}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded size-4 appearance-none border border-gray-300 checked:border-primary checked:bg-primary relative"
          />
          {Boolean(value ?? false) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <Label htmlFor={field.name} className="text-sm font-medium flex items-center">
          {field.label}
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
