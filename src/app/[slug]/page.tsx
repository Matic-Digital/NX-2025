/**
 * Dynamic Content Component
 *
 * This component handles dynamic routing for both Pages and PageLists based on their slug from Contentful.
 * It fetches the content by slug and renders the appropriate components based on
 * the content structure defined in Contentful.
 *
 * Key features:
 * - Dynamic routing using Next.js file-based routing with [slug] parameter
 * - Support for both Page and PageList content types under the same URL structure
 * - Server-side rendering of content from Contentful
 * - Component mapping to render different content types (BannerHero, CtaBanner, ContentGrid, PageList, etc.)
 * - Error handling for content that doesn't exist (404 Not Found)
 * - Support for both static site generation and dynamic rendering
 *
 * The content is structured according to Contentful's content models, where
 * each page can have various content components accessed via the pageContentCollection,
 * and PageList can reference multiple Pages.
 */

import { notFound } from 'next/navigation';
import { getPageBySlug, getPageListBySlug } from '@/lib/api';
import { BannerHero } from '@/components/BannerHero';
import { CtaBanner } from '@/components/CtaBanner';
import { ContentGrid } from '@/components/ContentGrid';
import { Footer } from '@/components/global/Footer';
import { PageList } from '@/components/global/PageList';
import { PageLayout } from '@/components/layout/PageLayout';
import type { Page } from '@/types/contentful/Page';
import type { PageList as PageListType } from '@/types/contentful/PageList';
import type { CtaBanner as CtaBannerType } from '@/types/contentful/CtaBanner';

// Define the component mapping for pageContent items
const componentMap = {
  BannerHero: BannerHero,
  ContentGrid: ContentGrid,
  CtaBanner: CtaBanner
  // Add other component types here as they are created
};

// Define props for the content component
interface ContentPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Generate static params for static site generation
export async function generateStaticParams() {
  // This would typically fetch all pages and page lists to pre-render
  // For now, we'll return an empty array as we're focusing on dynamic rendering
  return [];
}

// The dynamic content component that handles both Page and PageList
// Define appropriate caching behavior for dynamic routes
export const dynamic = 'force-static'; // Prefer static rendering where possible
export const revalidate = 3600; // Revalidate every hour

export default async function ContentPage({ params, searchParams }: ContentPageProps) {
  // Await the params Promise (required in Next.js)
  const resolvedParams = await params;
  await searchParams; // We need to await this even if we don't use it

  // Access params in a way that's compatible with Next.js async components
  const slug = resolvedParams?.slug;
  const preview = false; // Set to true if you want to enable preview mode

  try {
    // Try to fetch the content as a Page first
    console.log(`Attempting to fetch page with slug: ${slug}`);
    let page;
    try {
      page = await getPageBySlug(slug, preview);
      console.log(`Page query result:`, page ? 'Found page' : 'No page found');
    } catch (pageError) {
      console.error(`Error fetching page with slug ${slug}:`, pageError);
      throw new Error(
        `Failed to fetch page: ${pageError instanceof Error ? pageError.message : String(pageError)}`
      );
    }

    // If it's a Page, render it as a standalone page
    if (page) {
      console.log(`Found page with slug: ${slug}, rendering standalone page`);
      try {
        return renderPage(page);
      } catch (renderError) {
        console.error(`Error rendering page with slug ${slug}:`, renderError);
        throw new Error(
          `Failed to render page: ${renderError instanceof Error ? renderError.message : String(renderError)}`
        );
      }
    }

    // If it's not a Page, try to fetch it as a PageList
    console.log(`No page found with slug: ${slug}, trying PageList`);
    let pageList;
    try {
      pageList = await getPageListBySlug(slug, preview);
      console.log(`PageList query result:`, pageList ? 'Found pageList' : 'No pageList found');
    } catch (pageListError) {
      console.error(`Error fetching pageList with slug ${slug}:`, pageListError);
      throw new Error(
        `Failed to fetch pageList: ${pageListError instanceof Error ? pageListError.message : String(pageListError)}`
      );
    }

    // If it's a PageList, render it
    if (pageList) {
      console.log(`Found PageList with slug: ${slug}, rendering PageList`);
      try {
        return renderPageList(pageList);
      } catch (renderError) {
        console.error(`Error rendering pageList with slug ${slug}:`, renderError);
        throw new Error(
          `Failed to render pageList: ${renderError instanceof Error ? renderError.message : String(renderError)}`
        );
      }
    }

    console.log(`No Page or PageList found with slug: ${slug}`);
    // If neither Page nor PageList is found, return a 404
    notFound();
  } catch (error) {
    console.error(`Error handling slug: ${slug}`, error);

    // Instead of converting all errors to 404s, let's throw the actual error
    // to help with debugging the 500 error in production
    throw error;
  }
}

// Helper function to render a Page
function renderPage(page: Page) {
  // Get the page-specific header and footer if they exist
  const pageHeader = page.header;
  const pageFooter = page.footer;

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <main>
        <h1 className="sr-only">{page.name}</h1>

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
      </main>

      {/* Render the page-specific footer if available */}
      {pageFooter && <Footer footerData={pageFooter} />}
    </PageLayout>
  );
}

// Helper function to render a PageList
function renderPageList(pageList: PageListType) {
  // Extract header and footer from the PageList
  const pageHeader = pageList.header;
  const pageFooter = pageList.footer;

  // Extract page content items if available
  const pageContentItems = pageList.pageContentCollection?.items ?? [];

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <main className="min-h-screen py-12">
        {/* Render components from pageContentCollection */}
        {pageContentItems.map((item, index) => {
          if (item.__typename === 'CtaBanner') {
            const CtaBannerComponent = componentMap.CtaBanner;
            // Cast to CtaBanner type to ensure TypeScript knows this has the right properties
            return (
              <CtaBannerComponent
                key={item.sys.id || `cta-banner-${index}`}
                {...(item as CtaBannerType)}
              />
            );
          }
          return null;
        })}

        <div className="mx-auto max-w-7xl px-4">
          {/* Render the PageList component */}
          <PageList {...pageList} />
        </div>
      </main>

      {/* Render the page-specific footer if available */}
      {pageFooter && <Footer footerData={pageFooter} />}
    </PageLayout>
  );
}
