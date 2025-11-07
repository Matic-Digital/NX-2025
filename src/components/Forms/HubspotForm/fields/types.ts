// Shared types for HubSpot form fields
export interface HubSpotFormField {
  fieldType: string;
  objectTypeId: string;
  name: string;
  label: string;
  description?: string;
  required: boolean;
  hidden: boolean;
  displayOrder: number;
  options?: Array<{
    label: string;
    value: string;
    displayOrder?: number;
  }>;
  validation?: {
    // Email field validation
    blockedEmailDomains?: string[];
    useDefaultBlockList?: boolean;
    // Phone field validation
    minAllowedDigits?: number;
    maxAllowedDigits?: number;
    // Text field validation
    name?: string;
    message?: string;
    data?: string;
    // Additional HubSpot error messages
    errorMessage?: string;
    invalidMessage?: string;
    requiredErrorMessage?: string;
    formatErrorMessage?: string;
  };
  placeholder?: string;
  defaultValue?: string;
}

export interface FieldRendererProps {
  field: HubSpotFormField;
  value: string | number | boolean | string[] | null | undefined;
  onChange: (value: string | number | boolean | string[] | null | undefined) => void;
  error?: string | string[];
  theme?: 'light' | 'dark';
}

export interface FieldGroup {
  fields: HubSpotFormField[];
  groupType?: 'default' | 'multiselect' | 'radio_group';
  label?: string;
  description?: string;
  required?: boolean;
}

export interface FormContent {
  type: 'text' | 'header' | 'divider' | 'image';
  content?: string;
  level?: number; // for headers (h1, h2, etc.)
  richText?: string;
}

export interface FormStep {
  stepNumber: number;
  stepName?: string;
  fields: HubSpotFormField[];
  fieldGroups: FieldGroup[];
  content?: FormContent[];
  isPageBreak: boolean;
  hasConditionalLogic: boolean;
}

export interface HubSpotFormData {
  formData: unknown;
  steps: FormStep[];
  metadata: {
    totalFields: number;
    totalSteps: number;
    isMultiStep: boolean;
    hasConditionalLogic: boolean;
    requiredFields: string[];
    fieldTypes: string[];
  };
}
