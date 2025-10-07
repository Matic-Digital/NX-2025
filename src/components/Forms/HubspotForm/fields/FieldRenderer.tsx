import React from 'react';
import { CheckboxField } from './CheckboxField/CheckboxField';
import { EmailField } from './EmailField/EmailField';
import { NumberField } from './NumberField/NumberField';
import { PhoneField } from './PhoneField/PhoneField';
import { SelectField } from './SelectField/SelectField';
import { TextAreaField } from './TextAreaField/TextAreaField';
import { TextField } from './TextField/TextField';

import type { FieldRendererProps } from './types';

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  switch (field.fieldType) {
    case 'single_line_text':
    case 'text':
    case 'string':
      return <TextField field={field} value={value} onChange={onChange} error={error} />;

    case 'email':
      return <EmailField field={field} value={value} onChange={onChange} error={error} />;

    case 'number':
      return <NumberField field={field} value={value} onChange={onChange} error={error} />;

    case 'mobile_phone':
    case 'phone':
      return <PhoneField field={field} value={value} onChange={onChange} error={error} />;

    case 'select':
    case 'radio':
      return <SelectField field={field} value={value} onChange={onChange} error={error} />;

    case 'textarea':
      return <TextAreaField field={field} value={value} onChange={onChange} error={error} />;

    case 'single_checkbox':
      return <CheckboxField field={field} value={value} onChange={onChange} error={error} />;

    case 'url':
      return <TextField field={field} value={value} onChange={onChange} error={error} />;

    default:
      // Fallback to text field for unknown types
      return <TextField field={field} value={value} onChange={onChange} error={error} />;
  }
};
