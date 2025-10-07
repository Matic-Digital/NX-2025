import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { HubspotForm } from '@/components/Forms/HubspotForm/HubspotFormSchema';

// ============================================================================
// GRAPHQL FIELDS
// ============================================================================

export const HUBSPOTFORM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  description
  formId
`;

export const HUBSPOTFORM_MINIMAL_FIELDS = `
  sys { id }
  title
  description
  formId
  __typename
`;

/**
 * Extracts form ID from HubSpot form link
 * @param formLink - The HubSpot form link URL
 * @returns The form ID or null if not found
 */
export function extractFormIdFromLink(formLink: string): string | null {
  const regex = /\/([a-f0-9-]+)$/;
  const match = regex.exec(formLink);
  return match?.[1] ?? null;
}

// ============================================================================
// HUBSPOT API TYPES
// ============================================================================

export interface HubSpotFormFieldValidation {
  name: string;
  message: string;
  data: string;
  useDefaultBlockList: boolean;
  blockedEmailAddresses: string[];
  checkPhoneFormat: boolean;
}

export interface HubSpotFormFieldDependentFilter {
  formFieldAction: string;
  formFieldProperty: string;
  operator: string;
  strValue?: string;
  strValues?: string[];
  numberValue?: number;
  boolValue?: boolean;
}

export interface HubSpotFormFieldOption {
  label: string;
  value: string;
  displayOrder?: number;
}

export interface HubSpotFormField {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  description: string;
  groupName: string;
  displayOrder: number;
  required: boolean;
  selectedOptions: unknown[];
  options: HubSpotFormFieldOption[];
  validation: HubSpotFormFieldValidation;
  enabled: boolean;
  hidden: boolean;
  defaultValue: string;
  isSmartField: boolean;
  unselectedLabel: string;
  placeholder: string;
  dependentFieldFilters: HubSpotFormFieldDependentFilter[];
  labelHidden: boolean;
  propertyObjectType: string;
  metaData: Array<{ name: string; value: string }>;
  objectTypeId: string;
}

export interface HubSpotFormFieldGroup {
  fields: HubSpotFormField[];
  default?: boolean;
  isSmartGroup?: boolean;
  isPageBreak?: boolean;
}

export interface HubSpotFormData {
  guid: string;
  name: string;
  formFieldGroups: HubSpotFormFieldGroup[];
  formType: string;
  portalId: number;
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
  cloneable: boolean;
  editable: boolean;
  themeName: string;
  metaData: Array<{
    name: string;
    value: string;
  }>;
  // Legacy support
  id?: string;
  configuration?: {
    language?: string;
    cloneable?: boolean;
    editable?: boolean;
  };
  displayOptions?: {
    renderRawHtml?: boolean;
    theme?: string;
    submitButtonText?: string;
    style?: string;
  };
}

export interface FormStep {
  stepNumber: number;
  fields: HubSpotFormField[];
  isPageBreak: boolean;
}

export interface ParsedFormStructure {
  formId: string;
  formName: string;
  totalSteps: number;
  steps: FormStep[];
  fieldsWithConditionalLogic: HubSpotFormField[];
}

// ============================================================================
// CONTENTFUL API FUNCTIONS
// ============================================================================

export async function getHubspotFormById(id: string, preview = false): Promise<HubspotForm | null> {
  const query = `
    query GetHubspotFormById($id: String!, $preview: Boolean!) {
      hubspotForm(id: $id, preview: $preview) {
        ${HUBSPOTFORM_GRAPHQL_FIELDS}
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, { id, preview });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as {
      hubspotForm?: HubspotForm;
    };

    return data.hubspotForm ?? null;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`getHubspotFormByIdError: fetching HubspotForm: ${error.message}`);
    }
    throw new Error('getHubspotFormById: Unknown error fetching HubspotForm');
  }
}

export async function getHubspotFormsByIds(
  hubspotFormIds: string[],
  preview = false
): Promise<HubspotForm[]> {
  if (hubspotFormIds.length === 0) {
    return [];
  }

  const query = `
    query GetHubspotFormsByIds($ids: [String!]!, $preview: Boolean!) {
      hubspotFormCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${HUBSPOTFORM_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const response = await fetchGraphQL(query, {
      ids: hubspotFormIds,
      preview
    });

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as unknown as {
      hubspotFormCollection?: { items?: HubspotForm[] };
    };

    if (!data.hubspotFormCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch HubspotForms from Contentful');
    }

    return data.hubspotFormCollection.items;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`getHubspotFormsByIdsError: fetching HubspotForms: ${error.message}`);
    }
    throw new Error('getHubspotFormsByIds: Unknown error fetching HubspotForms');
  }
}

// ============================================================================
// HUBSPOT API UTILITY FUNCTIONS
// ============================================================================

// ============================================================================
// FORM PARSING FUNCTIONS
// ============================================================================
const detectFormSteps = (formData: HubSpotFormData): FormStep[] => {
  const allFields = formData.formFieldGroups.flatMap((group) => group.fields);
  const steps: FormStep[] = [];

  // Strategy 1: Look for step indicators in field metadata or properties
  const _fieldsWithStepInfo = allFields.map((field, index) => {
    const stepIndicators = {
      displayOrder: field.displayOrder,
      groupName: field.groupName,
      metaData: field.metaData,
      dependentFieldFilters: field.dependentFieldFilters,
      hidden: field.hidden,
      fieldIndex: index
    };

    return {
      field,
      ...stepIndicators
    };
  });

  // Strategy 2: Detect step changes based on conditional dependencies
  // Fields that depend on other fields might be in different steps
  let currentStepNumber = 1;
  let currentStepFields: HubSpotFormField[] = [];

  allFields.forEach((field, _fieldIndex) => {
    const hasConditionalLogic =
      field.dependentFieldFilters && field.dependentFieldFilters.length > 0;
    const _isHidden = field.hidden;

    // Check if this field should start a new step
    let shouldStartNewStep = false;

    // Rule 1: If field has conditional logic and we already have fields in current step
    if (hasConditionalLogic && currentStepFields.length > 0) {
      shouldStartNewStep = true;
    }

    // Rule 2: Check for page breaks in field groups
    const fieldGroup = formData.formFieldGroups.find((group) =>
      group.fields.some((f) => f.name === field.name)
    );
    if (fieldGroup?.isPageBreak && currentStepFields.length > 0) {
      shouldStartNewStep = true;
    }

    // Rule 3: Look for step patterns in display order or metadata
    // (This could be expanded based on what we find in the API)

    if (shouldStartNewStep) {
      // Finalize current step
      if (currentStepFields.length > 0) {
        steps.push({
          stepNumber: currentStepNumber,
          fields: [...currentStepFields],
          isPageBreak: currentStepNumber > 1
        });

        currentStepNumber++;
        currentStepFields = [];
      }
    }

    // Add field to current step
    currentStepFields.push(field);
  });

  // Finalize the last step
  if (currentStepFields.length > 0) {
    steps.push({
      stepNumber: currentStepNumber,
      fields: [...currentStepFields],
      isPageBreak: currentStepNumber > 1
    });
  }

  // If no steps were created using conditional logic, fall back to single step
  if (steps.length === 0) {
    steps.push({
      stepNumber: 1,
      fields: allFields,
      isPageBreak: false
    });
  }

  return steps;
};

const parseFormStructureComprehensive = (
  primaryFormData: HubSpotFormData,
  allFormData: Record<string, unknown>
): ParsedFormStructure => {
  // Try to detect steps from V3 API structure
  if ((allFormData.v3Form as Record<string, unknown>)?.fieldGroups) {
    return parseV3FormStructure(allFormData.v3Form as Record<string, unknown>, primaryFormData);
  }

  // Try to detect steps from form definition
  if ((allFormData.formDefinition as Record<string, unknown>)?.steps) {
    return parseFormDefinitionStructure(
      allFormData.formDefinition as Record<string, unknown>,
      primaryFormData
    );
  }

  // Try to detect steps from configuration pages
  if ((allFormData.formConfiguration as Record<string, unknown>)?.pages) {
    return parseFormConfigurationStructure(
      allFormData.formConfiguration as Record<string, unknown>,
      primaryFormData
    );
  }

  // Fallback to original parsing
  return parseFormStructure(primaryFormData);
};

const parseV3FormStructure = (
  v3Form: Record<string, unknown>,
  v2Form: HubSpotFormData
): ParsedFormStructure => {
  const steps: FormStep[] = [];

  (v3Form.fieldGroups as Array<Record<string, unknown>>).forEach((group, groupIndex: number) => {
    // Each field group in V3 might represent a step
    if (group.fields && Array.isArray(group.fields) && group.fields.length > 0) {
      // Map V3 fields back to V2 format for consistency
      const v2Fields = (group.fields as Array<Record<string, unknown>>).map((v3Field) => {
        const v2Field = v2Form.formFieldGroups
          .flatMap((g) => g.fields)
          .find((f) => f.name === (v3Field.name as string));
        return v2Field ?? (v3Field as unknown as HubSpotFormField);
      });

      steps.push({
        stepNumber: groupIndex + 1,
        fields: v2Fields,
        isPageBreak: groupIndex > 0
      });
    }
  });

  return createParsedStructure(v2Form, steps);
};

const parseFormDefinitionStructure = (
  formDefinition: Record<string, unknown>,
  v2Form: HubSpotFormData
): ParsedFormStructure => {
  // Implementation would depend on what the definition API returns
  return parseFormStructure(v2Form);
};

const parseFormConfigurationStructure = (
  formConfiguration: Record<string, unknown>,
  v2Form: HubSpotFormData
): ParsedFormStructure => {
  // Implementation would depend on what the configuration API returns
  return parseFormStructure(v2Form);
};

const createParsedStructure = (
  formData: HubSpotFormData,
  steps: FormStep[]
): ParsedFormStructure => {
  const fieldsWithConditionalLogic = steps
    .flatMap((step) => step.fields)
    .filter((field) => field.dependentFieldFilters && field.dependentFieldFilters.length > 0);

  return {
    formId: formData.guid ?? formData.id ?? '',
    formName: formData.name,
    totalSteps: steps.length,
    steps,
    fieldsWithConditionalLogic
  };
};

export function parseFormStructure(formData: HubSpotFormData): ParsedFormStructure {
  const steps = detectFormSteps(formData);

  // Collect all fields with conditional logic
  const fieldsWithConditionalLogic = steps
    .flatMap((step) => step.fields)
    .filter((field) => field.dependentFieldFilters.length > 0);

  return {
    formId: formData.guid ?? formData.id ?? '',
    formName: formData.name,
    totalSteps: steps.length,
    steps,
    fieldsWithConditionalLogic
  };
}

// ============================================================================
// HUBSPOT API FUNCTIONS
// ============================================================================

export async function getHubSpotFormFields(formId: string): Promise<HubSpotFormField[]> {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    throw new Error('HUBSPOT_API_KEY environment variable is not set');
  }

  try {
    const response = await fetch(`https://api.hubapi.com/forms/v2/forms/${formId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    const formData = (await response.json()) as HubSpotFormData;

    // Process form data for field analysis if needed
    // (Debug logging removed for production)

    // Flatten form fields from all field groups
    const fields: HubSpotFormField[] = [];
    formData.formFieldGroups.forEach((group) => {
      fields.push(...group.fields);
    });

    return fields;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching HubSpot form fields: ${error.message}`);
    }
    throw new NetworkError('Unknown error fetching HubSpot form fields');
  }
}

const fetchCompleteFormStructure = async (formId: string): Promise<Record<string, unknown>> => {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    throw new Error('HUBSPOT_API_KEY not available');
  }

  const results: Record<string, unknown> = {
    v2Form: null,
    v3Form: null,
    formDefinition: null,
    formConfiguration: null
  };

  // 1. Try v3 Forms API (newer, more complete)
  try {
    const v3Response = await fetch(`https://api.hubapi.com/marketing/v3/forms/${formId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (v3Response.ok) {
      results.v3Form = await v3Response.json();
    }
  } catch {
    // V3 API not available or failed
  }

  // 2. Try v2 Forms API (legacy but sometimes has different data)
  try {
    const v2Response = await fetch(`https://api.hubapi.com/forms/v2/forms/${formId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (v2Response.ok) {
      results.v2Form = await v2Response.json();
    }
  } catch {
    // V2 API not available or failed
  }

  // 3. Try Forms Definition API (if available)
  try {
    const defResponse = await fetch(`https://api.hubapi.com/forms/v2/forms/${formId}/definition`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (defResponse.ok) {
      results.formDefinition = await defResponse.json();
    }
  } catch {
    // Forms Definition API not available or failed
  }

  // 4. Try Form Configuration API (if available)
  try {
    const configResponse = await fetch(
      `https://api.hubapi.com/forms/v2/forms/${formId}/configuration`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (configResponse.ok) {
      results.formConfiguration = await configResponse.json();
    }
  } catch {
    // Form Configuration API not available or failed
  }

  return results;
};

export async function getHubSpotFormStructure(formId: string): Promise<ParsedFormStructure> {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    throw new Error('HUBSPOT_API_KEY environment variable is not set');
  }

  try {
    // Get comprehensive form data from all available endpoints
    const allFormData = await fetchCompleteFormStructure(formId);

    // Use the most complete data source available
    const primaryFormData = allFormData.v2Form as HubSpotFormData;

    if (!primaryFormData) {
      throw new Error('No form data available from any endpoint');
    }

    // Enhanced parsing with data from multiple sources
    return parseFormStructureComprehensive(primaryFormData, allFormData);
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching HubSpot form structure: ${error.message}`);
    }
    throw new NetworkError('Unknown error fetching HubSpot form structure');
  }
}
