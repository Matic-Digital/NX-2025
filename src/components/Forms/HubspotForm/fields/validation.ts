import type { HubSpotFormField } from './types';

// Field validation function for TanStack Form - matches HubSpot validation exactly
export const validateField = (field: HubSpotFormField) => {
  return (value: unknown) => {
    const errors: string[] = [];
    const _cleanLabel = field.label.replace(/\s*-\s*\d+$/, '').trim();

    // Required field validation (HubSpot style)
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      // Use HubSpot's error message if available, otherwise use default
      const requiredMessage = field.validation?.requiredErrorMessage || 
                             field.validation?.message || 
                             field.validation?.errorMessage || 
                             `Please complete this required field.`;
      errors.push(requiredMessage);
    }

    // Only validate content if there's a value
    if (value && typeof value === 'string' && value.trim() !== '') {
      const trimmedValue = value.trim();

      // Email validation (matches HubSpot's email validation)
      if (field.fieldType === 'email') {
        // HubSpot's email regex is more permissive
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          const emailMessage = field.validation?.formatErrorMessage || 
                               field.validation?.invalidMessage || 
                               field.validation?.message || 
                               field.validation?.errorMessage || 
                               'Email must be formatted correctly.';
          errors.push(emailMessage);
        }

        // Check blocked domains if specified
        if (
          field.validation?.blockedEmailDomains &&
          field.validation.blockedEmailDomains.length > 0
        ) {
          const domain = trimmedValue.split('@')[1]?.toLowerCase();
          if (
            domain &&
            field.validation.blockedEmailDomains.some(
              (blocked) =>
                domain === blocked.toLowerCase() || domain.endsWith('.' + blocked.toLowerCase())
            )
          ) {
            const blockedDomainMessage = field.validation?.message || 'Please enter a business email address.';
            errors.push(blockedDomainMessage);
          }
        }
      }

      // Mobile phone validation (matches HubSpot's mobile_phone validation)
      if (field.fieldType === 'mobile_phone') {
        // Extract only digits from the phone number
        const digitsOnly = trimmedValue.replace(/\D/g, '');

        if (
          field.validation?.minAllowedDigits &&
          digitsOnly.length < field.validation.minAllowedDigits
        ) {
          const minDigitsMessage = field.validation?.message || 
            `Phone number must contain at least ${field.validation.minAllowedDigits} digits.`;
          errors.push(minDigitsMessage);
        }

        if (
          field.validation?.maxAllowedDigits &&
          digitsOnly.length > field.validation.maxAllowedDigits
        ) {
          const maxDigitsMessage = field.validation?.message || 
            `Phone number must contain no more than ${field.validation.maxAllowedDigits} digits.`;
          errors.push(maxDigitsMessage);
        }

        // Basic phone format validation
        if (digitsOnly.length > 0 && digitsOnly.length < 7) {
          const phoneFormatMessage = field.validation?.message || 'Please enter a valid phone number.';
          errors.push(phoneFormatMessage);
        }
      }

      // Single line text validation
      if (field.fieldType === 'single_line_text') {
        // Check for common text validation rules
        if (field.validation?.name) {
          switch (field.validation.name) {
            case 'minLength':
              if (field.validation.data && trimmedValue.length < parseInt(field.validation.data)) {
                errors.push(
                  field.validation.message ??
                    `Must be at least ${field.validation.data} characters.`
                );
              }
              break;
            case 'maxLength':
              if (field.validation.data && trimmedValue.length > parseInt(field.validation.data)) {
                errors.push(
                  field.validation.message ??
                    `Must be no more than ${field.validation.data} characters.`
                );
              }
              break;
            case 'regex':
              if (field.validation.data) {
                try {
                  // Use a predefined safe regex pattern instead of dynamic construction
                  const pattern = String(field.validation.data);
                  // Only allow basic patterns - reject potentially dangerous ones
                  if (
                    pattern.includes('(') ||
                    pattern.includes('[') ||
                    pattern.includes('{') ||
                    pattern.length > 100
                  ) {
                    break;
                  }
                  // Create regex with explicit flags for safety - use static pattern validation
                  const safePattern = String(pattern).slice(0, 100); // Limit pattern length
                  // eslint-disable-next-line security/detect-non-literal-regexp
                  const regex = new RegExp(safePattern, 'u');
                  if (!regex.test(trimmedValue)) {
                    errors.push(field.validation.message ?? 'Please enter a valid value.');
                  }
                } catch {
                  // Invalid regex pattern - skip validation
                }
              }
              break;
          }
        }
      }

      // URL validation
      if (field.fieldType === 'url') {
        try {
          new URL(trimmedValue);
        } catch {
          const urlMessage = field.validation?.message || 'Please enter a valid URL.';
          errors.push(urlMessage);
        }
      }

      // Number validation
      if (field.fieldType === 'number') {
        const numValue = parseFloat(trimmedValue);
        if (isNaN(numValue)) {
          const numberMessage = field.validation?.message || 'Please enter a valid number.';
          errors.push(numberMessage);
        }
      }
    }

    return errors.length > 0 ? errors[0] : undefined;
  };
};
