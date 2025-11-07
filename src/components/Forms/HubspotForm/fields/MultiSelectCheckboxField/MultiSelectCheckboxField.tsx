import React from 'react';
import { cn } from '@/lib/utils';
import type { FieldRendererProps } from '../types';

export const MultiSelectCheckboxField: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  theme = 'dark'
}) => {
  
  // Utility function to strip HTML tags from labels
  const stripHtmlTags = (html: string): string => {
    const cleaned = html.replace(/<[^>]*>/g, '').trim();
    return cleaned;
  };
  
  // Handle array values for multiselect - convert all values to strings
  const selectedValues: string[] = Array.isArray(value) 
    ? value.map(v => String(v)) 
    : (value ? [String(value)] : []);

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    let newValues: string[];
    
    if (checked) {
      // Add value if not already present
      newValues = selectedValues.includes(optionValue) 
        ? selectedValues 
        : [...selectedValues, optionValue];
    } else {
      // Remove value
      newValues = selectedValues.filter(v => v !== optionValue);
    }
    
    // Always return array for multiselect fields
    onChange(newValues);
  };

  const labelClasses = cn(
    'text-sm font-medium leading-5',
    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
  );

  const descriptionClasses = cn(
    'text-xs mt-1',
    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  );

  const errorClasses = cn(
    'text-xs mt-1',
    theme === 'dark' ? 'text-red-400' : 'text-red-600'
  );

  return (
    <div className="space-y-3">
      {/* Field Label */}
      <div>
        <label className={labelClasses}>
          {stripHtmlTags(field.label)}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.description && (
          <p className={descriptionClasses}>{field.description}</p>
        )}
      </div>

      {/* Checkbox Options - 2 Column Grid */}
      <div className="grid grid-cols-2 gap-3">
        {field.options?.map((option, index) => {
          const isChecked = selectedValues.includes(option.value);
          
          return (
            <div key={option.value || index} className="flex items-start space-x-2">
              <div className="relative flex items-center justify-center">
                <input
                  id={`${field.name}-${option.value || index}`}
                  name={field.name}
                  type="checkbox"
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                  className="rounded size-4 appearance-none border border-gray-300 checked:border-primary checked:bg-primary relative"
                  aria-describedby={error ? `${field.name}-error` : undefined}
                />
                {isChecked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <label
                htmlFor={`${field.name}-${option.value || index}`}
                className="text-sm font-medium flex items-center cursor-pointer"
              >
                {stripHtmlTags(option.label)}
              </label>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div id={`${field.name}-error`} className={errorClasses}>
          {Array.isArray(error) ? error.join(', ') : error}
        </div>
      )}
    </div>
  );
};
