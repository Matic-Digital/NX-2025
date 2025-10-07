import React from 'react';

import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';

import { Box } from '@/components/global/matic-ds';

import type { FieldRendererProps } from '../types';

export const EmailField: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <Box direction="col" gap={2} className="space-y-4">
      <Input
        id={field.name}
        type="email"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? 'Enter your email'}
        className={cn('bg-white text-text-input', error && 'border-red-500')}
      />
      {field.description && <p className="text-xs text-gray-600">{field.description}</p>}
      {error && (
        <p className="text-xs text-red-500">
          {Array.isArray(error) ? error.join(', ') : String(error)}
        </p>
      )}
    </Box>
  );
};
