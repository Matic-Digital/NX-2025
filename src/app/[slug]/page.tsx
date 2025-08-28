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

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageBySlug, getPageListBySlug, getAllPageLists } from '@/lib/contentful-api';
import { BannerHero } from '@/components/BannerHero';
import { CtaBanner } from '@/components/CtaBanner';
import { Content } from '@/components/Content';
import { ContentGrid } from '@/components/ContentGrid';
import { ImageBetween } from '@/components/ImageBetween';
import { RegionsMap } from '@/components/RegionsMap';
import { PageList } from '@/components/global/PageList';
import { PageLayout } from '@/components/layout/PageLayout';
import type { PageLayout as PageLayoutType } from '@/types/contentful/PageLayout';
import type { Page } from '@/types/contentful/Page';
import type { PageList as PageListType } from '@/types/contentful/PageList';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Footer as FooterType } from '@/types/contentful/Footer';
import type { PageListContent } from '@/types/contentful/PageList';
import {
  extractOpenGraphImage,
  extractSEOTitle,
  extractSEODescription
} from '@/lib/metadata-utils';

// Define the component mapping for pageContent items
const componentMap = {
  BannerHero: BannerHero,
  Content: Content,
  ContentGrid: ContentGrid,
  CtaBanner: CtaBanner,
  ImageBetween: ImageBetween,
  RegionsMap: RegionsMap
  // Add other component types here as they are created
};

// Define props for the content component
interface ContentPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Helper function to check if a slug should be redirected to nested path
async function checkForNestedRedirect(slug: string): Promise<string | null> {
  try {
    const pageLists = await getAllPageLists(false);

    // Type guard to check if an item has a slug property
    const hasSlug = (item: unknown): item is { slug: string; sys: { id: string } } => {
      return Boolean(item && typeof (item as { slug?: string }).slug === 'string');
    };

    // Build routing path by finding parent PageLists
    const buildRoutingPath = (itemId: string, visited = new Set<string>()): string[] => {
      if (visited.has(itemId)) return []; // Prevent infinite loops
      visited.add(itemId);

      for (const pageList of pageLists.items) {
        if (!pageList.pagesCollection?.items?.length) continue;

        const foundItem = pageList.pagesCollection.items.find((item) => item?.sys?.id === itemId);

        if (foundItem && pageList.slug) {
          const parentPath = buildRoutingPath(pageList.sys.id, visited);
          return [...parentPath, pageList.slug];
        }
      }
      return [];
    };

    // First, check if the slug itself is a PageList
    const targetPageList = pageLists.items.find((pageList) => pageList.slug === slug);
    if (targetPageList) {
      const parentPath = buildRoutingPath(targetPageList.sys.id);
      if (parentPath.length > 0) {
        const fullPath = [...parentPath, slug].join('/');
        return fullPath;
      }
    }

    // If not a PageList, search for the slug in all PageList items (Pages, Products, etc.)
    for (const pageList of pageLists.items) {
      if (!pageList.pagesCollection?.items?.length) continue;

      const foundItem = pageList.pagesCollection.items.find(
        (item) => hasSlug(item) && item.slug === slug
      );

      if (foundItem) {
        // Build the full path including this item's parents
        const parentPath = buildRoutingPath(pageList.sys.id);
        const fullPath = [...parentPath, pageList.slug, slug].join('/');
        return fullPath;
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking for nested redirect:', error);
    return null;
  }
}

// Generate static params for static site generation
export async function generateStaticParams() {
  // This would typically fetch all pages and page lists to pre-render
  // For now, we'll return an empty array as we're focusing on dynamic rendering
  return [];
}

// Generate metadata for SEO using Page component data
export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  // Construct the base URL for absolute image URLs
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextracker.com';

  try {
    // First, check if this slug should be redirected to a nested path
    const nestedPath = await checkForNestedRedirect(slug);
    if (nestedPath && nestedPath !== slug) {
      redirect(`/${nestedPath}`);
    }

    // Try to fetch as a Page first
    const page = await getPageBySlug(slug, false);

    if (page) {
      // Extract SEO data from Page component using utility functions
      const title = extractSEOTitle(page, 'Nextracker');
      const description = extractSEODescription(page, 'Nextracker Website');

      // Handle OG image from Page component
      const openGraphImage = extractOpenGraphImage(page, baseUrl, title);

      const ogImages = openGraphImage
        ? [
            {
              url: openGraphImage.url,
              width: openGraphImage.width,
              height: openGraphImage.height,
              alt: openGraphImage.title ?? title
            }
          ]
        : [];

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: ogImages,
          siteName: 'Nextracker',
          type: 'website',
          url: `${baseUrl}/${slug}`
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: openGraphImage ? [openGraphImage.url] : []
        },
        alternates: {
          canonical: `${baseUrl}/${slug}`
        }
      };
    }

    // Try to fetch as a PageList
    const pageList = await getPageListBySlug(slug, false);

    if (pageList) {
      // Extract SEO data from PageList component using utility functions
      const title = extractSEOTitle(pageList, 'Nextracker');
      const description = extractSEODescription(pageList, 'Nextracker Website');

      // Handle OG image from PageList component
      const openGraphImage = extractOpenGraphImage(pageList, baseUrl, title);

      const ogImages = openGraphImage
        ? [
            {
              url: openGraphImage.url,
              width: openGraphImage.width,
              height: openGraphImage.height,
              alt: openGraphImage.title ?? title
            }
          ]
        : [];

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: ogImages,
          siteName: 'Nextracker',
          type: 'website',
          url: `${baseUrl}/${slug}`
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: openGraphImage ? [openGraphImage.url] : []
        },
        alternates: {
          canonical: `${baseUrl}/${slug}`
        }
      };
    }

    // If neither found, return 404 metadata
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  } catch (error) {
    console.error(`Error generating metadata for slug: ${slug}`, error);
    return {
      title: 'Error',
      description: 'An error occurred while loading this page.'
    };
  }
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
    // First, check if this slug should be redirected to a nested path
    console.log(`Checking if ${slug} should be redirected to nested path...`);
    const nestedPath = await checkForNestedRedirect(slug);
    if (nestedPath && nestedPath !== slug) {
      console.log(`Redirecting ${slug} to nested path: /${nestedPath}`);
      redirect(`/${nestedPath}`);
    }

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
        console.warn(`❌ No component found for type: ${typeName}`);
        return null;
      })}
    </PageLayout>
  );
}

// Helper function to render a PageList
function renderPageList(pageList: PageListType) {
  const pageLayout = pageList.pageLayout as PageLayoutType | undefined;
  const pageHeader = pageLayout?.header as HeaderType | undefined;
  const pageFooter = pageLayout?.footer as FooterType | undefined;

  // Extract page content items if available and type them properly
  const pageContentItems = (pageList.pageContentCollection?.items ?? []).filter(
    Boolean
  ) as PageListContent[];

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <h1 className="sr-only">{pageList.title}</h1>
      {/* Render components from pageContentCollection directly */}
      {pageContentItems.map((component) => {
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

      {/* Render the PageList component for pages collection only */}
      <PageList
        sys={pageList.sys}
        title={pageList.title}
        slug={pageList.slug}
        pagesCollection={pageList.pagesCollection}
        pageContentCollection={undefined}
      />
    </PageLayout>
  );
}
