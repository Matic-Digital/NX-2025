import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { extractFormIdFromLink } from '@/components/HubspotForm/HubspotFormApi';

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

function analyzeFormSteps(formData: HubSpotV3FormData): FormStep[] {
  const steps: FormStep[] = [];
  
  console.log('=== FORM STEP ANALYSIS DEBUG ===');
  console.log('Form name:', formData.name);
  console.log('Form ID:', formData.id);
  console.log('Total field groups:', formData.fieldGroups.length);
  console.log('Field groups:', formData.fieldGroups.map(g => ({
    groupType: g.groupType,
    richTextType: g.richTextType,
    fieldsCount: g.fields.length,
    richText: g.richText ? g.richText.substring(0, 100) + '...' : null
  })));
  
  // Check if this is actually a multi-step form
  const hasMultipleGroups = formData.fieldGroups.length > 1;
  const hasNonDefaultGroups = formData.fieldGroups.some(g => g.groupType !== 'default_group');
  
  console.log('Has multiple groups:', hasMultipleGroups);
  console.log('Has non-default groups:', hasNonDefaultGroups);
  
  // Strategy 0: Analyze field labels for step numbers (labelName - step number)
  const formFields = formData.fieldGroups.flatMap(group => group.fields);
  const stepPattern = /^(.+?)\s*-\s*(\d+)$/i;
  const fieldsWithSteps: { field: HubSpotV3FormField; stepNumber: number; originalLabel: string }[] = [];
  
  console.log('Analyzing field labels for step patterns...');
  formFields.forEach(field => {
    const match = stepPattern.exec(field.label);
    if (match?.[2] && match[1]) {
      const stepNumber = parseInt(match[2]);
      const originalLabel = match[1].trim();
      fieldsWithSteps.push({ field, stepNumber, originalLabel });
      console.log(`Found step ${stepNumber} field: "${originalLabel}" (full label: "${field.label}")`);
    }
  });
  
  if (fieldsWithSteps.length > 0) {
    console.log(`DETECTED: Multi-step form based on field labels (${fieldsWithSteps.length} fields with step indicators)`);
    
    // Group fields by step number
    const stepNumbers = [...new Set(fieldsWithSteps.map(f => f.stepNumber))].sort((a, b) => a - b);
    console.log('Step numbers found:', stepNumbers);
    
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
      
      console.log(`Created step ${stepNum} with ${stepFieldObjects.length} fields`);
    });
    
    // Add any remaining fields that don't have step indicators to step 1
    const fieldsWithoutSteps = formFields.filter(field => 
      !fieldsWithSteps.some(f => f.field === field)
    );
    
    if (fieldsWithoutSteps.length > 0) {
      console.log(`Adding ${fieldsWithoutSteps.length} fields without step indicators to step 1`);
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
    
    console.log('=== END FORM STEP ANALYSIS DEBUG ===');
    return steps.sort((a, b) => a.stepNumber - b.stepNumber);
  }
  
  // If only one default group, it's definitely a single-step form
  const firstGroup = formData.fieldGroups[0];
  if (formData.fieldGroups.length === 1 && firstGroup && firstGroup.groupType === 'default_group') {
    console.log('DETECTED: Single-step form (only default_group)');
    console.log('=== END FORM STEP ANALYSIS DEBUG ===');
    steps.push({
      stepNumber: 1,
      stepName: 'Single Step Form',
      fields: formFields,
      fieldGroups: formData.fieldGroups,
      isPageBreak: false,
      hasConditionalLogic: formFields.some(field => 
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
  
  console.log('Page break groups found:', pageBreakGroups.length);
  if (pageBreakGroups.length > 0) {
    console.log('Page break group types:', pageBreakGroups.map(g => g.groupType));
    console.log('Found explicit page breaks:', pageBreakGroups.length);
    
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
    
    return steps;
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
  
  console.log('Rich text step indicators found:', richTextStepIndicators.length);
  if (richTextStepIndicators.length > 0) {
    console.log('Rich text indicators:', richTextStepIndicators.map(g => ({
      groupType: g.groupType,
      richTextType: g.richTextType,
      richText: g.richText?.substring(0, 100)
    })));
    console.log('Found rich text step indicators:', richTextStepIndicators.length);
    
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
    
    return steps;
  }
  
  // Strategy 3: Analyze field display order for natural breaks
  const displayOrderFields = formData.fieldGroups.flatMap(group => group.fields);
  const sortedFields = displayOrderFields.sort((a, b) => a.displayOrder - b.displayOrder);
  
  console.log('All fields display orders:', sortedFields.map(f => ({ name: f.name, displayOrder: f.displayOrder })));
  
  // Look for gaps in display order that might indicate step breaks
  const displayOrderGaps: number[] = [];
  for (let i = 1; i < sortedFields.length; i++) {
    const currentField = sortedFields[i];
    const previousField = sortedFields[i-1];
    
    // Ensure both fields exist and have displayOrder values
    if (currentField && previousField && 
        typeof currentField.displayOrder === 'number' && 
        typeof previousField.displayOrder === 'number') {
      const gap = currentField.displayOrder - previousField.displayOrder;
      if (gap > 10) { // Significant gap might indicate a step break
        displayOrderGaps.push(previousField.displayOrder);
        console.log(`Found gap: ${previousField.displayOrder} -> ${currentField.displayOrder} (gap: ${gap})`);
      }
    }
  }
  
  console.log('Display order gaps found:', displayOrderGaps.length);
  if (displayOrderGaps.length > 0) {
    console.log('Gap positions:', displayOrderGaps);
    console.log('Found display order gaps indicating steps:', displayOrderGaps.length + 1);
    
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
    
    return steps;
  }
  
  // Strategy 4: Check for conditional logic that creates natural step progression
  const conditionalLogicFields = formData.fieldGroups.flatMap(group => group.fields);
  const fieldsWithDependencies = conditionalLogicFields.filter(field => 
    field.dependentFieldFilters && field.dependentFieldFilters.length > 0
  );
  
  console.log('Fields with dependencies found:', fieldsWithDependencies.length);
  if (fieldsWithDependencies.length > 0) {
    console.log('Dependent fields:', fieldsWithDependencies.map(f => ({ 
      name: f.name, 
      dependencies: f.dependentFieldFilters?.map(d => d.formFieldProperty) 
    })));
    console.log('Creating steps based on conditional logic:', fieldsWithDependencies.length);
    
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
    
    return steps;
  }
  
  // Fallback: Single step form
  console.log('No step indicators found - treating as single step form');
  console.log('Final step count will be: 1');
  console.log('=== END FORM STEP ANALYSIS DEBUG ===');
  
  const fallbackFields = formData.fieldGroups.flatMap(group => group.fields);
  steps.push({
    stepNumber: 1,
    stepName: 'Single Step Form',
    fields: fallbackFields,
    fieldGroups: formData.fieldGroups,
    isPageBreak: false,
    hasConditionalLogic: fallbackFields.some(field => 
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

    // Check if formId is actually a form link URL
    let actualFormId = formId;
    if (formId.includes('hubspot.com')) {
      const extractedId = extractFormIdFromLink(formId);
      if (!extractedId) {
        return NextResponse.json(
          { error: 'Invalid HubSpot form link' },
          { status: 400 }
        );
      }
      actualFormId = extractedId;
    }

    const formData = await getHubSpotV3FormData(actualFormId);
    
    // Analyze steps - HubSpot forms can have multiple strategies for steps
    const steps = analyzeFormSteps(formData);
    
    // Return comprehensive form metadata
    return NextResponse.json({
      formData,
      steps,
      metadata: {
        totalFields: formData.fieldGroups.reduce((total, group) => total + group.fields.length, 0),
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
    console.error('Error fetching HubSpot v3 form data:', error);
    
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
