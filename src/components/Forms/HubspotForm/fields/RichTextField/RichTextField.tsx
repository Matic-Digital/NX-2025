import React from 'react';

import type { FieldRendererProps } from '../types';

export const RichTextField: React.FC<FieldRendererProps> = ({
  field,
  value: _value,
  onChange: _onChange,
  error: _error,
  theme = 'dark'
}) => {
  // Rich text fields are informational only (no input needed)
  // They display HTML content from the description
  if (!field.description) return null;

  const textClass = theme === 'light' ? 'text-black' : 'text-text-on-invert';

  return (
    <div className="flex flex-col space-y-[0.5rem]">
      {field.label && (
        <div className={`${textClass} text-[1rem] font-normal leading-[120%] tracking-[0.002rem]`}>
          {field.label}
        </div>
      )}
      <div
        className={`${textClass} text-[1rem] font-normal leading-[120%] tracking-[0.002rem]`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: field.description }}
      />
    </div>
  );
};
