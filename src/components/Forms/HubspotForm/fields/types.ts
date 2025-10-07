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
  };
  placeholder?: string;
  defaultValue?: string;
}

export interface FieldRendererProps {
  field: HubSpotFormField;
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null | undefined) => void;
  error?: string | string[];
}

export interface FormStep {
  stepNumber: number;
  stepName?: string;
  fields: HubSpotFormField[];
  fieldGroups: unknown[];
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
