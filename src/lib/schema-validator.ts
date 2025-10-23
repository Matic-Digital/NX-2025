/**
 * Schema Validation Utilities
 *
 * Helper functions to validate and debug Schema.org structured data
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

/**
 * Validate that a schema object has required fields
 */
export function validateSchema(
  schema: any,
  requiredFields: string[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if schema has @context and @type
  if (!schema['@context']) {
    errors.push('Missing @context field');
  }

  if (!schema['@type']) {
    errors.push('Missing @type field');
  }

  // Check required fields
  requiredFields.forEach((field) => {
    // eslint-disable-next-line security/detect-object-injection
    if (!Object.prototype.hasOwnProperty.call(schema, field) || !schema[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate WebPage schema
 */
export function validateWebPageSchema(schema: any) {
  return validateSchema(schema, ['name', 'url']);
}

/**
 * Validate Article schema
 */
export function validateArticleSchema(schema: any) {
  return validateSchema(schema, ['headline', 'author', 'datePublished']);
}

/**
 * Validate Product schema
 */
export function validateProductSchema(schema: any) {
  return validateSchema(schema, ['name', 'brand']);
}

/**
 * Validate Event schema
 */
export function validateEventSchema(schema: any) {
  return validateSchema(schema, ['name', 'startDate']);
}

/**
 * Validate Organization schema
 */
export function validateOrganizationSchema(schema: any) {
  return validateSchema(schema, ['name', 'url']);
}

/**
 * Log schema validation results to console (development only)
 */
export function debugSchema(schema: any, schemaType: string) {
  if (process.env.NODE_ENV !== 'development') return;

  let validation;
  switch (schemaType.toLowerCase()) {
    case 'webpage':
      validation = validateWebPageSchema(schema);
      break;
    case 'article':
      validation = validateArticleSchema(schema);
      break;
    case 'product':
      validation = validateProductSchema(schema);
      break;
    case 'event':
      validation = validateEventSchema(schema);
      break;
    case 'organization':
      validation = validateOrganizationSchema(schema);
      break;
    default:
      validation = validateSchema(schema, ['name']);
  }

  if (validation.isValid) {
  } else {
    validation.errors.forEach((_error) => {
      // Error logging removed
    });
  }
}

/**
 * Extract and validate all schemas from a page (client-side only)
 */
export function validatePageSchemas() {
  if (typeof window === 'undefined') return;

  const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');

  schemaScripts.forEach((script, _index) => {
    try {
      const schema = JSON.parse(script.textContent || '{}');
      const schemaType = schema['@type'] || 'Unknown';

      debugSchema(schema, schemaType);
    } catch {}
  });
}

/**
 * Generate validation URLs for external tools
 */
export function getValidationUrls(pageUrl: string) {
  const encodedUrl = encodeURIComponent(pageUrl);

  return {
    googleRichResults: `https://search.google.com/test/rich-results?url=${encodedUrl}`,
    schemaOrgValidator: `https://validator.schema.org/#url=${encodedUrl}`,
    structuredDataTesting: `https://search.google.com/structured-data/testing-tool?url=${encodedUrl}`
  };
}

/**
 * Development helper to log validation URLs
 */
export function logValidationUrls(pageUrl?: string) {
  if (process.env.NODE_ENV !== 'development') return;

  const url =
    pageUrl ||
    (typeof window !== 'undefined'
      ? window.location.href
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');
  const _urls = getValidationUrls(url);
}
