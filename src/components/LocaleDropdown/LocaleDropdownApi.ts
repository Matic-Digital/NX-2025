import type { Locale } from './LocaleDropdownSchema';

/**
 * Contentful Management API response type for locales
 */
// interface ContentfulLocaleResponse {
//   sys: {
//     id: string;
//     type: string;
//     version: number;
//   };
//   name: string;
//   code: string;
//   default: boolean;
//   contentManagementApi: boolean;
//   contentDeliveryApi: boolean;
//   optional: boolean;
// }

// interface ContentfulLocalesResponse {
//   sys: {
//     type: string;
//   };
//   total: number;
//   skip: number;
//   limit: number;
//   items: ContentfulLocaleResponse[];
// }

/**
 * Fetch available locales from Contentful via our server-side API
 */
export async function getAvailableLocales(): Promise<Locale[]> {
  try {
    console.log('Fetching locales from server API...');

    const response = await fetch('/api/locales', {
      method: 'GET',
      cache: 'no-cache' // Don't cache during debugging
    });

    if (!response.ok) {
      console.error('Failed to fetch locales from API:', response.status, response.statusText);
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      console.error('API Error:', errorData);
      return getFallbackLocales();
    }

    const data = (await response.json()) as { locales?: Locale[] };

    if (!data.locales || data.locales.length === 0) {
      console.warn('No locales returned from API');
      return getFallbackLocales();
    }

    console.log('Fetched locales from Contentful:', data.locales ?? []);
    return data.locales ?? [];
  } catch (error) {
    console.error('Error fetching locales:', error);
    return getFallbackLocales();
  }
}

/**
 * Fallback locales when API call fails
 */
function getFallbackLocales(): Locale[] {
  console.log('Using fallback locales');
  return [{ code: 'en-US', name: 'English (US)', default: true }];
}

/**
 * Get the current locale from various sources
 */
export function getCurrentLocale(): string {
  // Check URL parameters
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

  // Always default to English instead of browser language
  // This ensures consistent English default regardless of user's browser settings
  return 'en-US';
}

/**
 * Set the current locale
 */
export function setCurrentLocale(locale: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('contentful-locale', locale);

    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('locale', locale);
    window.history.replaceState({}, '', url.toString());

    // Reload page to apply locale changes
    window.location.reload();
  }
}
