import { createClient } from 'contentful';

// Interfaces for Contentful API responses
export interface ContentfulEntry {
  sys: {
    id: string;
    type: string;
  };
  fields: Record<string, unknown>;
}

interface _ContentfulCollection<T = ContentfulEntry> {
  items: T[];
  total: number;
}

/**
 * Get the current locale from various sources with guaranteed fallback to en-US
 */
export function getCurrentLocale(): string {
  let detectedLocale = 'en-US'; // Always start with fallback

  // Check URL parameters first (highest priority)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const localeParam = urlParams.get('locale');
    if (localeParam && isValidLocale(localeParam)) {
      return localeParam; // Return immediately if URL has valid locale
    }
  }

  // Check localStorage as fallback
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('contentful-locale');
    if (savedLocale && isValidLocale(savedLocale)) {
      detectedLocale = savedLocale;
      
      // Add locale to URL if not present but exists in localStorage
      addLocaleToCurrentUrl(savedLocale);
    }
  }

  return detectedLocale;
}

/**
 * Add locale parameter to current URL if not already present
 */
function addLocaleToCurrentUrl(locale: string): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  if (!url.searchParams.has('locale')) {
    url.searchParams.set('locale', locale);
    // Use replaceState to avoid adding to history
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Validate if a locale is supported
 */
function isValidLocale(locale: string): boolean {
  const supportedLocales = ['en-US', 'pt-BR', 'es'];
  return supportedLocales.includes(locale);
}

/**
 * Create a Contentful client with locale-aware configuration
 */
export function createLocaleAwareClient() {
  return createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
  });
}

/**
 * Get content with locale fallback
 * Fetches content in the target locale, with English fallback for empty fields
 */
export async function getContentWithFallback<T = ContentfulEntry>(
  contentType: string,
  query: Record<string, unknown> = {},
  targetLocale?: string
): Promise<T[]> {
  const client = createLocaleAwareClient();
  const locale = targetLocale ?? getCurrentLocale();

  try {
    // First, try to get content in the target locale
    const localizedContent = await client.getEntries({
      content_type: contentType,
      locale: locale,
      ...query,
    });
    
    // If target locale is English or no items found, return as-is
    if (locale === 'en-US') {
      return localizedContent.items as T[];
    }
    
    if (localizedContent.items.length === 0) {
      return localizedContent.items as T[];
    }

    // For non-English locales, also fetch English content for fallback
    const englishContent = await client.getEntries({
      content_type: contentType,
      locale: 'en-US',
      ...query,
    });

    // Merge localized content with English fallbacks
    const mergedItems = localizedContent.items.map((localizedItem: ContentfulEntry, _index: number) => {
      // Find corresponding English item
      const englishItem = englishContent.items.find(
        (item: ContentfulEntry) => item.sys.id === localizedItem.sys.id
      );

      if (!englishItem) {
        return localizedItem;
      }

      // Merge fields with fallback logic
      const mergedFields = { ...localizedItem.fields };
      let _fallbackCount = 0;
      let _preservedCount = 0;
      
      // For each field in the English version, use it as fallback if localized is empty
      Object.keys(englishItem.fields ?? {}).forEach((fieldKey) => {
        // eslint-disable-next-line security/detect-object-injection
        const localizedValue = Object.prototype.hasOwnProperty.call(mergedFields, fieldKey) ? mergedFields[fieldKey] : undefined;
        // eslint-disable-next-line security/detect-object-injection
        const englishValue = englishItem.fields && Object.prototype.hasOwnProperty.call(englishItem.fields, fieldKey) 
          // eslint-disable-next-line security/detect-object-injection
          ? englishItem.fields[fieldKey] 
          : undefined;

        // Use English fallback if localized field is empty AND English value exists
        if (
          (localizedValue === null ||
          localizedValue === undefined ||
          localizedValue === '' ||
          (Array.isArray(localizedValue) && localizedValue.length === 0)) &&
          englishValue !== undefined
        ) {
          Object.defineProperty(mergedFields, fieldKey, { value: englishValue, enumerable: true, writable: true, configurable: true });
          _fallbackCount++;
        } else if (localizedValue !== null && localizedValue !== undefined) {
          _preservedCount++;
        }
      });
      
      return {
        ...localizedItem,
        fields: mergedFields,
      };
    });

    return mergedItems as T[];

  } catch (error) {
    console.error(`Error fetching ${contentType} with locale fallback:`, error);
    
    // Fallback to English if there's an error
    try {
      const englishContent = await client.getEntries({
        content_type: contentType,
        locale: 'en-US',
        ...query,
      });
      return englishContent.items as T[];
    } catch (fallbackError) {
      console.error('Fallback to English also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Get a single entry with locale fallback
 */
export async function getEntryWithFallback<T = ContentfulEntry>(
  entryId: string,
  targetLocale?: string
): Promise<T | null> {
  const client = createLocaleAwareClient();
  const locale = targetLocale ?? getCurrentLocale();

  try {
    // Get the entry in target locale
    const localizedEntry = await client.getEntry(entryId, {
      locale: locale,
    });

    // If target locale is English, return as-is
    if (locale === 'en-US') {
      return localizedEntry as T;
    }

    // Also get English version for fallback
    const englishEntry = await client.getEntry(entryId, {
      locale: 'en-US',
    });

    // Merge with English fallback
    const mergedFields = { ...localizedEntry.fields };
    
    Object.keys(englishEntry.fields ?? {}).forEach((fieldKey) => {
      // eslint-disable-next-line security/detect-object-injection
      const localizedValue = Object.prototype.hasOwnProperty.call(mergedFields, fieldKey) ? mergedFields[fieldKey] : undefined;
      // eslint-disable-next-line security/detect-object-injection
      const englishValue = englishEntry.fields && Object.prototype.hasOwnProperty.call(englishEntry.fields, fieldKey) 
        // eslint-disable-next-line security/detect-object-injection
        ? englishEntry.fields[fieldKey] 
        : undefined;

      // Only use English fallback if localized field is empty AND English value exists
      if (
        (localizedValue === null ||
        localizedValue === undefined ||
        localizedValue === '' ||
        (Array.isArray(localizedValue) && localizedValue.length === 0)) &&
        englishValue !== undefined
      ) {
        Object.defineProperty(mergedFields, fieldKey, { value: englishValue, enumerable: true, writable: true, configurable: true });
      }
    });

    return {
      ...localizedEntry,
      fields: mergedFields,
    } as T;

  } catch (error) {
    console.error(`Error fetching entry ${entryId} with locale fallback:`, error);
    
    // Fallback to English
    try {
      const englishEntry = await client.getEntry(entryId, {
        locale: 'en-US',
      });
      return englishEntry as T;
    } catch (fallbackError) {
      console.error('Fallback to English also failed:', fallbackError);
      return null;
    }
  }
}

/**
 * Server-side function to get content with locale fallback
 * Use this in API routes and server components
 */
export async function getServerContentWithFallback<T = ContentfulEntry>(
  contentType: string,
  query: Record<string, unknown> = {},
  targetLocale = 'en-US'
): Promise<T[]> {
  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
  });

  try {
    // Get content in target locale
    const localizedContent = await client.getEntries({
      content_type: contentType,
      locale: targetLocale,
      ...query,
    });

    if (targetLocale === 'en-US') {
      return localizedContent.items as T[];
    }

    // Get English fallback
    const englishContent = await client.getEntries({
      content_type: contentType,
      locale: 'en-US',
      ...query,
    });

    // Merge with fallback logic
    const mergedItems = localizedContent.items.map((localizedItem: ContentfulEntry) => {
      const englishItem = englishContent.items.find(
        (item: ContentfulEntry) => item.sys.id === localizedItem.sys.id
      );

      if (!englishItem) return localizedItem;

      const mergedFields = { ...localizedItem.fields };
      
      Object.keys(englishItem.fields ?? {}).forEach((fieldKey) => {
        // eslint-disable-next-line security/detect-object-injection
        const localizedValue = Object.prototype.hasOwnProperty.call(mergedFields, fieldKey) ? mergedFields[fieldKey] : undefined;
        // eslint-disable-next-line security/detect-object-injection
        const englishValue = englishItem.fields && Object.prototype.hasOwnProperty.call(englishItem.fields, fieldKey) 
          // eslint-disable-next-line security/detect-object-injection
          ? englishItem.fields[fieldKey] 
          : undefined;

        if (
          (localizedValue === null ||
          localizedValue === undefined ||
          localizedValue === '' ||
          (Array.isArray(localizedValue) && localizedValue.length === 0)) &&
          englishValue !== undefined
        ) {
          Object.defineProperty(mergedFields, fieldKey, { value: englishValue, enumerable: true, writable: true, configurable: true });
        }
      });

      return {
        ...localizedItem,
        fields: mergedFields,
      };
    });

    return mergedItems as T[];

  } catch (error) {
    console.error(`[Server] Error fetching ${contentType} with locale fallback:`, error);
    
    try {
      const englishContent = await client.getEntries({
        content_type: contentType,
        locale: 'en-US',
        ...query,
      });
      return englishContent.items as T[];
    } catch (fallbackError) {
      console.error('[Server] Fallback to English also failed:', fallbackError);
      return [];
    }
  }
}
