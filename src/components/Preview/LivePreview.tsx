import type { ReactNode } from 'react';

interface LivePreviewProps<T = unknown> {
  componentName: string;
  data: T;
  requiredFields?: (keyof T)[];
  customValidation?: (data: T) => { isValid: boolean; missingFields: string[] };
  isLoading?: boolean;
  error?: string | null;
  children: ReactNode;
}

/**
 * Helper function to check if all required fields are present in the data
 */
function hasAllRequiredFields<T>(data: T, requiredFields: (keyof T)[]): boolean {
  if (!data || typeof data !== 'object') return false;
  return requiredFields.every((field) => {
    // Safe property access with type guard
    if (!(field in (data as Record<string, unknown>))) return false;
    const value = (data as Record<string, unknown>)[field as string];
    // Check for truthy values, but allow 0 and false as valid
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Helper function to generate missing field messages
 */
function getMissingFieldMessages<T>(data: T, requiredFields: (keyof T)[]): string[] {
  if (!data || typeof data !== 'object') {
    return requiredFields.map((field) => `${String(field)} is required`);
  }

  return requiredFields
    .filter((field) => {
      // Safe property access with type guard
      if (!(field in (data as Record<string, unknown>))) return true;
      const value = (data as Record<string, unknown>)[field as string];
      return value === null || value === undefined || value === '';
    })
    .map((field) => {
      // Convert field name to human-readable format
      const fieldName = String(field)
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim();
      return `${fieldName} is required`;
    });
}

/**
 * Utility function to create custom validation for OR logic
 * Example: validateButtonFields(data, [['text', 'internalText']], ['sys'])
 */
export function createOrValidation<T>(
  data: T,
  orGroups: (keyof T)[][],
  requiredFields: (keyof T)[] = []
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return { isValid: false, missingFields: ['Data is required'] };
  }

  // Check required fields (AND logic)
  for (const field of requiredFields) {
    if (!(field in (data as Record<string, unknown>))) {
      const fieldName = String(field)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      missingFields.push(`${fieldName} is required`);
      continue;
    }
    
    const value = (data as Record<string, unknown>)[field as string];
    if (value === null || value === undefined || value === '') {
      const fieldName = String(field)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      missingFields.push(`${fieldName} is required`);
    }
  }

  // Check OR groups (at least one field in each group must be present)
  for (const orGroup of orGroups) {
    const hasAnyFieldInGroup = orGroup.some((field) => {
      if (!(field in (data as Record<string, unknown>))) return false;
      const value = (data as Record<string, unknown>)[field as string];
      return value !== null && value !== undefined && value !== '';
    });

    if (!hasAnyFieldInGroup) {
      const fieldNames = orGroup
        .map((field) =>
          String(field)
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim()
        )
        .join(' or ');
      missingFields.push(`${fieldNames} is required`);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Utility function to create validation for collections with optional items
 */
export function createCollectionValidation<T>(
  data: T,
  requiredFields: (keyof T)[],
  collectionField: keyof T,
  allowEmptyCollection = false
): { isValid: boolean; missingFields: string[] } {
  const basicValidation = createOrValidation(data, [], requiredFields);
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  if (!allowEmptyCollection && data && typeof data === 'object') {
    const collection = (data as Record<string, unknown>)[collectionField as string];
    if (!collection || (Array.isArray(collection) && collection.length === 0)) {
      const fieldName = String(collectionField)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      return {
        isValid: false,
        missingFields: [...basicValidation.missingFields, `${fieldName} must contain at least one item`]
      };
    }
  }

  return basicValidation;
}

/**
 * LivePreview Component
 *
 * A reusable component for displaying live previews in Contentful Live Preview.
 * Shows the component preview when all required fields are present, or a placeholder
 * with missing field messages when fields are missing.
 *
 * Features:
 * - Simple field validation via requiredFields array
 * - Custom validation via customValidation function
 * - Loading state support
 * - Error state support
 * - Automatic human-readable error messages
 *
 * Usage Examples:
 * 
 * // Simple validation
 * <LivePreview
 *   componentName="MyComponent"
 *   data={data}
 *   requiredFields={['sys', 'title']}
 * >
 *   <MyComponent {...data} />
 * </LivePreview>
 *
 * // Custom validation (OR logic)
 * <LivePreview
 *   componentName="Button"
 *   data={data}
 *   customValidation={(data) => createOrValidation(data, [['text', 'internalText']], ['sys'])}
 * >
 *   <Button {...data} />
 * </LivePreview>
 *
 * // With loading/error states
 * <LivePreview
 *   componentName="AsyncComponent"
 *   data={data}
 *   isLoading={loading}
 *   error={error}
 *   requiredFields={['sys', 'title']}
 * >
 *   <AsyncComponent {...data} />
 * </LivePreview>
 */
export function LivePreview<T = unknown>({
  componentName,
  data,
  requiredFields,
  customValidation,
  isLoading = false,
  error = null,
  children
}: LivePreviewProps<T>) {
  // Determine validation approach
  let hasRequiredFields = false;
  let missingFieldMessages: string[] = [];

  if (customValidation) {
    // Use custom validation function
    const validationResult = customValidation(data);
    hasRequiredFields = validationResult.isValid;
    missingFieldMessages = validationResult.missingFields;
  } else if (requiredFields && requiredFields.length > 0) {
    // Use standard field validation
    hasRequiredFields = hasAllRequiredFields(data, requiredFields);
    missingFieldMessages = getMissingFieldMessages(data, requiredFields);
    
  } else {
    // No validation specified - assume valid
    hasRequiredFields = true;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Live Preview</span>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {componentName}
        </span>
      </div>
      <div className="overflow-hidden">
        {(() => {
          
          if (isLoading) {
            return (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
                <p>Loading preview...</p>
              </div>
            );
          }
          
          if (error) {
            return (
              <div className="p-8 text-center text-red-500">
                <p>Error loading preview: {error}</p>
              </div>
            );
          }
          
          if (hasRequiredFields) {
            return children;
          }
          
          return (
            <div className="p-8 text-center text-gray-500">
              <p>Preview will appear when all required fields are configured:</p>
              {missingFieldMessages.length > 0 && (
                <ul className="mt-2 text-sm">
                  {missingFieldMessages.map((message, index) => (
                    <li key={index}>• {message}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
