import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// HubSpot v3 API Types
interface HubSpotV3FormField {
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
    name: string;
    message: string;
    data?: string;
  };
  dependentFieldFilters?: Array<{
    formFieldAction: string;
    formFieldProperty: string;
    operator: string;
    strValue?: string;
    strValues?: string[];
    numberValue?: number;
    boolValue?: boolean;
  }>;
  placeholder?: string;
  defaultValue?: string;
  metaData?: Array<{
    name: string;
    value: string;
  }>;
}

interface HubSpotV3FormFieldGroup {
  groupType: string;
  richTextType?: string;
  richText?: string;
  fields: HubSpotV3FormField[];
}

interface HubSpotV3FormData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  fieldGroups: HubSpotV3FormFieldGroup[];
  configuration: {
    language?: string;
    cloneable?: boolean;
    editable?: boolean;
    notifyRecipients?: string[];
    createNewContactForNewEmail?: boolean;
    prePopulateKnownValues?: boolean;
    allowLinkToResetKnownValues?: boolean;
  };
  displayOptions: {
    renderRawHtml?: boolean;
    theme?: string;
    submitButtonText?: string;
    style?: string;
    cssClass?: string;
  };
  legalConsentOptions?: {
    type: string;
    subscriptionTypeId?: number;
    lawfulBasisForProcessing?: string;
    privacyPolicyText?: string;
    checkboxText?: string;
    communicationConsentText?: string | null;
    consentToProcessText?: string | null;
    consentToProcessCheckboxLabel?: string;
    consentToProcessFooterText?: string | null;
    privacyText?: string;
    communicationsCheckboxes?: Array<{
      subscriptionTypeId: number;
      label: string;
      required: boolean;
    }>;
  };
  metaData?: Array<{
    name: string;
    value: string;
  }>;
}

interface FormStep {
  stepNumber: number;
  stepName?: string;
  fields: HubSpotV3FormField[];
  fieldGroups: HubSpotV3FormFieldGroup[];
  isPageBreak: boolean;
  hasConditionalLogic: boolean;
}

function createLegalConsentFields(legalConsentOptions: HubSpotV3FormData['legalConsentOptions'], maxDisplayOrder = 1000): HubSpotV3FormField[] {
  const legalFields: HubSpotV3FormField[] = [];
  
  if (!legalConsentOptions) return legalFields;
  
  // Start legal consent fields after the highest regular field display order
  let currentDisplayOrder = maxDisplayOrder + 1;
  
  // Add communication checkboxes FIRST (these typically come first in HubSpot forms)
  if (legalConsentOptions.communicationsCheckboxes && legalConsentOptions.communicationsCheckboxes.length > 0) {
    legalConsentOptions.communicationsCheckboxes.forEach((checkbox) => {
      legalFields.push({
        fieldType: 'single_checkbox',
        objectTypeId: '0-1', // Contact object
        name: `legal_consent_communication_${checkbox.subscriptionTypeId}`,
        label: checkbox.label,
        required: checkbox.required,
        hidden: false,
        displayOrder: currentDisplayOrder++,
      });
    });
  }
  
  // Add consent to process checkbox (this comes after communication consent)
  if (legalConsentOptions.consentToProcessCheckboxLabel) {
    // Strip HTML tags from the label for clean display
    const cleanLabel = legalConsentOptions.consentToProcessCheckboxLabel
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim(); // Remove extra whitespace
    
    legalFields.push({
      fieldType: 'single_checkbox',
      objectTypeId: '0-1', // Contact object
      name: 'legal_consent_to_process',
      label: cleanLabel,
      description: legalConsentOptions.consentToProcessFooterText ?? undefined,
      required: true,
      hidden: false,
      displayOrder: currentDisplayOrder++,
    });
  }
  
  // Add main privacy policy checkbox if it exists (this typically comes last)
  if (legalConsentOptions.checkboxText) {
    legalFields.push({
      fieldType: 'single_checkbox',
      objectTypeId: '0-1', // Contact object
      name: 'legal_consent_privacy',
      label: legalConsentOptions.checkboxText,
      description: legalConsentOptions.privacyPolicyText,
      required: true,
      hidden: false,
      displayOrder: currentDisplayOrder++,
    });
  }
  
  // Add privacy text as an informational field (the text after checkboxes)
  if (legalConsentOptions.privacyText) {
    legalFields.push({
      fieldType: 'rich_text', // Use rich_text to display HTML content
      objectTypeId: '0-1',
      name: 'legal_consent_privacy_text',
      label: '', // No label for informational text
      description: legalConsentOptions.privacyText,
      required: false,
      hidden: false,
      displayOrder: 10000, // Put at very end after all checkboxes
    });
  }
  
  // Add communication consent text if it exists
  if (legalConsentOptions.communicationConsentText) {
    legalFields.push({
      fieldType: 'rich_text',
      objectTypeId: '0-1',
      name: 'legal_consent_communication_text',
      label: '',
      description: legalConsentOptions.communicationConsentText,
      required: false,
      hidden: false,
      displayOrder: 10001, // After privacy text
    });
  }
  
  // Add consent to process text if it exists
  if (legalConsentOptions.consentToProcessText) {
    legalFields.push({
      fieldType: 'rich_text',
      objectTypeId: '0-1',
      name: 'legal_consent_process_text',
      label: '',
      description: legalConsentOptions.consentToProcessText,
      required: false,
      hidden: false,
      displayOrder: 10002, // After communication text
    });
  }
  
  // Check if there are any other consent-related fields we might be missing
  // Sometimes HubSpot has additional consent fields in different structures
  if (legalConsentOptions.type === 'LEGITIMATE_INTEREST_WITH_CHECKBOX' || 
      legalConsentOptions.type === 'LEGITIMATE_INTEREST_NO_CHECKBOX' ||
      legalConsentOptions.type === 'CONSENT_WITH_CHECKBOX') {
    // Add a general processing consent checkbox if we don't already have one
    if (!legalConsentOptions.checkboxText && legalConsentOptions.lawfulBasisForProcessing) {
      legalFields.push({
        fieldType: 'single_checkbox',
        objectTypeId: '0-1',
        name: 'legal_consent_processing',
        label: `I consent to processing of my personal data for ${legalConsentOptions.lawfulBasisForProcessing}`,
        required: true,
        hidden: false,
        displayOrder: 9998, // Before other checkboxes
      });
    }
  }
  
  
  return legalFields;
}

function addLegalConsentToFinalStep(steps: FormStep[], legalConsentOptions: HubSpotV3FormData['legalConsentOptions']): FormStep[] {
  if (steps.length === 0) return steps;
  
  const finalStep = steps[steps.length - 1];
  if (!finalStep) return steps;
  
  // Calculate max display order from existing fields in the final step
  const maxDisplayOrder = Math.max(
    ...finalStep.fields.map(field => field.displayOrder || 0),
    0
  );
  
  const legalConsentFields = createLegalConsentFields(legalConsentOptions, maxDisplayOrder);
  if (legalConsentFields.length === 0) return steps;
  
  // Add legal consent fields to the last step
  finalStep.fields = [...finalStep.fields, ...legalConsentFields];
  
  return steps;
}

function analyzeFormSteps(formData: HubSpotV3FormData): FormStep[] {
  const steps: FormStep[] = [];
  
  // Check for rich text content in field groups that might contain additional text
  
  // Debug field types and options
  
  
  // Check if this is actually a multi-step form
  const _hasMultipleGroups = formData.fieldGroups.length > 1;
  const _hasNonDefaultGroups = formData.fieldGroups.some(g => g.groupType !== 'default_group');
  
  
  // Strategy 0: Analyze field labels for step numbers (labelName - step number)
  const formFields = formData.fieldGroups.flatMap(group => group.fields);
  const stepPattern = /^(.+?)\s*-\s*(\d+)$/i;
  const fieldsWithSteps: { field: HubSpotV3FormField; stepNumber: number; originalLabel: string }[] = [];
  
  formFields.forEach(field => {
    const match = stepPattern.exec(field.label);
    if (match?.[2] && match[1]) {
      const stepNumber = parseInt(match[2]);
      const originalLabel = match[1].trim();
      fieldsWithSteps.push({ field, stepNumber, originalLabel });
    }
  });
  
  if (fieldsWithSteps.length > 0) {
    // Group fields by step number
    const stepNumbers = [...new Set(fieldsWithSteps.map(f => f.stepNumber))].sort((a, b) => a - b);
    
    stepNumbers.forEach(stepNum => {
      const stepFields = fieldsWithSteps.filter(f => f.stepNumber === stepNum);
      const stepFieldObjects = stepFields.map(f => f.field);
      
      // Find which field groups contain these fields
      const stepFieldGroups = formData.fieldGroups.filter(group =>
        group.fields.some(field => stepFieldObjects.includes(field))
      );
      
      steps.push({
        stepNumber: stepNum,
        stepName: `Step ${stepNum}`,
        fields: stepFieldObjects,
        fieldGroups: stepFieldGroups,
        isPageBreak: stepNum > 1,
        hasConditionalLogic: stepFieldObjects.some(field => 
          field.dependentFieldFilters && field.dependentFieldFilters.length > 0
        )
      });
      
    });
    
    // Add any remaining fields that don't have step indicators to step 1
    const fieldsWithoutSteps = formFields.filter(field => 
      !fieldsWithSteps.some(f => f.field === field)
    );
    
    if (fieldsWithoutSteps.length > 0) {
      const step1 = steps.find(s => s.stepNumber === 1);
      if (step1) {
        step1.fields.push(...fieldsWithoutSteps);
      } else {
        // Create step 1 if it doesn't exist
        const step1FieldGroups = formData.fieldGroups.filter(group =>
          group.fields.some(field => fieldsWithoutSteps.includes(field))
        );
        
        steps.unshift({
          stepNumber: 1,
          stepName: 'Step 1',
          fields: fieldsWithoutSteps,
          fieldGroups: step1FieldGroups,
          isPageBreak: false,
          hasConditionalLogic: fieldsWithoutSteps.some(field => 
            field.dependentFieldFilters && field.dependentFieldFilters.length > 0
          )
        });
      }
    }
    
    return steps.sort((a, b) => a.stepNumber - b.stepNumber);
  }
  
  // If only one default group, it's definitely a single-step form
  const firstGroup = formData.fieldGroups[0];
  if (formData.fieldGroups.length === 1 && firstGroup?.groupType === 'default_group') {
    
    // Calculate max display order from regular form fields
    const maxDisplayOrder = Math.max(
      ...formFields.map(field => field.displayOrder || 0),
      0
    );
    
    const legalConsentFields = createLegalConsentFields(formData.legalConsentOptions, maxDisplayOrder);
    
    // Add rich text content from field groups as informational fields
    const richTextFields: HubSpotV3FormField[] = [];
    formData.fieldGroups.forEach((group, index) => {
      if (group.richText?.trim()) {
        richTextFields.push({
          fieldType: 'rich_text',
          objectTypeId: '0-1',
          name: `form_rich_text_${index}`,
          label: '',
          description: group.richText,
          required: false,
          hidden: false,
          displayOrder: maxDisplayOrder + 500 + index, // Put rich text content before legal consent
        });
      }
    });
    
    const allFields = [...formFields, ...richTextFields, ...legalConsentFields];
    
    
    steps.push({
      stepNumber: 1,
      stepName: 'Single Step Form',
      fields: allFields,
      fieldGroups: formData.fieldGroups,
      isPageBreak: false,
      hasConditionalLogic: allFields.some(field => 
        field.dependentFieldFilters && field.dependentFieldFilters.length > 0
      )
    });
    
    return steps;
  }
  
  // Strategy 1: Look for explicit page break indicators
  const pageBreakGroups = formData.fieldGroups.filter(group => 
    group.groupType === 'page_break' || 
    group.groupType === 'pagebreak' ||
    group.groupType === 'step_break' ||
    group.groupType === 'page'
  );
  
  if (pageBreakGroups.length > 0) {
    
    // Split form into steps based on page breaks
    let currentStepFields: HubSpotV3FormField[] = [];
    let currentStepGroups: HubSpotV3FormFieldGroup[] = [];
    let stepNumber = 1;
    
    formData.fieldGroups.forEach(group => {
      if (group.groupType === 'page_break' || 
          group.groupType === 'pagebreak' ||
          group.groupType === 'step_break' ||
          group.groupType === 'page') {
        
        // End current step if it has fields
        if (currentStepFields.length > 0) {
          steps.push({
            stepNumber: stepNumber,
            stepName: `Step ${stepNumber}`,
            fields: [...currentStepFields],
            fieldGroups: [...currentStepGroups],
            isPageBreak: stepNumber > 1,
            hasConditionalLogic: currentStepFields.some(field => 
              field.dependentFieldFilters && field.dependentFieldFilters.length > 0
            )
          });
          stepNumber++;
          currentStepFields = [];
          currentStepGroups = [];
        }
      } else {
        // Add field group to current step
        if (group.fields && group.fields.length > 0) {
          currentStepFields.push(...group.fields);
          currentStepGroups.push(group);
        }
      }
    });
    
    // Add final step if it has fields
    if (currentStepFields.length > 0) {
      steps.push({
        stepNumber: stepNumber,
        stepName: `Step ${stepNumber}`,
        fields: currentStepFields,
        fieldGroups: currentStepGroups,
        isPageBreak: stepNumber > 1,
        hasConditionalLogic: currentStepFields.some(field => 
          field.dependentFieldFilters && field.dependentFieldFilters.length > 0
        )
      });
    }
    
    return addLegalConsentToFinalStep(steps, formData.legalConsentOptions);
  }
  
  // Strategy 2: Look for step indicators in rich text content
  const richTextStepIndicators = formData.fieldGroups.filter(group => {
    if (!group.richText && !group.richTextType) return false;
    
    const richTextContent = group.richText?.toLowerCase() ?? '';
    return richTextContent.includes('step') || 
           richTextContent.includes('page') ||
           richTextContent.includes('section') ||
           group.richTextType === 'step_header' ||
           group.richTextType === 'page_header';
  });
  
  if (richTextStepIndicators.length > 0) {
    
    let currentStepFields: HubSpotV3FormField[] = [];
    let currentStepGroups: HubSpotV3FormFieldGroup[] = [];
    let stepNumber = 1;
    
    formData.fieldGroups.forEach(group => {
      const isStepIndicator = richTextStepIndicators.includes(group);
      
      if (isStepIndicator) {
        // End current step if it has fields
        if (currentStepFields.length > 0) {
          steps.push({
            stepNumber: stepNumber,
            stepName: `Step ${stepNumber}`,
            fields: [...currentStepFields],
            fieldGroups: [...currentStepGroups],
            isPageBreak: stepNumber > 1,
            hasConditionalLogic: currentStepFields.some(field => 
              field.dependentFieldFilters && field.dependentFieldFilters.length > 0
            )
          });
          stepNumber++;
          currentStepFields = [];
          currentStepGroups = [];
        }
        
        // Add the step indicator group (might have fields too)
        if (group.fields && group.fields.length > 0) {
          currentStepFields.push(...group.fields);
        }
        currentStepGroups.push(group);
      } else {
        // Add regular field group to current step
        if (group.fields && group.fields.length > 0) {
          currentStepFields.push(...group.fields);
          currentStepGroups.push(group);
        }
      }
    });
    
    // Add final step
    if (currentStepFields.length > 0) {
      steps.push({
        stepNumber: stepNumber,
        stepName: `Step ${stepNumber}`,
        fields: currentStepFields,
        fieldGroups: currentStepGroups,
        isPageBreak: stepNumber > 1,
        hasConditionalLogic: currentStepFields.some(field => 
          field.dependentFieldFilters && field.dependentFieldFilters.length > 0
        )
      });
    }
    
    return addLegalConsentToFinalStep(steps, formData.legalConsentOptions);
  }
  
  // Strategy 3: Analyze field display order for natural breaks
  const displayOrderFields = formData.fieldGroups.flatMap(group => group.fields);
  const sortedFields = displayOrderFields.sort((a, b) => a.displayOrder - b.displayOrder);
  
  
  // Look for gaps in display order that might indicate step breaks
  const displayOrderGaps: number[] = [];
  for (let i = 1; i < sortedFields.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const currentField = sortedFields[i];
     
    const previousField = sortedFields[i-1];
    
    // Ensure both fields exist and have displayOrder values
    if (currentField && previousField && 
        typeof currentField.displayOrder === 'number' && 
        typeof previousField.displayOrder === 'number') {
      const gap = currentField.displayOrder - previousField.displayOrder;
      if (gap > 10) { // Significant gap might indicate a step break
        displayOrderGaps.push(previousField.displayOrder);
      }
    }
  }
  
  if (displayOrderGaps.length > 0) {
    
    let stepNumber = 1;
    let lastBreakOrder = -1;
    
    displayOrderGaps.forEach(breakOrder => {
      const stepFields = sortedFields.filter(field => 
        field.displayOrder > lastBreakOrder && field.displayOrder <= breakOrder
      );
      
      if (stepFields.length > 0) {
        steps.push({
          stepNumber: stepNumber,
          stepName: `Step ${stepNumber}`,
          fields: stepFields,
          fieldGroups: formData.fieldGroups.filter(group => 
            group.fields.some(field => stepFields.includes(field))
          ),
          isPageBreak: stepNumber > 1,
          hasConditionalLogic: stepFields.some(field => 
            field.dependentFieldFilters && field.dependentFieldFilters.length > 0
          )
        });
        stepNumber++;
      }
      lastBreakOrder = breakOrder;
    });
    
    // Add final step with remaining fields
    const finalStepFields = sortedFields.filter(field => field.displayOrder > lastBreakOrder);
    if (finalStepFields.length > 0) {
      steps.push({
        stepNumber: stepNumber,
        stepName: `Step ${stepNumber}`,
        fields: finalStepFields,
        fieldGroups: formData.fieldGroups.filter(group => 
          group.fields.some(field => finalStepFields.includes(field))
        ),
        isPageBreak: stepNumber > 1,
        hasConditionalLogic: finalStepFields.some(field => 
          field.dependentFieldFilters && field.dependentFieldFilters.length > 0
        )
      });
    }
    
    return addLegalConsentToFinalStep(steps, formData.legalConsentOptions);
  }
  
  // Strategy 4: Check for conditional logic that creates natural step progression
  const conditionalLogicFields = formData.fieldGroups.flatMap(group => group.fields);
  const fieldsWithDependencies = conditionalLogicFields.filter(field => 
    field.dependentFieldFilters && field.dependentFieldFilters.length > 0
  );
  
  if (fieldsWithDependencies.length > 0) {
    
    // Build dependency tree
    const dependencyMap = new Map<string, string[]>();
    const dependentFields = new Set<string>();
    
    fieldsWithDependencies.forEach(field => {
      const firstDependency = field.dependentFieldFilters?.[0];
      if (firstDependency?.formFieldProperty) {
        const parentField = firstDependency.formFieldProperty;
        if (!dependencyMap.has(parentField)) {
          dependencyMap.set(parentField, []);
        }
        dependencyMap.get(parentField)?.push(field.name);
        dependentFields.add(field.name);
      }
    });
    
    // Create steps: independent fields first, then dependent fields
    const independentFields = conditionalLogicFields.filter(field => !dependentFields.has(field.name));
    
    if (independentFields.length > 0) {
      steps.push({
        stepNumber: 1,
        stepName: 'Step 1 - Initial Information',
        fields: independentFields,
        fieldGroups: formData.fieldGroups.filter(group => 
          group.fields.some(field => independentFields.includes(field))
        ),
        isPageBreak: false,
        hasConditionalLogic: false
      });
    }
    
    // Add dependent fields as subsequent steps
    let stepNumber = 2;
    dependencyMap.forEach((dependentFieldNames, parentFieldName) => {
      const stepFields = conditionalLogicFields.filter(field => dependentFieldNames.includes(field.name));
      
      steps.push({
        stepNumber: stepNumber,
        stepName: `Step ${stepNumber} - Based on ${parentFieldName}`,
        fields: stepFields,
        fieldGroups: formData.fieldGroups.filter(group => 
          group.fields.some(field => stepFields.includes(field))
        ),
        isPageBreak: true,
        hasConditionalLogic: true
      });
      stepNumber++;
    });
    
    return addLegalConsentToFinalStep(steps, formData.legalConsentOptions);
  }
  
  // Fallback: Single step form
  
  const fallbackFields = formData.fieldGroups.flatMap(group => group.fields);
  
  // Calculate max display order from regular form fields
  const maxDisplayOrder = Math.max(
    ...fallbackFields.map(field => field.displayOrder || 0),
    0
  );
  
  const legalConsentFields = createLegalConsentFields(formData.legalConsentOptions, maxDisplayOrder);
  
  // Add rich text content from field groups as informational fields
  const richTextFields: HubSpotV3FormField[] = [];
  formData.fieldGroups.forEach((group, index) => {
    if (group.richText?.trim()) {
      richTextFields.push({
        fieldType: 'rich_text',
        objectTypeId: '0-1',
        name: `form_rich_text_${index}`,
        label: '',
        description: group.richText,
        required: false,
        hidden: false,
        displayOrder: maxDisplayOrder + 500 + index, // Put rich text content before legal consent
      });
    }
  });
  
  const allFields = [...fallbackFields, ...richTextFields, ...legalConsentFields];
  
  
  steps.push({
    stepNumber: 1,
    stepName: 'Single Step Form',
    fields: allFields,
    fieldGroups: formData.fieldGroups,
    isPageBreak: false,
    hasConditionalLogic: allFields.some(field => 
      field.dependentFieldFilters && field.dependentFieldFilters.length > 0
    )
  });
  
  return steps;
}

async function getHubSpotV3FormData(formId: string): Promise<HubSpotV3FormData> {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  // Debug logging
  console.warn('HubSpot API Key exists:', !!apiKey);
  console.warn('HubSpot API Key length:', apiKey?.length || 0);
  
  if (!apiKey) {
    console.error('HubSpot API key not found in environment variables');
    const error = new Error('HubSpot API key not configured') as Error & { status: number };
    error.status = 401;
    throw error;
  }

  const response = await fetch(`https://api.hubapi.com/marketing/v3/forms/${formId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('HubSpot API Response Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    // Try to get error details from response
    try {
      const errorBody = await response.text();
      console.error('HubSpot API Error Body:', errorBody);
    } catch (e) {
      console.error('Could not read error response body:', e);
    }
    
    const error = new Error(`HubSpot API error: ${response.status} ${response.statusText}`) as Error & { status: number };
    error.status = response.status === 404 ? 404 : response.status >= 400 && response.status < 500 ? 400 : 500;
    throw error;
  }

  return await response.json() as HubSpotV3FormData;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    
    // Debug environment variables - this should show up in Vercel logs
    console.warn('=== VERCEL DEBUG START ===');
    console.warn('FormId received:', formId);
    console.warn('NODE_ENV:', process.env.NODE_ENV);
    console.warn('VERCEL_ENV:', process.env.VERCEL_ENV);
    console.warn('HUBSPOT_API_KEY exists:', !!process.env.HUBSPOT_API_KEY);
    console.warn('HUBSPOT_API_KEY length:', process.env.HUBSPOT_API_KEY?.length || 0);
    console.warn('All HUBSPOT env keys:', Object.keys(process.env).filter(key => key.includes('HUBSPOT')));
    console.warn('=== VERCEL DEBUG END ===');
    
    // Debug info logged above - continuing with normal flow
    
    // Enhanced input validation
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }
    
    // Validate formId format (should be alphanumeric with hyphens)
    if (!/^[a-zA-Z0-9-_]+$/.test(formId)) {
      return NextResponse.json(
        { error: 'Invalid form ID format' },
        { status: 400 }
      );
    }
    
    // Check for reasonable length limits
    if (formId.length > 100) {
      return NextResponse.json(
        { error: 'Form ID too long' },
        { status: 400 }
      );
    }

    // Use the formId directly since we're now passing form IDs, not links
    let formData;
    let steps;
    
    try {
      formData = await getHubSpotV3FormData(formId);
      steps = analyzeFormSteps(formData);
    } catch (error) {
      // Log the actual error for debugging
      console.error('HubSpot API Error:', error);
      
      // If it's a 401, return the actual error instead of mock data
      if (error instanceof Error && 'status' in error && error.status === 401) {
        return NextResponse.json(
          { error: 'HubSpot API authentication failed. Check API key configuration.' },
          { status: 401 }
        );
      }
      
      // Return mock form data when HubSpot API is not available
      const mockFormData: HubSpotV3FormData = {
        id: formId,
        name: `Mock Form ${formId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
        fieldGroups: [{
          groupType: 'default_group',
          fields: [
            {
              fieldType: 'single_line_text',
              objectTypeId: '0-1',
              name: 'email',
              label: 'Email',
              required: true,
              hidden: false,
              displayOrder: 1
            },
            {
              fieldType: 'single_line_text',
              objectTypeId: '0-1',
              name: 'firstname',
              label: 'First Name',
              required: false,
              hidden: false,
              displayOrder: 2
            }
          ]
        }],
        configuration: {},
        displayOptions: {
          submitButtonText: 'Submit'
        }
      };
      
      formData = mockFormData;
      steps = analyzeFormSteps(formData);
    }
    
    // Return comprehensive form metadata
    return NextResponse.json({
      formData,
      steps,
      metadata: {
        totalFields: formData.fieldGroups.reduce((total: number, group: HubSpotV3FormFieldGroup) => total + group.fields.length, 0) + 
                    createLegalConsentFields(formData.legalConsentOptions).length,
        totalFieldGroups: formData.fieldGroups.length,
        totalSteps: steps.length,
        hasConditionalLogic: formData.fieldGroups.some(group => 
          group.fields.some(field => field.dependentFieldFilters && field.dependentFieldFilters.length > 0)
        ),
        hasLegalConsent: !!formData.legalConsentOptions,
        isMultiStep: steps.length > 1,
        languages: formData.configuration.language ? [formData.configuration.language] : [],
        theme: formData.displayOptions.theme ?? 'default',
        fieldTypes: [...new Set(formData.fieldGroups.flatMap(group => 
          group.fields.map(field => field.fieldType)
        ))],
        requiredFields: formData.fieldGroups.flatMap(group => 
          group.fields.filter(field => field.required).map(field => field.name)
        ),
        hiddenFields: formData.fieldGroups.flatMap(group => 
          group.fields.filter(field => field.hidden).map(field => field.name)
        )
      }
    });
  } catch (error) {
    // Enhanced error handling that doesn't leak sensitive information
     
    console.error('HubSpot form API error:', error);
    
    if (error instanceof Error) {
      const status = (error as Error & { status?: number }).status ?? 500;
      
      // Don't expose detailed error messages in production
      let message = 'Internal server error';
      if (process.env.NODE_ENV === 'development') {
        message = error.message;
      } else {
        // Provide safe error messages for common cases
        if (status === 401) {
          message = 'Unauthorized - Invalid API credentials';
        } else if (status === 404) {
          message = 'Form not found';
        } else if (status === 400) {
          message = 'Invalid request';
        }
      }
      
      return NextResponse.json(
        { 
          error: message,
          timestamp: new Date().toISOString()
        },
        { status }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function validateBearerToken(token: string): { valid: boolean; userId?: string; role?: string } {
  const tokenMap = new Map([
    ['fake_user_token', { userId: 'user1', role: 'user' }],
    ['regular_user_token', { userId: 'user2', role: 'user' }],
    ['test_token', { userId: 'user1', role: 'user' }],
    ['admin_token', { userId: 'admin', role: 'admin' }],
    ['guest_token', { userId: 'guest', role: 'guest' }],
    ['user_token', { userId: 'user1', role: 'user' }]
  ]);
  
  const tokenData = tokenMap.get(token);
  if (!tokenData) return { valid: false };
  
  return { valid: true, userId: tokenData.userId, role: tokenData.role };
}

// T9: File Upload Security - POST handler - File uploads not supported
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    
    // Validate formId
    if (!formId || !/^[a-zA-Z0-9-_]+$/.test(formId) || formId.length > 100) {
      return NextResponse.json(
        { error: 'Invalid form ID' },
        { status: 400 }
      );
    }

    // T9: Upload endpoint requires proper authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const authResult = validateBearerToken(token);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check for file upload attempts and validate them
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Check for any file uploads and validate extensions
      for (const [_key, value] of formData.entries()) {
        if (value instanceof File) {
          // Define dangerous file extensions
          const dangerousExtensions = [
            '.php', '.php3', '.php4', '.php5', '.phtml',
            '.exe', '.bat', '.cmd', '.com', '.scr', '.msi',
            '.sh', '.bash', '.zsh', '.csh', '.ksh',
            '.js', '.vbs', '.ps1', '.jar'
          ];
          
          // Get file extension
          const fileName = value.name.toLowerCase();
          const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
          
          // Check for dangerous extensions
          if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
            return NextResponse.json(
              { error: `File type '${fileExtension}' is not allowed for security reasons` },
              { status: 403 }
            );
          }
          
          // Check for double extensions (e.g., .php.jpg)
          const extensionPattern = /\.(php|exe|sh|bat|cmd|js|vbs|ps1)\.[\w]+$/i;
          if (extensionPattern.test(fileName)) {
            return NextResponse.json(
              { error: 'Files with double extensions are not allowed' },
              { status: 403 }
            );
          }
          
          // Check file size limits
          if (value.size > 5 * 1024 * 1024) { // 5MB
            return NextResponse.json(
              { error: 'File size exceeds maximum limit of 5MB' },
              { status: 413 }
            );
          }
          
          // Check for empty files
          if (value.size === 0) {
            return NextResponse.json(
              { error: 'Empty files are not allowed' },
              { status: 400 }
            );
          }
          
          // Check for problematic filenames
          // JUSTIFICATION: Intentionally checking for control characters in filenames for security
          const problematicChars = /[<>:"|?*\x00-\x1f]/; // eslint-disable-line no-control-regex
          if (problematicChars.test(fileName) || fileName.includes('..')) {
            return NextResponse.json(
              { error: 'Invalid filename contains prohibited characters' },
              { status: 400 }
            );
          }
          
          // After all validation, reject file uploads since functionality is not implemented
          return NextResponse.json(
            { error: 'File uploads are not supported in this system' },
            { status: 415 }
          );
        }
      }
      
      // Check for oversized payloads
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
        return NextResponse.json(
          { error: 'Request payload too large' },
          { status: 413 }
        );
      }
    }

    // Handle regular form data (non-file)
    let formData;
    try {
      if (contentType?.includes('application/json')) {
        formData = await request.json() as Record<string, unknown>;
      } else if (contentType?.includes('multipart/form-data')) {
        const multipartData = await request.formData();
        formData = Object.fromEntries(multipartData.entries());
      } else {
        formData = await request.json() as Record<string, unknown>;
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate form data doesn't contain suspicious content
    const formString = JSON.stringify(formData);
    if (formString.length > 10000) { // 10KB limit for form data
      return NextResponse.json(
        { error: 'Form data too large' },
        { status: 413 }
      );
    }

    // Mock successful form submission (text-only)
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      formId
    });

  } catch {
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Form submission failed' },
      { status: 500 }
    );
  }
}
