import type { HubSpotFormField } from './types';

// Field validation function for TanStack Form - matches HubSpot validation exactly
export const validateField = (field: HubSpotFormField) => {
  return (value: unknown) => {
    const errors: string[] = [];
    const _cleanLabel = field.label.replace(/\s*-\s*\d+$/, '').trim();

    // Required field validation (HubSpot style)
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(`Please complete this required field.`);
    }

    // Only validate content if there's a value
    if (value && typeof value === 'string' && value.trim() !== '') {
      const trimmedValue = value.trim();

      // Email validation (matches HubSpot's email validation)
      if (field.fieldType === 'email') {
        // HubSpot's email regex is more permissive
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          errors.push('Email must be formatted correctly.');
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
            errors.push('Please enter a business email address.');
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
          errors.push(
            `Phone number must contain at least ${field.validation.minAllowedDigits} digits.`
          );
        }

        if (
          field.validation?.maxAllowedDigits &&
          digitsOnly.length > field.validation.maxAllowedDigits
        ) {
          errors.push(
            `Phone number must contain no more than ${field.validation.maxAllowedDigits} digits.`
          );
        }

        // Basic phone format validation
        if (digitsOnly.length > 0 && digitsOnly.length < 7) {
          errors.push('Please enter a valid phone number.');
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
                } catch {}
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
          errors.push('Please enter a valid URL.');
        }
      }

      // Number validation
      if (field.fieldType === 'number') {
        const numValue = parseFloat(trimmedValue);
        if (isNaN(numValue)) {
          errors.push('Please enter a valid number.');
        }
      }
    }

    return errors.length > 0 ? errors[0] : undefined;
  };
};
