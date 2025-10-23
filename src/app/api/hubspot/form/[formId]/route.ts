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
  if (formData.fieldGroups.length === 1 && firstGroup && firstGroup.groupType === 'default_group') {
    
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
    // eslint-disable-next-line security/detect-object-injection
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
  
  if (!apiKey) {
    throw new Error('HUBSPOT_API_KEY environment variable is not set');
  }

  const response = await fetch(`https://api.hubapi.com/marketing/v3/forms/${formId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HubSpot v3 API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as HubSpotV3FormData;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Use the formId directly since we're now passing form IDs, not links
    const formData = await getHubSpotV3FormData(formId);
    
    // Analyze steps - HubSpot forms can have multiple strategies for steps
    const steps = analyzeFormSteps(formData);
    
    // Return comprehensive form metadata
    return NextResponse.json({
      formData,
      steps,
      metadata: {
        totalFields: formData.fieldGroups.reduce((total, group) => total + group.fields.length, 0) + 
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
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
