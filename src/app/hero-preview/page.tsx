/**
 * Hero Preview Component
 *
 * This page enables content editors to preview Hero components directly from Contentful's
 * preview environment. It fetches Hero content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Server-side rendering with Next.js draft mode for preview content
 * - Dynamic fetching of Hero content based on ID parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Hero IDs
 * - Forced dynamic rendering to ensure preview content is always fresh
 * - Disabled caching to ensure latest draft content is always displayed
 */

import { getHero } from '@/lib/api';
import { Hero } from '@/components/global/Hero';
import { Box } from '@/components/global/matic-ds';
import { draftMode } from 'next/headers';
import ContentfulLivePreviewInitializer from '@/components/global/ContentfulLivePreviewInitializer';

// Force dynamic rendering for this page to ensure live updates work
export const dynamic = 'force-dynamic';

// Disable caching for this page
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Define the props type for the page component
interface HeroPreviewPageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<{
    id?: string;
    heroId?: string;
  }>;
}

/**
 * Hero Preview Page
 * This page is specifically for previewing the Hero component with Contentful Live Preview
 */
export default async function HeroPreviewPage({ params, searchParams }: HeroPreviewPageProps) {
  // Await the params and searchParams Promises (required in Next.js 15)
  await params; // We need to await this even if we don't use it
  const resolvedSearchParams = await searchParams;

  // Get the hero ID from the query parameters, or use a default ID
  // Accept either 'id' or 'heroId' parameter for compatibility
  const heroId =
    resolvedSearchParams?.heroId ??
    resolvedSearchParams?.id ??
    process.env.NEXT_PUBLIC_DEFAULT_HERO_ID ??
    '';

  const draftModeData = await draftMode();
  const isDraftMode = draftModeData.isEnabled;

  // Always use preview mode for this page
  const usePreview = true;

  // Fetch the hero data directly using the ID
  let heroData = null;
  let error = null;

  try {
    if (heroId) {
      console.log('Fetching hero with ID:', heroId, 'usePreview:', usePreview);
      // Make sure we're using the getHero function which fetches by ID
      heroData = await getHero(heroId, usePreview);
      console.log('Hero data received:', heroData);
    }
  } catch (err) {
    console.error('Error fetching hero:', err);
    error = err instanceof Error ? err.message : 'An unknown error occurred';
  }

  return (
    <Box direction="col" gap={8} className="min-h-screen py-12">
      {/* Preview Status */}
      <Box className="mx-auto max-w-7xl px-4">
        <div className="mb-8 rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.75.75 0 00.736-.686l.057-.75a.75.75 0 00-.75-.813H9A.75.75 0 009 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-body-xs font-medium text-blue-800">Hero Preview Mode</h3>
              <div className="text-body-xs mt-2 text-blue-700">
                <p>
                  You are viewing the Hero component in preview mode.{' '}
                  {isDraftMode ? 'Draft mode is enabled.' : 'Draft mode is disabled.'}
                </p>
                {heroId && <p className="mt-1">Hero ID: {heroId}</p>}
              </div>
            </div>
          </div>
        </div>
      </Box>

      {/* Error Message */}
      {error && (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-body-xs font-medium text-red-800">Error Loading Hero</h3>
                <div className="text-body-xs mt-2 text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* No Hero ID Provided */}
      {!heroId && !error && (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-body-xs font-medium text-yellow-800">No Hero ID Provided</h3>
                <div className="text-body-xs mt-2 text-yellow-700">
                  <p>
                    Please provide a hero ID in the URL query parameters (e.g., ?id=your-hero-id).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* Contentful Live Preview Initializer */}
      <ContentfulLivePreviewInitializer />

      {/* Hero Component */}
      {heroData ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="mb-2 text-center text-xs text-gray-500">Hero Component Preview</div>
          <pre className="mb-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-500">
            {JSON.stringify(heroData, null, 2)}
          </pre>
          <Hero {...heroData} />
        </div>
      ) : (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-body-xs font-medium text-yellow-800">No Hero Data Found</h3>
                <div className="text-body-xs mt-2 text-yellow-700">
                  <p>
                    No hero data was found for ID: {heroId}. Make sure the ID exists in Contentful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}
    </Box>
  );
}
