import React from 'react';
import { CheckboxField } from './CheckboxField/CheckboxField';
import { EmailField } from './EmailField/EmailField';
import { MultiSelectCheckboxField } from './MultiSelectCheckboxField/MultiSelectCheckboxField';
import { NumberField } from './NumberField/NumberField';
import { PhoneField } from './PhoneField/PhoneField';
import { RichTextField } from './RichTextField/RichTextField';
import { SelectField } from './SelectField/SelectField';
import { TextAreaField } from './TextAreaField/TextAreaField';
import { TextField } from './TextField/TextField';

import type { FieldRendererProps } from './types';

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  theme = 'dark'
}) => {
  // First check for explicit multiselect checkbox field types
  if (field.fieldType === 'checkbox' || 
      field.fieldType === 'checkboxes' || 
      field.fieldType === 'multi_checkbox' ||
      field.fieldType === 'multiselect_checkbox' ||
      field.fieldType === 'multiple_checkboxes' ||
      field.fieldType === 'multi_select_checkbox' ||
      field.fieldType === 'checkbox_group') {
    return (
      <MultiSelectCheckboxField field={field} value={value} onChange={onChange} error={error} theme={theme} />
    );
  }

  // Handle fields with options (could be select or multiselect)
  if (field.options && field.options.length > 0) {
    // Check for additional multiselect indicators
    if (field.fieldType.toLowerCase().includes('checkbox') || 
        field.fieldType.toLowerCase().includes('multi') ||
        field.fieldType.toLowerCase().includes('multiple')) {
      return (
        <MultiSelectCheckboxField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );
    }
    // Otherwise treat as select field
    return (
      <SelectField field={field} value={value} onChange={onChange} error={error} theme={theme} />
    );
  }

  switch (field.fieldType) {
    case 'single_line_text':
    case 'text':
    case 'string':
      return (
        <TextField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );

    case 'email':
      return (
        <EmailField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );

    case 'number':
      return (
        <NumberField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );

    case 'mobile_phone':
    case 'phone':
      return (
        <PhoneField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );

    case 'select':
    case 'radio':
    case 'dropdown':
    case 'enumeration':
    case 'picklist':
      return (
        <SelectField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );

    case 'textarea':
      return (
        <TextAreaField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          theme={theme}
        />
      );

    case 'single_checkbox':
    case 'booleancheckbox':
    case 'boolean':
      return (
        <CheckboxField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          theme={theme}
        />
      );

    case 'checkbox':
    case 'checkboxes':
    case 'multi_checkbox':
    case 'multiselect_checkbox':
    case 'multiple_checkboxes':
      return (
        <MultiSelectCheckboxField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          theme={theme}
        />
      );

    case 'url':
      return (
        <TextField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );

    case 'rich_text':
      return (
        <RichTextField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          theme={theme}
        />
      );

    default:
      // Fallback to text field for unknown types
      return (
        <TextField field={field} value={value} onChange={onChange} error={error} theme={theme} />
      );
  }
};
