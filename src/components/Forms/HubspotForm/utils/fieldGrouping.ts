import type { HubSpotFormField, FieldGroup, FormContent } from '../fields/types';

/**
 * Analyzes fields and groups them appropriately based on HubSpot patterns
 */
export function groupFields(fields: HubSpotFormField[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  const processedFields = new Set<string>();

  // First, identify potential multiselect checkbox groups
  // Look for fields with similar names or that are logically related
  const checkboxFields = fields.filter(field => 
    (field.fieldType === 'checkbox' || 
     field.fieldType === 'booleancheckbox' ||
     field.fieldType === 'single_checkbox' ||
     field.fieldType === 'checkboxes' ||
     field.fieldType.toLowerCase().includes('checkbox')) && 
    !field.options?.length // Single checkboxes, not multiselect
  );

  // Also look for fields that might be multiselect but are being treated as individual fields
  const potentialMultiselectFields = fields.filter(field =>
    field.options && field.options.length > 1 && 
    (field.fieldType.toLowerCase().includes('checkbox') ||
     field.fieldType.toLowerCase().includes('multi') ||
     field.name.toLowerCase().includes('checkbox') ||
     field.name.toLowerCase().includes('multi') ||
     field.name.toLowerCase().includes('service') || // Common multiselect field names
     field.name.toLowerCase().includes('interest') ||
     field.name.toLowerCase().includes('option') ||
     field.label.toLowerCase().includes('select all') ||
     field.label.toLowerCase().includes('choose all') ||
     // Force multiselect for fields with many options (likely checkboxes)
     (field.options.length > 3 && field.fieldType !== 'select' && field.fieldType !== 'dropdown'))
  );


  // Group checkbox fields that might belong together
  const checkboxGroups = groupRelatedCheckboxes(checkboxFields);
  
  checkboxGroups.forEach(group => {
    if (group.fields.length > 1) {
      groups.push({
        ...group,
        groupType: 'multiselect'
      });
      group.fields.forEach(field => processedFields.add(field.name));
    }
  });

  // Handle potential multiselect fields that already have options
  potentialMultiselectFields.forEach(field => {
    if (!processedFields.has(field.name)) {
      groups.push({
        fields: [field],
        groupType: 'multiselect',
        label: field.label,
        description: field.description,
        required: field.required
      });
      processedFields.add(field.name);
    }
  });

  // Handle remaining fields individually
  fields.forEach(field => {
    if (!processedFields.has(field.name)) {
      groups.push({
        fields: [field],
        groupType: 'default'
      });
    }
  });

  return groups;
}

/**
 * Groups related checkbox fields based on naming patterns and proximity
 */
function groupRelatedCheckboxes(checkboxFields: HubSpotFormField[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  const processed = new Set<string>();

  checkboxFields.forEach(field => {
    if (processed.has(field.name)) return;

    // Look for fields with similar base names
    const basePattern = extractBasePattern(field.name);
    const relatedFields = checkboxFields.filter(f => 
      !processed.has(f.name) && 
      extractBasePattern(f.name) === basePattern &&
      Math.abs((f.displayOrder || 0) - (field.displayOrder || 0)) <= 10 // Close in display order
    );

    if (relatedFields.length > 1) {
      // Create a group for related checkboxes
      const groupLabel = deriveGroupLabel(relatedFields);
      groups.push({
        fields: relatedFields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
        groupType: 'multiselect',
        label: groupLabel,
        required: relatedFields.some(f => f.required)
      });

      relatedFields.forEach(f => processed.add(f.name));
    } else {
      // Single checkbox, add as individual group
      groups.push({
        fields: [field],
        groupType: 'default'
      });
      processed.add(field.name);
    }
  });

  return groups;
}

/**
 * Extracts base pattern from field name to identify related fields
 */
function extractBasePattern(fieldName: string): string {
  // Remove common suffixes and numbers
  return fieldName
    .replace(/_\d+$/, '') // Remove trailing numbers
    .replace(/_[a-z]$/, '') // Remove single letter suffixes
    .replace(/\d+$/, '') // Remove trailing numbers without underscore
    .toLowerCase();
}

/**
 * Derives a group label from related fields
 */
function deriveGroupLabel(fields: HubSpotFormField[]): string {
  // Try to find common prefix in labels
  if (fields.length === 0) return 'Options';
  
  const labels = fields.map(f => f.label);
  const firstLabel = labels[0];
  
  if (!firstLabel) return 'Options';
  
  // Look for common words in labels
  const commonWords = firstLabel.split(' ').filter(word => 
    labels.every(label => label.toLowerCase().includes(word.toLowerCase()))
  );

  if (commonWords.length > 0) {
    return commonWords.join(' ');
  }

  // Fallback to a generic label based on field names
  const firstField = fields[0];
  if (!firstField) return 'Options';
  
  const baseName = extractBasePattern(firstField.name);
  return baseName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Extracts form content (headers, text, etc.) from form data
 */
export function extractFormContent(formData: unknown): FormContent[] {
  const content: FormContent[] = [];
  
  if (!formData || typeof formData !== 'object') {
    return content;
  }

  const data = formData as Record<string, unknown>;
  // console.log('🔍 EXTRACT_FORM_CONTENT: Full form data structure:', JSON.stringify(data, null, 2));
  
  // Extract form name as a header if available
  if (data.name && typeof data.name === 'string') {
    content.push({
      type: 'header',
      content: data.name,
      level: 2
    });
  }
  
  // TEMPORARY: Add known content sections for NXP Web Request a Quote Form
  // This should be replaced with proper API content extraction once we find the right endpoint
  if (data.name === 'NXP Web Request a Quote Form') {
    content.push({
      type: 'text',
      content: 'Please select the products and services you are interested in:',
    });
  }

  // Extract form description if available
  if (data.description && typeof data.description === 'string') {
    content.push({
      type: 'text',
      content: data.description
    });
  }

  // Look for rich text fields in form field groups
  // Check both formFieldGroups and fieldGroups (HubSpot uses different naming)
  const formFieldGroups = (data.formFieldGroups || data.fieldGroups) as Array<{
    fields: Array<{
      fieldType: string;
      label: string;
      description?: string;
      name: string;
    }>;
  }> | undefined;
  

  // Also check if we have steps with content
  const steps = data.steps as Array<{
    fields?: Array<{
      fieldType: string;
      label: string;
      description?: string;
      name: string;
    }>;
    content?: Array<{
      type: string;
      content: string;
    }>;
  }> | undefined;

  if (steps && Array.isArray(steps)) {
    // console.log('🔍 EXTRACT_FORM_CONTENT: Found steps:', steps.length);
    steps.forEach((step, _stepIndex) => {
      // console.log(`🔍 EXTRACT_FORM_CONTENT: Processing step ${stepIndex}:`, step);
      
      // Extract step-level content
      if (step.content && Array.isArray(step.content)) {
        step.content.forEach((stepContent, _contentIndex) => {
          // console.log(`🔍 EXTRACT_FORM_CONTENT: Found step content ${contentIndex}:`, stepContent);
          content.push({
            type: stepContent.type === 'header' ? 'header' : 'text',
            content: stepContent.content,
            level: stepContent.type === 'header' ? 3 : undefined
          });
        });
      }
    });
  }

  if (formFieldGroups && Array.isArray(formFieldGroups)) {
    // console.log('🔍 EXTRACT_FORM_CONTENT: Found form field groups:', formFieldGroups.length);
    // console.log('🔍 EXTRACT_FORM_CONTENT: Field groups structure:', formFieldGroups);
    formFieldGroups.forEach((group, _groupIndex) => {
      // console.log(`🔍 EXTRACT_FORM_CONTENT: Processing group ${groupIndex}:`, group);
      if (group.fields && Array.isArray(group.fields)) {
        group.fields.forEach((field, _fieldIndex) => {
          // console.log(`🔍 EXTRACT_FORM_CONTENT: Field ${fieldIndex}:`, {
          //   name: field.name,
          //   fieldType: field.fieldType,
          //   label: field.label,
          //   description: field.description
          // });
          
          // Extract rich text fields as content
          if (field.fieldType === 'rich_text') {
            // console.log('🔍 EXTRACT_FORM_CONTENT: Found rich_text field:', field.name);
            content.push({
              type: 'text',
              content: field.label || '',
              richText: field.description || field.label || ''
            });
          }
          
          // Extract fields that are purely informational (no input)
          else if (field.fieldType === 'html' || field.fieldType === 'content' || field.fieldType === 'text_block') {
            // console.log('🔍 EXTRACT_FORM_CONTENT: Found content field:', field.name, field.fieldType);
            content.push({
              type: 'text',
              content: field.label || '',
              richText: field.description || field.label || ''
            });
          }
          
          // Check for HubSpot-specific content field types
          else if (field.fieldType === 'richtext' || field.fieldType === 'textarea' && field.description && !field.name) {
            // console.log('🔍 EXTRACT_FORM_CONTENT: Found HubSpot content field:', field);
            content.push({
              type: 'text',
              content: field.label || '',
              richText: field.description || ''
            });
          }
          
          // Check for fields with no name (likely content/display fields)
          else if (!field.name && (field.label || field.description)) {
            // console.log('🔍 EXTRACT_FORM_CONTENT: Found unnamed content field:', field);
            content.push({
              type: 'text',
              content: field.label || '',
              richText: field.description || ''
            });
          }
          
          // Check for fields that might be headers based on label patterns
          else if (field.label && field.label.length > 0 && !field.description && 
                   (field.fieldType === 'text' || field.fieldType === 'label' || field.fieldType === 'heading')) {
            // console.log('🔍 EXTRACT_FORM_CONTENT: Found potential header field:', field);
            content.push({
              type: 'header',
              content: field.label,
              level: 3
            });
          }
          
          // Catch-all: Look for any field with substantial text content that might be informational
          else if (field.description && field.description.length > 50 && 
                   (field.fieldType.includes('text') || field.fieldType.includes('area'))) {
            // console.log('🔍 EXTRACT_FORM_CONTENT: Found field with substantial description:', field);
            content.push({
              type: 'text',
              content: field.label || '',
              richText: field.description
            });
          }
        });
      }
    });
  } else {
    // console.log('🔍 EXTRACT_FORM_CONTENT: No field groups found or not an array');
    // console.log('🔍 EXTRACT_FORM_CONTENT: Available data properties:', Object.keys(data));
    
    // Try to find fields in alternative locations
    if (data.fields && Array.isArray(data.fields)) {
      // console.log('🔍 EXTRACT_FORM_CONTENT: Found direct fields array:', data.fields.length);
      const directFields = data.fields as Array<{
        fieldType: string;
        label: string;
        description?: string;
        name: string;
      }>;
      
      directFields.forEach((field, _fieldIndex) => {
        // console.log(`🔍 EXTRACT_FORM_CONTENT: Direct field ${fieldIndex}:`, field);
        // Apply the same content extraction logic
        if (field.fieldType === 'rich_text') {
          content.push({
            type: 'text',
            content: field.label || '',
            richText: field.description || field.label || ''
          });
        }
      });
    }
  }

  // Check for rich text elements in various possible locations
  const possibleContentKeys = [
    'richTextElements', 'richTextBlocks', 'textBlocks', 'contentBlocks',
    'formElements', 'elements', 'blocks', 'sections', 'components'
  ];
  
  possibleContentKeys.forEach(key => {
    // eslint-disable-next-line security/detect-object-injection
    if (data[key] && Array.isArray(data[key])) {
      // console.log(`🔍 EXTRACT_FORM_CONTENT: Found ${key}:`, data[key]);
      // eslint-disable-next-line security/detect-object-injection
      const elements = data[key] as Array<{
        type?: string;
        content?: string;
        text?: string;
        html?: string;
        richText?: string;
      }>;
      
      elements.forEach((element, _index) => {
        // console.log(`🔍 EXTRACT_FORM_CONTENT: ${key}[${index}]:`, element);
        if (element.type === 'richtext' || element.type === 'text' || element.type === 'html') {
          content.push({
            type: 'text',
            content: '',
            richText: element.content || element.text || element.html || element.richText || ''
          });
        } else if (element.type === 'header' || element.type === 'heading') {
          content.push({
            type: 'header',
            content: element.content || element.text || '',
            level: 3
          });
        }
      });
    }
  });

  // Look for any metadata that might contain content
  const metaData = data.metaData as Array<{ name: string; value: string }> | undefined;
  if (metaData && Array.isArray(metaData)) {
    // console.log('🔍 EXTRACT_FORM_CONTENT: Found metaData:', metaData);
    metaData.forEach(meta => {
      if (meta.name === 'header' || meta.name === 'title') {
        content.push({
          type: 'header',
          content: meta.value,
          level: 3
        });
      } else if (meta.name === 'description' || meta.name === 'content') {
        content.push({
          type: 'text',
          content: meta.value
        });
      }
    });
  }
  
  // Check configuration for any rich text content
  if (data.configuration && typeof data.configuration === 'object') {
    const config = data.configuration as Record<string, unknown>;
    // console.log('🔍 EXTRACT_FORM_CONTENT: Configuration keys:', Object.keys(config));
    
    if (config.richText || config.description || config.headerText) {
      // console.log('🔍 EXTRACT_FORM_CONTENT: Found content in configuration');
      if (config.richText) {
        content.push({
          type: 'text',
          richText: String(config.richText)
        });
      }
      if (config.headerText) {
        content.push({
          type: 'header',
          content: String(config.headerText),
          level: 3
        });
      }
    }
  }
  
  // console.log('🔍 EXTRACT_FORM_CONTENT: Final content array:', content);
  // console.log('🔍 EXTRACT_FORM_CONTENT: Content count:', content.length);
  
  return content;
}
