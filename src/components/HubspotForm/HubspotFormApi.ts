import { fetchGraphQL } from '../../lib/api';
import { SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import type { HubspotForm } from '@/components/HubspotForm/HubspotFormSchema';
import { ContentfulError, NetworkError } from '../../lib/errors';

// HubSpot API Types (based on actual API response)
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
  isPageBreak?: boolean; // Key for multi-step detection
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

// Parsed form structure for easier consumption
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

// Define minimal hubspot form fields for references
export const HUBSPOTFORM_MINIMAL_FIELDS = `
  sys { id }
  title
  formLink
  __typename
`;

// Define full hubspot form fields
export const HUBSPOTFORM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  formLink
`;

/**
 * Fetches hubspot form by ID from Contentful
 * @param id - The ID of the hubspot form to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the hubspot form or null if not found
 */
export const getHubspotFormById = async (
  id: string,
  preview = false
): Promise<{ item: HubspotForm | null }> => {
  try {
    const response = await fetchGraphQL<{ hubspotForm: HubspotForm }>(
      `
      query GetHubspotFormById($preview: Boolean!, $id: String!) {
        hubspotForm(id: $id, preview: $preview) {
          ${HUBSPOTFORM_GRAPHQL_FIELDS}
        }
      }
    `,
      { id, preview },
      preview
    );

    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    const data = response.data as { hubspotForm: HubspotForm | null };

    return {
      item: data.hubspotForm ?? null
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching hubspot form by ID: ${error.message}`);
    }
    throw new NetworkError('Unknown error fetching hubspot form');
  }
};

/**
 * Extracts form ID from HubSpot form link
 * @param formLink - The HubSpot form link URL
 * @returns The form ID or null if not found
 */
export const extractFormIdFromLink = (formLink: string): string | null => {
  const regex = /\/([a-f0-9-]+)$/;
  const match = regex.exec(formLink);
  return match?.[1] ?? null;
};

/**
 * Parses HubSpot form data into step-based structure
 * @param formData - Raw HubSpot form data
 * @returns Parsed form structure with steps and conditional logic
 */
/**
 * Detect steps by analyzing field properties and dependencies
 */
const detectFormSteps = (formData: HubSpotFormData): FormStep[] => {
  const allFields = formData.formFieldGroups.flatMap(group => group.fields);
  const steps: FormStep[] = [];
  
  // Strategy 1: Look for step indicators in field metadata or properties
  const _fieldsWithStepInfo = allFields.map((field, index) => {
    // Check for step-related properties
    const stepIndicators = {
      displayOrder: field.displayOrder,
      groupName: field.groupName,
      metaData: field.metaData,
      dependentFieldFilters: field.dependentFieldFilters,
      hidden: field.hidden,
      fieldIndex: index
    };
    
    console.log(`Analyzing field ${field.name} for step indicators:`, stepIndicators);
    
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
    const hasConditionalLogic = field.dependentFieldFilters && field.dependentFieldFilters.length > 0;
    const _isHidden = field.hidden;
    
    // Check if this field should start a new step
    let shouldStartNewStep = false;
    
    // Rule 1: If field has conditional logic and we already have fields in current step
    if (hasConditionalLogic && currentStepFields.length > 0) {
      console.log(`Field ${field.name} has conditional logic - checking if it should be in new step`);
      shouldStartNewStep = true;
    }
    
    // Rule 2: Check for page breaks in field groups
    const fieldGroup = formData.formFieldGroups.find(group => 
      group.fields.some(f => f.name === field.name)
    );
    if (fieldGroup?.isPageBreak && currentStepFields.length > 0) {
      shouldStartNewStep = true;
    }
    
    // Rule 3: Look for step patterns in display order or metadata
    // (This could be expanded based on what we find in the API)
    
    if (shouldStartNewStep) {
      // Finalize current step
      if (currentStepFields.length > 0) {
        console.log(`Creating step ${currentStepNumber} with ${currentStepFields.length} fields:`, 
          currentStepFields.map(f => f.name));
        
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
    console.log(`Added ${field.name} to step ${currentStepNumber}`);
  });
  
  // Finalize the last step
  if (currentStepFields.length > 0) {
    console.log(`Creating final step ${currentStepNumber} with ${currentStepFields.length} fields:`, 
      currentStepFields.map(f => f.name));
    
    steps.push({
      stepNumber: currentStepNumber,
      fields: [...currentStepFields],
      isPageBreak: currentStepNumber > 1
    });
  }
  
  // If no steps were created using conditional logic, fall back to single step
  if (steps.length === 0) {
    console.log('No step indicators found, creating single step with all fields');
    steps.push({
      stepNumber: 1,
      fields: allFields,
      isPageBreak: false
    });
  }
  
  return steps;
};

/**
 * Enhanced parsing that combines data from multiple API endpoints
 */
const parseFormStructureComprehensive = (primaryFormData: HubSpotFormData, allFormData: Record<string, unknown>): ParsedFormStructure => {
  console.log('🔍 Parsing form structure with comprehensive data...');
  
  // Look for step/page information in different data sources
  const stepIndicators = {
    v2PageBreaks: primaryFormData.formFieldGroups?.some(group => group.isPageBreak),
    v3FieldGroups: (allFormData.v3Form as Record<string, unknown>)?.fieldGroups ? ((allFormData.v3Form as Record<string, unknown>).fieldGroups as unknown[]).length : 0,
    formDefinitionSteps: (allFormData.formDefinition as Record<string, unknown>)?.steps ? ((allFormData.formDefinition as Record<string, unknown>).steps as unknown[]).length : 0,
    configurationPages: (allFormData.formConfiguration as Record<string, unknown>)?.pages ? ((allFormData.formConfiguration as Record<string, unknown>).pages as unknown[]).length : 0
  };
  
  console.log('Step indicators found:', stepIndicators);
  
  // Try to detect steps from V3 API structure
  if ((allFormData.v3Form as Record<string, unknown>)?.fieldGroups) {
    console.log('🎯 Using V3 field groups for step detection');
    return parseV3FormStructure(allFormData.v3Form as Record<string, unknown>, primaryFormData);
  }
  
  // Try to detect steps from form definition
  if ((allFormData.formDefinition as Record<string, unknown>)?.steps) {
    console.log('🎯 Using form definition steps');
    return parseFormDefinitionStructure(allFormData.formDefinition as Record<string, unknown>, primaryFormData);
  }
  
  // Try to detect steps from configuration pages
  if ((allFormData.formConfiguration as Record<string, unknown>)?.pages) {
    console.log('🎯 Using form configuration pages');
    return parseFormConfigurationStructure(allFormData.formConfiguration as Record<string, unknown>, primaryFormData);
  }
  
  // Fallback to original parsing
  console.log('🔄 Falling back to standard V2 parsing');
  return parseFormStructure(primaryFormData);
};

/**
 * Parse V3 form structure for step information
 */
const parseV3FormStructure = (v3Form: Record<string, unknown>, v2Form: HubSpotFormData): ParsedFormStructure => {
  console.log('Parsing V3 form structure...');
  
  const steps: FormStep[] = [];
  
  (v3Form.fieldGroups as Array<Record<string, unknown>>).forEach((group, groupIndex: number) => {
    console.log(`V3 Group ${groupIndex}:`, {
      groupType: group.groupType as string,
      fieldsCount: (group.fields as unknown[])?.length ?? 0,
      richTextType: group.richTextType as string
    });
    
    // Each field group in V3 might represent a step
    if (group.fields && Array.isArray(group.fields) && group.fields.length > 0) {
      // Map V3 fields back to V2 format for consistency
      const v2Fields = (group.fields as Array<Record<string, unknown>>).map((v3Field) => {
        const v2Field = v2Form.formFieldGroups
          .flatMap(g => g.fields)
          .find(f => f.name === (v3Field.name as string));
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

/**
 * Parse form definition structure for step information
 */
const parseFormDefinitionStructure = (formDefinition: Record<string, unknown>, v2Form: HubSpotFormData): ParsedFormStructure => {
  console.log('Parsing form definition structure...');
  // Implementation would depend on what the definition API returns
  return parseFormStructure(v2Form);
};

/**
 * Parse form configuration structure for step information
 */
const parseFormConfigurationStructure = (formConfiguration: Record<string, unknown>, v2Form: HubSpotFormData): ParsedFormStructure => {
  console.log('Parsing form configuration structure...');
  // Implementation would depend on what the configuration API returns
  return parseFormStructure(v2Form);
};

/**
 * Create the final parsed structure
 */
const createParsedStructure = (formData: HubSpotFormData, steps: FormStep[]): ParsedFormStructure => {
  const fieldsWithConditionalLogic = steps
    .flatMap(step => step.fields)
    .filter(field => field.dependentFieldFilters && field.dependentFieldFilters.length > 0);
  
  return {
    formId: formData.guid ?? formData.id ?? '',
    formName: formData.name,
    totalSteps: steps.length,
    steps,
    fieldsWithConditionalLogic
  };
};

export const parseFormStructure = (formData: HubSpotFormData): ParsedFormStructure => {
  console.log('Parsing form structure:', {
    formName: formData.name,
    totalGroups: formData.formFieldGroups.length,
    groups: formData.formFieldGroups.map((group, index) => ({
      index,
      fieldsCount: group.fields.length,
      isPageBreak: group.isPageBreak,
      isSmartGroup: group.isSmartGroup,
      default: group.default
    }))
  });

  const steps = detectFormSteps(formData);
  
  steps.forEach((step, _index) => {
    console.log(`Step ${step.stepNumber}:`, {
      fieldsCount: step.fields.length,
      fieldNames: step.fields.map(f => f.name),
      isPageBreak: step.isPageBreak
    });
  });
  
  // Collect all fields with conditional logic
  const fieldsWithConditionalLogic = steps
    .flatMap(step => step.fields)
    .filter(field => field.dependentFieldFilters.length > 0);
  
  const result = {
    formId: formData.guid ?? formData.id ?? '',
    formName: formData.name,
    totalSteps: steps.length,
    steps,
    fieldsWithConditionalLogic
  };

  console.log('Final parsed structure:', {
    totalSteps: result.totalSteps,
    steps: result.steps.map(step => ({
      stepNumber: step.stepNumber,
      fieldsCount: step.fields.length,
      isPageBreak: step.isPageBreak,
      fieldNames: step.fields.map(f => f.name)
    }))
  });

  return result;
};

/**
 * Fetches form fields directly from HubSpot API
 * @param formId - The HubSpot form ID
 * @returns Promise resolving to form fields data
 */
export const getHubSpotFormFields = async (formId: string): Promise<HubSpotFormField[]> => {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  if (!apiKey) {
    throw new Error('HUBSPOT_API_KEY environment variable is not set');
  }

  try {
    const response = await fetch(`https://api.hubapi.com/forms/v2/forms/${formId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    const formData = await response.json() as HubSpotFormData;
    
    // Debug: Log the complete raw API response to see ALL properties
    console.log('=== COMPLETE RAW HUBSPOT API RESPONSE ===');
    console.log(JSON.stringify(formData, null, 2));
    console.log('=== END RAW RESPONSE ===');
    
    // Debug: Check each field for conditional logic and dependencies
    console.log('=== FIELD-BY-FIELD ANALYSIS ===');
    formData.formFieldGroups.forEach((group, groupIndex) => {
      console.log(`Group ${groupIndex}:`, {
        isPageBreak: group.isPageBreak,
        isSmartGroup: group.isSmartGroup,
        default: group.default,
        fieldsCount: group.fields.length
      });
      
      group.fields.forEach((field, fieldIndex) => {
        console.log(`  Field ${fieldIndex} (${field.name}):`, {
          label: field.label,
          displayOrder: field.displayOrder,
          groupName: field.groupName,
          hidden: field.hidden,
          dependentFieldFilters: field.dependentFieldFilters,
          metaData: field.metaData,
          // Look for conditional/dependency properties
          conditionalProperties: Object.keys(field).filter(key => 
            key.toLowerCase().includes('dependent') || 
            key.toLowerCase().includes('conditional') || 
            key.toLowerCase().includes('filter') ||
            key.toLowerCase().includes('hidden') ||
            key.toLowerCase().includes('visible')
          )
        });
        
        // If field has conditional logic, log it in detail
        if (field.dependentFieldFilters && field.dependentFieldFilters.length > 0) {
          console.log(`    *** CONDITIONAL LOGIC FOUND for ${field.name} ***`);
          console.log('    Dependent field filters:', JSON.stringify(field.dependentFieldFilters, null, 4));
        }
      });
    });
    console.log('=== END FIELD ANALYSIS ===');

    // Flatten form fields from all field groups
    const fields: HubSpotFormField[] = [];
    formData.formFieldGroups.forEach(group => {
      fields.push(...group.fields);
    });

    return fields;
  } catch (error) {
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching HubSpot form fields: ${error.message}`);
    }
    throw new NetworkError('Unknown error fetching HubSpot form fields');
  }
};

/**
 * Try multiple HubSpot API endpoints to get complete form structure
 * @param formId - The HubSpot form ID
 * @returns Promise resolving to comprehensive form data
 */
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
    console.log('Fetching from HubSpot v3 Forms API...');
    const v3Response = await fetch(`https://api.hubapi.com/marketing/v3/forms/${formId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (v3Response.ok) {
      results.v3Form = await v3Response.json();
      console.log('✅ V3 API Success');
    } else {
      console.log('❌ V3 API failed:', v3Response.status);
    }
  } catch (error) {
    console.log('❌ V3 API error:', error);
  }

  // 2. Try v2 Forms API (legacy but sometimes has different data)
  try {
    console.log('Fetching from HubSpot v2 Forms API...');
    const v2Response = await fetch(`https://api.hubapi.com/forms/v2/forms/${formId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (v2Response.ok) {
      results.v2Form = await v2Response.json();
      console.log('✅ V2 API Success');
    } else {
      console.log('❌ V2 API failed:', v2Response.status);
    }
  } catch (error) {
    console.log('❌ V2 API error:', error);
  }

  // 3. Try Forms Definition API (if available)
  try {
    console.log('Trying Forms Definition API...');
    const defResponse = await fetch(`https://api.hubapi.com/forms/v2/forms/${formId}/definition`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (defResponse.ok) {
      results.formDefinition = await defResponse.json();
      console.log('✅ Forms Definition API Success');
    } else {
      console.log('❌ Forms Definition API failed:', defResponse.status);
    }
  } catch (error) {
    console.log('❌ Forms Definition API error:', error);
  }

  // 4. Try Form Configuration API (if available)
  try {
    console.log('Trying Form Configuration API...');
    const configResponse = await fetch(`https://api.hubapi.com/forms/v2/forms/${formId}/configuration`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (configResponse.ok) {
      results.formConfiguration = await configResponse.json();
      console.log('✅ Form Configuration API Success');
    } else {
      console.log('❌ Form Configuration API failed:', configResponse.status);
    }
  } catch (error) {
    console.log('❌ Form Configuration API error:', error);
  }

  return results;
};

/**
 * Fetches and parses complete HubSpot form structure with steps
 * @param formId - The HubSpot form ID
 * @returns Promise resolving to parsed form structure
 */
export const getHubSpotFormStructure = async (formId: string): Promise<ParsedFormStructure> => {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  if (!apiKey) {
    throw new Error('HUBSPOT_API_KEY environment variable is not set');
  }

  try {
    console.log('🔍 Fetching complete form structure from multiple endpoints...');
    
    // Get comprehensive form data from all available endpoints
    const allFormData = await fetchCompleteFormStructure(formId);
    
    console.log('=== COMPREHENSIVE FORM DATA ===');
    console.log('V2 Form available:', !!allFormData.v2Form);
    console.log('V3 Form available:', !!allFormData.v3Form);
    console.log('Form Definition available:', !!allFormData.formDefinition);
    console.log('Form Configuration available:', !!allFormData.formConfiguration);
    
    // Log all available data for analysis
    if (allFormData.v3Form) {
      console.log('=== V3 FORM STRUCTURE ===');
      console.log(JSON.stringify(allFormData.v3Form, null, 2));
      console.log('=== END V3 FORM ===');
    }
    
    if (allFormData.formDefinition) {
      console.log('=== FORM DEFINITION ===');
      console.log(JSON.stringify(allFormData.formDefinition, null, 2));
      console.log('=== END FORM DEFINITION ===');
    }
    
    if (allFormData.formConfiguration) {
      console.log('=== FORM CONFIGURATION ===');
      console.log(JSON.stringify(allFormData.formConfiguration, null, 2));
      console.log('=== END FORM CONFIGURATION ===');
    }
    
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
};
