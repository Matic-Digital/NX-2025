// Next.js metadata types
import { getAllPageLists, getAllPages, getPageBySlug } from '@/lib/contentful-api';
import { contentfulSchemaMapper } from '@/lib/contentful-schema-mapper';
// renderContentByType will be defined locally
import {
  extractOpenGraphImage,
  extractSEODescription,
  extractSEOTitle
} from '@/lib/metadata-utils';

import { Container } from '@/components/global/matic-ds';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { getAllFooters } from '@/components/Footer/FooterApi';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { RegionStats } from '@/components/RegionStats/RegionStats';
import { JsonLdSchema } from '@/components/Schema/JsonLdSchema';

import type { Footer as FooterType } from '@/components/Footer/FooterSchema';
import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Page } from '@/components/Page/PageSchema';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';
import type { Metadata } from 'next';

// Enable static generation for faster initial response
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Cache the homepage data to avoid duplicate API calls
let cachedHomePage: Page | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedHomePage(): Promise<Page | null> {
  const now = Date.now();
  if (cachedHomePage && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedHomePage;
  }
  
  cachedHomePage = await getPageBySlug('/', false);
  cacheTimestamp = now;
  return cachedHomePage;
}

/**
 * Generate metadata for the page, including Open Graph tags
 */
export async function generateMetadata(): Promise<Metadata> {
  // Try to fetch the home page data (with caching)
  const homePage = await getCachedHomePage();

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
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

  // Use imported utility functions for safe metadata extraction

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
  ImageBetween: ImageBetween,
  RegionStats: RegionStats
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
  // Try to fetch a page with the slug '/' from Contentful (with caching)
  const homePage = await getCachedHomePage();

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

  // Generate hierarchical schema: Organization -> WebSite -> Navigation -> Pages
  const homepageSchema = (await contentfulSchemaMapper.generateHomepageSchema(page)) as Record<
    string,
    unknown
  >;

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <JsonLdSchema schema={homepageSchema} id="homepage-hierarchy-schema" />
      <h1 className="sr-only">{page.title}</h1>

      {/* Render the page content components */}
      {page.pageContentCollection?.items.map((component) => {
        if (!component) return null;

        // Type guard to check if component has __typename
        if (!('__typename' in component)) {
          return null;
        }

        // Use type assertion to access __typename safely
        const typeName = (component as { __typename: string }).__typename;

        // Check if we have a component for this type
        if (typeName && typeName in componentMap) {
          const ComponentType = componentMap[typeName as keyof typeof componentMap];
          // Use type assertion to access sys.id safely
          const componentWithSys = component as { sys: { id: string } };

          // Type-cast the component to the expected props interface
          // This assumes the Contentful data structure matches the component's expected props
           
          return <ComponentType key={componentWithSys.sys.id} {...(component as any)} />;
        }

        // Log a warning if we don't have a component for this type
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
  // Generate hierarchical schema for default homepage
  const defaultHomePageData = {
    title: 'PlaceholderCorp Website 2025',
    description:
      'PlaceholderCorp Website 2025 - Solar tracking solutions and renewable energy technology',
    sys: { id: 'homepage' }
  };

  // Parallel API calls for faster loading
  const [homepageSchema, pages, pageLists, footers] = await Promise.allSettled([
    contentfulSchemaMapper.generateHomepageSchema(defaultHomePageData),
    getAllPages(),
    getAllPageLists().then(response => response.items),
    getAllFooters()
  ]);

  // Extract results with fallbacks
  const schema = homepageSchema.status === 'fulfilled' ? homepageSchema.value as Record<string, unknown> : {};
  const pagesData = pages.status === 'fulfilled' ? pages.value : { items: [], total: 0 };
  const pageListsData = pageLists.status === 'fulfilled' ? pageLists.value : [];
  const footersData = footers.status === 'fulfilled' ? footers.value : { items: [], total: 0 };

  return (
    <>
      <JsonLdSchema schema={schema} id="default-homepage-hierarchy-schema" />
      <Container className="py-8">
        <h1 className="text-headline-sm mb-8 font-bold">Nextracker Website 2025</h1>

        {pagesData.items.length > 0 && (
          <div className="mb-8">
            <h2 className="text-headline-xs mb-4 font-semibold">Pages</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pagesData.items.map((page) => (
                <div key={page.sys.id} className="rounded-lg border p-4 shadow-xs">
                  <h3 className="text-body-lg mb-2 font-medium">{page.title}</h3>
                  {page.description && <p className="text-gray-600">{page.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {pageListsData.length > 0 && (
          <div>
            <h2 className="text-headline-xs mb-4 font-semibold">Page Lists</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pageListsData.map((pageList) => (
                <div key={pageList.sys.id} className="rounded-lg border p-4 shadow-xs">
                  <h3 className="text-body-lg mb-2 font-medium">{pageList.title}</h3>
                  <p className="text-body-xs text-gray-500">Slug: {pageList.slug}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pagesData.items.length === 0 && pageListsData.length === 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            <h2 className="text-body-md mb-2 font-medium">No content found</h2>
            <p>No pages or page lists were found in your Contentful space.</p>
          </div>
        )}

        {footersData.items.length > 0 && (
          <div className="mb-8">
            <h2 className="text-headline-xs mb-4 font-semibold">Footers</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {footersData.items.map((footer) => (
                <div key={footer.sys.id} className="rounded-lg border p-4 shadow-xs">
                  <h3 className="text-body-lg mb-2 font-medium">{footer.title}</h3>
                  {footer.description && <p className="text-body-xs">{footer.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
