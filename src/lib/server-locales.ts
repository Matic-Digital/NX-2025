import { cache } from 'react';

export interface LocaleOption {
  code: string;
  name: string;
  default: boolean;
}

// Interface for Contentful Management API response
interface ContentfulLocaleResponse {
  items: Array<{
    sys: {
      type: string;
    };
    code: string;
    name: string;
    default: boolean;
  }>;
}

/**
 * Server-side function to fetch available locales from Contentful Management API
 * Cached to avoid repeated API calls during SSR
 */
export const getServerLocales = cache(async (): Promise<LocaleOption[]> => {
  try {
    console.log('🌐 [Server] Fetching locales from Contentful Management API');
    
    const response = await fetch(
      `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/locales`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_TOKEN}`,
        },
        // Cache for 1 hour since locales don't change frequently
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch locales: ${response.statusText}`);
    }

    const data = await response.json() as ContentfulLocaleResponse;
    
    // Filter and map locales to our format
    const locales: LocaleOption[] = data.items
      .filter((locale) => locale.sys.type === 'Locale')
      .map((locale) => ({
        code: locale.code,
        name: locale.name,
        default: locale.default ?? false,
      }))
      .sort((a, b) => {
        // Sort with default locale first, then alphabetically
        if (a.default) return -1;
        if (b.default) return 1;
        return a.name.localeCompare(b.name);
      });

    console.log(`🌐 [Server] Found ${locales.length} locales:`, locales.map(l => l.code));
    return locales;

  } catch (error) {
    console.error('🌐 [Server] Error fetching locales:', error);
    
    // Fallback to minimal locale set
    const fallbackLocales: LocaleOption[] = [
      { code: 'en-US', name: 'English (US)', default: true },
      { code: 'pt-BR', name: 'Português (Brasil)', default: false },
      { code: 'es', name: 'Español', default: false },
    ];
    
    console.log('🌐 [Server] Using fallback locales');
    return fallbackLocales;
  }
});
