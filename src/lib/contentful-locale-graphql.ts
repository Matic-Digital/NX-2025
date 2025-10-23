import { fetchGraphQL } from '@/lib/api';
import { getCurrentLocale as getLocale } from '@/lib/contentful-locale';

import type { GraphQLResponse } from '@/types';

// Type for GraphQL variables
type GraphQLVariables = Record<string, unknown>;

/**
 * Get the current locale from various sources
 */
export function getCurrentLocale(): string {
  // Check URL parameters first
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const localeParam = urlParams.get('locale');
    if (localeParam) return localeParam;
  }

  // Check localStorage
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('contentful-locale');
    if (savedLocale) return savedLocale;
  }

  // Default to English
  return 'en-US';
}

/**
 * Fetch content with locale fallback using GraphQL
 * This modifies your existing GraphQL queries to include locale parameter
 */
export async function fetchGraphQLWithLocale(
  query: string,
  variables: GraphQLVariables = {},
  targetLocale?: string,
  preview = false
): Promise<GraphQLResponse<unknown>> {
  const locale = targetLocale ?? getLocale();

  try {
    // Add locale to variables
    const localizedVariables = {
      ...variables,
      locale: locale
    };

    // First, try to get content in the target locale
    const localizedResult = await fetchGraphQL(query, localizedVariables, preview);

    // If target locale is English or we got results, return as-is
    if (locale === 'en-US') {
      return localizedResult;
    }

    // Use Contentful's built-in locale fallback system
    // This will automatically fall back to en-US for individual fields that are empty
    return localizedResult;
  } catch {
    // Fallback to English if there's an error
    try {
      const englishVariables = {
        ...variables,
        locale: 'en-US'
      };
      return await fetchGraphQL(query, englishVariables, preview);
    } catch (_fallbackError) {
      throw _fallbackError;
    }
  }
}

/**
 * Check if content needs English fallback
 */
function _needsFallback(result: Record<string, unknown>): boolean {
  if (!result?.data) return true;

  // For posts, check if we have the basic required fields
  // Don't trigger fallback just because some optional fields are empty
  const data = result.data as Record<string, unknown>;

  // If we have a postCollection, check if we have items
  if (data.postCollection) {
    const postCollection = data.postCollection as {
      items?: Array<{ title?: string; slug?: string }>;
    };
    const items = postCollection.items;
    if (!items || items.length === 0) return true;

    const post = items[0];
    // Only trigger fallback if critical fields are missing
    if (!post?.title || !post?.slug) {
      return true;
    }

    // If we have title and slug, we have valid content - don't force fallback
    return false;
  }

  // For other content types, use the original logic
  return hasEmptyFields(data);
}

/**
 * Recursively check for empty fields in the result
 */
function hasEmptyFields(obj: Record<string, unknown>): boolean {
  if (!obj || typeof obj !== 'object') return false;

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    // eslint-disable-next-line security/detect-object-injection
    const value = obj[key];

    // Skip system fields and metadata
    if (key === 'sys' || key === '__typename' || key === 'contentfulMetadata') {
      continue;
    }

    // Check if field is empty
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return true;
    }

    // Recursively check nested objects
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      if (hasEmptyFields(value as Record<string, unknown>)) return true;
    }

    // Check array items
    if (Array.isArray(value)) {
      for (const item of value) {
        if (
          typeof item === 'object' &&
          item !== null &&
          hasEmptyFields(item as Record<string, unknown>)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Merge localized content with English fallback
 */
function _mergeWithFallback(localized: unknown, english: unknown): unknown {
  if (!localized || !english) return localized ?? english;

  if (typeof localized !== 'object' || typeof english !== 'object') {
    return localized ?? english;
  }

  if (Array.isArray(localized) && Array.isArray(english)) {
    return localized.map((item, index) =>
      // eslint-disable-next-line security/detect-object-injection
      _mergeWithFallback(item, index < english.length ? english[index] : null)
    );
  }

  const localizedObj = localized as Record<string, unknown>;
  const englishObj = english as Record<string, unknown>;

  const merged = { ...localizedObj };

  for (const key in englishObj) {
    if (!Object.prototype.hasOwnProperty.call(englishObj, key)) continue;

    // Skip system fields and metadata
    if (key === 'sys' || key === '__typename' || key === 'contentfulMetadata') {
      continue;
    }

    // Use safe property access to avoid security warnings
    const localizedValue = Object.prototype.hasOwnProperty.call(merged, key)
      ? (Object.getOwnPropertyDescriptor(merged, key)?.value as unknown)
      : undefined;
    const englishValue = Object.prototype.hasOwnProperty.call(englishObj, key)
      ? (Object.getOwnPropertyDescriptor(englishObj, key)?.value as unknown)
      : undefined;

    // Use English fallback if localized field is empty AND English value exists
    if (
      (localizedValue === null ||
        localizedValue === undefined ||
        localizedValue === '' ||
        (Array.isArray(localizedValue) && localizedValue.length === 0)) &&
      englishValue !== undefined
    ) {
      Object.defineProperty(merged, key, {
        value: englishValue,
        enumerable: true,
        writable: true,
        configurable: true
      });
    } else if (localizedValue !== null && localizedValue !== undefined) {
      // Special handling for rich text content field
      if (key === 'content' && typeof localizedValue === 'object') {
        // Content field processing without logging
      }
      // Recursively merge nested objects
      if (
        typeof localizedValue === 'object' &&
        typeof englishValue === 'object' &&
        !Array.isArray(localizedValue) &&
        localizedValue !== null &&
        englishValue !== null
      ) {
        const mergedValue = _mergeWithFallback(localizedValue, englishValue);
        Object.defineProperty(merged, key, {
          value: mergedValue,
          enumerable: true,
          writable: true,
          configurable: true
        });
      }
    }
  }

  return merged;
}

/**
 * Wrapper for your existing API functions to add locale support
 * Use this to wrap your existing API calls
 */
export function withLocaleSupport<T extends (...args: unknown[]) => Promise<unknown>>(
  apiFunction: T,
  _queryModifier?: (query: string, locale: string) => string
): T {
  return (async (...args: Parameters<T>) => {
    const locale = getCurrentLocale();

    // If it's already an English request, call original function
    if (locale === 'en-US') {
      return await apiFunction(...args);
    }

    try {
      // Try to modify the function to include locale
      // This is a simplified approach - you might need to customize based on your API structure

      // For now, call the original function and let individual components handle locale
      // You can enhance this based on your specific API patterns
      return await apiFunction(...args);
    } catch (_error) {
      throw _error;
    }
  }) as T;
}

/**
 * Helper to add locale parameter to GraphQL queries
 */
export function addLocaleToQuery(query: string, _locale = getCurrentLocale()): string {
  // Add locale parameter to the query if not already present
  if (query.includes('$locale:') || query.includes('locale:')) {
    return query;
  }

  // Find the query/mutation declaration and add locale parameter
  // eslint-disable-next-line security/detect-unsafe-regex
  const queryRegex = /(query|mutation)\s+(\w+)?\s*(\([^)]*\))?/;
  // eslint-disable-next-line security/detect-unsafe-regex, @typescript-eslint/prefer-regexp-exec
  const queryMatch = query.match(queryRegex);
  if (queryMatch) {
    const [fullMatch, type, name, existingParams] = queryMatch;
    const params = existingParams
      ? existingParams.slice(1, -1) + ', $locale: String'
      : '$locale: String';

    const newDeclaration = `${type} ${name ?? ''}(${params})`;
    return query.replace(fullMatch, newDeclaration);
  }

  return query;
}

/**
 * Helper to add locale argument to GraphQL field calls
 */
export function addLocaleToFields(query: string, _locale = getCurrentLocale()): string {
  // This is a basic implementation - you might need to customize based on your schema
  // Add locale: $locale to collection and entry calls
  return query
    .replace(/(\w+Collection\s*\([^)]*)\)/g, `$1, locale: $locale)`)
    .replace(/(\w+\s*\([^)]*sys:\s*{\s*id:\s*[^}]+\s*}\s*)\)/g, `$1, locale: $locale)`);
}
