// Next.js metadata types
import type { Metadata } from 'next';

import { Container } from '@/components/global/matic-ds';
import { getAllPages, getAllPageLists, getPageBySlug } from '@/lib/contentful-api';
import { getAllFooters } from '@/lib/contentful-api/footer';
import { PageLayout } from '@/components/layout/PageLayout';
import { BannerHero } from '@/components/BannerHero';
import { CtaBanner } from '@/components/CtaBanner';
import { ContentGrid } from '@/components/ContentGrid';
import type { FooterResponse } from '@/types/contentful/Footer';
import { ImageBetween } from '@/components/ImageBetween';
import type { PageResponse } from '@/types/contentful/Page';
import type { PageListResponse } from '@/types/contentful/PageList';
import type { Page } from '@/types/contentful/Page';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Footer as FooterType } from '@/types/contentful/Footer';
import type { PageLayout as PageLayoutType } from '@/types/contentful/PageLayout';

/**
 * Generate metadata for the page, including Open Graph tags
 */
export async function generateMetadata(): Promise<Metadata> {
  // Try to fetch the home page data
  const homePage = await getPageBySlug('/', false);

  // Default metadata
  const defaultMetadata = {
    title: 'Nextracker',
    description: 'Nextracker Website 2025'
  };

  // If no home page data, return defaults
  if (!homePage) {
    return defaultMetadata;
  }

  // Construct the base URL for absolute image URLs
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextracker.com';

  // Import utility functions for safe metadata extraction
  const { extractOpenGraphImage, extractSEOTitle, extractSEODescription } = await import(
    '@/lib/metadata-utils'
  );

  // Safely extract the openGraphImage with proper typing
  const openGraphImage = extractOpenGraphImage(homePage, baseUrl, homePage?.title ?? 'Nextracker');

  // Safely extract image URL
  const getImageUrl = (url: string): string => {
    return url.startsWith('http') ? url : `${baseUrl}${url}`;
  };

  // Get the image URL safely
  const imageUrl = openGraphImage?.url ? getImageUrl(openGraphImage.url) : undefined;

  // Build the images array for Open Graph
  const ogImages = imageUrl
    ? [
        {
          url: imageUrl,
          width: openGraphImage?.width ?? 1200,
          height: openGraphImage?.height ?? 630,
          alt: openGraphImage?.title ?? homePage.title ?? 'Nextracker'
        }
      ]
    : [];

  // Build the metadata object with Open Graph tags
  const title = extractSEOTitle(homePage, defaultMetadata.title);
  const description = extractSEODescription(homePage, defaultMetadata.description);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImages,
      siteName: 'Nextracker',
      type: 'website',
      url: baseUrl
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : []
    }
  };
}

// Define the component mapping for pageContent items
const componentMap = {
  BannerHero: BannerHero,
  ContentGrid: ContentGrid,
  CtaBanner: CtaBanner,
  ImageBetween: ImageBetween
  // Add other component types here as they are created
};

/**
 * Landing page
 *
 * This component first tries to fetch a page with the slug '/' from Contentful.
 * If such a page exists, it renders that page as the homepage.
 * Otherwise, it falls back to the default homepage that displays lists of pages and page lists.
 */
export default async function HomePage() {
  // Try to fetch a page with the slug '/' from Contentful
  const homePage = await getPageBySlug('/', false);

  // If a page with slug '/' exists, render it as the homepage
  if (homePage) {
    return renderContentfulHomePage(homePage);
  }

  // Otherwise, fall back to the default homepage
  return renderDefaultHomePage();
}

/**
 * Renders a Contentful page as the homepage
 */
async function renderContentfulHomePage(page: Page) {
  const pageLayout = page.pageLayout as PageLayoutType | undefined;
  const pageHeader = pageLayout?.header as HeaderType | undefined;
  const pageFooter = pageLayout?.footer as FooterType | undefined;
  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <h1 className="sr-only">{page.title}</h1>

      {/* Render the page content components */}
      {page.pageContentCollection?.items.map((component) => {
        if (!component) return null;

        // Type guard to check if component has __typename
        if (!('__typename' in component)) {
          console.warn('Component missing __typename:', component);
          return null;
        }

        const typeName = component.__typename!; // Using non-null assertion as we've checked it exists

        // Check if we have a component for this type
        if (typeName && typeName in componentMap) {
          const ComponentType = componentMap[typeName as keyof typeof componentMap];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return <ComponentType key={component.sys.id} {...(component as any)} />;
        }

        // Log a warning if we don't have a component for this type
        console.warn(`No component found for type: ${typeName}`);
        return null;
      })}
      {/* Render the page-specific footer if available */}
    </PageLayout>
  );
}

/**
 * Renders the default homepage with lists of pages and page lists
 */
async function renderDefaultHomePage() {
  // Use try-catch blocks to handle potential API errors
  let pages: PageResponse = { items: [], total: 0 };
  let pageLists: PageListResponse = { items: [], total: 0 };

  try {
    pages = await getAllPages();
  } catch (error) {
    console.error('Error fetching pages:', error);
    // Continue with empty pages array
  }

  try {
    pageLists = await getAllPageLists();
  } catch (error) {
    console.error('Error fetching page lists:', error);
    // Continue with empty pageLists array
  }

  let footers: FooterResponse = { items: [], total: 0 };
  try {
    footers = await getAllFooters();
  } catch (error) {
    console.error('Error fetching footers:', error);
    // Continue with empty footers array
  }

  return (
    <Container className="py-8">
      <h1 className="text-headline-sm mb-8 font-bold">Nextracker Website 2025</h1>

      {pages.items.length > 0 && (
        <div className="mb-8">
          <h2 className="text-headline-xs mb-4 font-semibold">Pages</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.items.map((page) => (
              <div key={page.sys.id} className="rounded-lg border p-4 shadow-xs">
                <h3 className="text-body-lg mb-2 font-medium">{page.title}</h3>
                {page.description && <p className="text-gray-600">{page.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {pageLists.items.length > 0 && (
        <div>
          <h2 className="text-headline-xs mb-4 font-semibold">Page Lists</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pageLists.items.map((pageList) => (
              <div key={pageList.sys.id} className="rounded-lg border p-4 shadow-xs">
                <h3 className="text-body-lg mb-2 font-medium">{pageList.title}</h3>
                <p className="text-body-xs text-gray-500">Slug: {pageList.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pages.items.length === 0 && pageLists.items.length === 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <h2 className="text-body-md mb-2 font-medium">No content found</h2>
          <p>No pages or page lists were found in your Contentful space.</p>
        </div>
      )}

      {footers.items.length > 0 && (
        <div className="mb-8">
          <h2 className="text-headline-xs mb-4 font-semibold">Footers</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {footers.items.map((footer) => (
              <div key={footer.sys.id} className="rounded-lg border p-4 shadow-xs">
                <h3 className="text-body-lg mb-2 font-medium">{footer.title}</h3>
                {footer.description && <p className="text-body-xs">{footer.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
