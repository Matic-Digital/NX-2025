/**
 * Nested Page Component
 *
 * This component handles dynamic routing for Pages that belong to a PageList.
 * It fetches both the PageList and the Page by their respective slugs and renders
 * the appropriate components based on the content structure defined in Contentful.
 *
 * Key features:
 * - Nested dynamic routing using Next.js file-based routing with [slug]/[pageSlug] parameters
 * - Server-side rendering of content from Contentful
 * - Component mapping to render different content types
 * - Error handling for content that doesn't exist (404 Not Found)
 * - Support for both static site generation and dynamic rendering
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getPageBySlug } from '@/lib/contentful-api/page';
import { getPageListBySlug, getAllPageLists } from '@/lib/contentful-api/page-list';
import { getProductBySlug } from '@/lib/contentful-api/product';
import { getServiceBySlug } from '@/lib/contentful-api/service';
import { getSolutionBySlug } from '@/lib/contentful-api/solution';
import { getPostBySlug } from '@/lib/contentful-api/post';
import { PageLayout } from '@/components/layout/PageLayout';
import type { Page } from '@/types/contentful/Page';
import type { PageList, PageListContent } from '@/types/contentful/PageList';
import type { Product } from '@/types/contentful/Product';
import type { Service } from '@/types/contentful/Service';
import type { Solution } from '@/types/contentful/Solution';
import type { Post } from '@/types/contentful/Post';
import type { PageLayout as PageLayoutType } from '@/types/contentful/PageLayout';
import { BannerHero } from '@/components/BannerHero';
import { CtaBanner } from '@/components/CtaBanner';
import { Content } from '@/components/Content';
import { ContentGrid } from '@/components/ContentGrid';
import { ImageBetween } from '@/components/ImageBetween';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Footer as FooterType } from '@/types/contentful/Footer';
import type { Metadata } from 'next';
import {
  extractOpenGraphImage,
  extractSEOTitle,
  extractSEODescription
} from '@/lib/metadata-utils';

// Define the component mapping for content items (same as standalone Product page)
const componentMap = {
  BannerHero,
  Content,
  ContentGrid,
  CtaBanner,
  ImageBetween
};

// Define props for the nested page component
interface NestedPageProps {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Helper function to check if a partial path should be redirected to full nested path
async function checkForPartialPathRedirect(
  pageListSlug: string,
  pageSlug: string
): Promise<string | null> {
  try {
    const pageLists = await getAllPageLists(false);

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

    // Find the PageList that matches pageListSlug
    const targetPageList = pageLists.items.find((pl) => pl.slug === pageListSlug);
    if (!targetPageList) return null;

    // Check if this PageList has parents
    const parentPath = buildRoutingPath(targetPageList.sys.id);
    if (parentPath.length > 0) {
      const fullPath = [...parentPath, pageListSlug, pageSlug].join('/');
      return fullPath;
    }

    return null;
  } catch (error) {
    console.error('Error checking for partial path redirect:', error);
    return null;
  }
}

// Generate static params for static site generation
export async function generateStaticParams() {
  // This would typically fetch all pages and page lists to pre-render
  // For now, we'll return an empty array as we're focusing on dynamic rendering
  return [];
}

// Define appropriate caching behavior for nested dynamic routes
export const dynamic = 'force-static'; // Prefer static rendering where possible
export const revalidate = 3600; // Revalidate every hour

// Generate dynamic metadata based on the content item
export async function generateMetadata({ params }: NestedPageProps): Promise<Metadata> {
  const { slug: pageListSlug, pageSlug } = await params;

  // Check if this partial path should be redirected to full nested path
  const fullPath = await checkForPartialPathRedirect(pageListSlug, pageSlug);
  if (fullPath && fullPath !== `${pageListSlug}/${pageSlug}`) {
    redirect(`/${fullPath}`);
  }

  // Try to fetch the content item as different content types
  let contentItem: Page | Product | Service | Solution | Post | null = null;
  let pageList: PageList | null = null;

  try {
    // First, fetch the PageList
    pageList = await getPageListBySlug(pageListSlug, false);

    if (!pageList?.pagesCollection?.items.length) {
      return {
        title: 'Content Not Found',
        description: 'The requested content could not be found.'
      };
    }

    // Try to fetch the content item as different content types
    contentItem ??= await getPageBySlug(pageSlug, false);
    contentItem ??= await getProductBySlug(pageSlug, false);
    contentItem ??= await getServiceBySlug(pageSlug, false);
    contentItem ??= await getSolutionBySlug(pageSlug, false);
    contentItem ??= await getPostBySlug(pageSlug, false);

    if (!contentItem) {
      return {
        title: 'Content Not Found',
        description: 'The requested content could not be found.'
      };
    }

    // Check if the content item is in the PageList
    const itemInList = pageList.pagesCollection.items.some(
      (item) => item.sys.id === contentItem!.sys.id
    );

    if (!itemInList) {
      return {
        title: 'Content Not Found',
        description: 'The requested content could not be found.'
      };
    }
  } catch (error) {
    console.error(`Error generating metadata for: ${pageSlug} in PageList: ${pageListSlug}`, error);
    return {
      title: 'Content Not Found',
      description: 'The requested content could not be found.'
    };
  }

  // Construct the base URL for absolute image URLs
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextracker.com';

  // Extract SEO data from content item using utility functions
  const title = extractSEOTitle(contentItem, 'Nextracker');
  const description = extractSEODescription(contentItem, 'Nextracker Content');

  // Handle OG image from content item
  const openGraphImage = extractOpenGraphImage(contentItem, baseUrl, title);

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
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.length > 0 ? [ogImages[0]!.url] : []
    }
  };
}

// Helper function to render content based on content type
function renderContentByType(
  contentItem: Page | Product | Service | Solution | Post | PageList,
  contentType: string | null
) {
  // For PageList content type, render like a normal PageList
  if (contentType === 'PageList') {
    const pageList = contentItem as PageList;

    // Extract page content items if available and type them properly
    const pageContentItems = (pageList.pageContentCollection?.items ?? []).filter(
      Boolean
    ) as PageListContent[];

    return (
      <>
        {/* Render components from pageContentCollection */}
        {pageContentItems.map((component) => {
          if (!component) return null;

          // Type guard to check if component has __typename
          if (!('__typename' in component)) {
            console.warn('Component missing __typename:', component);
            return null;
          }

          const typeName = component.__typename!;

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
      </>
    );
  }

  // For Page content type, render the pageContentCollection
  if (contentType === 'Page') {
    const page = contentItem as Page;
    return page.pageContentCollection?.items.map((component) => {
      if (!component) return null;

      // Type guard to check if component has __typename
      if (!('__typename' in component)) {
        console.warn('Component missing __typename:', component);
        return null;
      }

      const typeName = component.__typename!;

      // Check if we have a component for this type
      if (typeName && typeName in componentMap) {
        const ComponentType = componentMap[typeName as keyof typeof componentMap];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ComponentType key={component.sys.id} {...(component as any)} />;
      }

      // Log a warning if we don't have a component for this type
      console.warn(`No component found for type: ${typeName}`);
      return null;
    });
  }

  // For Product content type, render without the constraining container to allow full-width components
  if (contentType === 'Product') {
    const product = contentItem as Product;
    return (
      <>
        <h1 className="sr-only">{product.title}</h1>
        {/* Render the product content components - itemsCollection maps to pageContentCollection */}
        {product.itemsCollection?.items.map((component, index) => {
          if (!component) return null;

          // Type guard to check if component has __typename
          if (!('__typename' in component)) {
            console.warn('Component missing __typename:', component);
            return null;
          }

          const typeName = component.__typename!;

          // Check if we have a component for this type
          if (typeName && typeName in componentMap) {
            const ComponentType = componentMap[typeName as keyof typeof componentMap];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (
              <ComponentType
                key={component.sys?.id || `component-${index}`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(component as any)}
              />
            );
          }

          // Fallback: render placeholder if component type not found
          return (
            <div
              key={component.sys?.id || `component-${index}`}
              className="mb-4 rounded-lg border border-gray-200 p-4"
            >
              <h3 className="text-lg font-semibold text-gray-700">{typeName} Component</h3>
              <p className="text-sm text-gray-500">ID: {component.sys?.id || 'Unknown'}</p>
              <p className="mt-2 text-xs text-gray-400">
                Component type not found in componentMap. Available types:{' '}
                {Object.keys(componentMap).join(', ')}
              </p>
            </div>
          );
        })}
      </>
    );
  }

  // For other content types (Service, Solution, Post), render basic content display
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="prose prose-lg mx-auto">
        <h1>{contentItem.title}</h1>

        {/* Render content based on specific type */}
        {contentType === 'Product' && (
          <div>
            {/* Render Product's itemsCollection like Page's pageContentCollection */}
            {(contentItem as Product).itemsCollection?.items.map((component, index) => {
              if (!component) return null;

              // Type guard to check if component has __typename
              if (!('__typename' in component)) {
                console.warn('Component missing __typename:', component);
                return null;
              }

              const typeName = component.__typename!;

              // Check if we have a component for this type
              if (typeName && typeName in componentMap) {
                const ComponentType = componentMap[typeName as keyof typeof componentMap];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (
                  <ComponentType
                    key={component.sys?.id || `component-${index}`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...(component as any)}
                  />
                );
              }

              // Fallback: render placeholder if component type not found
              return (
                <div
                  key={component.sys?.id || `component-${index}`}
                  className="mb-4 rounded-lg border border-gray-200 p-4"
                >
                  <h3 className="text-lg font-semibold text-gray-700">{typeName} Component</h3>
                  <p className="text-sm text-gray-500">ID: {component.sys?.id || 'Unknown'}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    Component type not found in componentMap. Available types:{' '}
                    {Object.keys(componentMap).join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {contentType === 'Service' && (
          <div>
            <p>{(contentItem as Service).cardTitle}</p>
            {/* Add more Service-specific rendering here */}
          </div>
        )}

        {contentType === 'Solution' && (
          <div>
            <h2>{(contentItem as Solution).cardHeading}</h2>
            <h3>{(contentItem as Solution).cardSubheading}</h3>
            <p>{(contentItem as Solution).cardDescription}</p>
            {/* Add more Solution-specific rendering here */}
          </div>
        )}

        {contentType === 'Post' && (
          <div>
            <p>{(contentItem as Post).excerpt}</p>
            {/* Add more Post-specific rendering here */}
          </div>
        )}
      </div>
    </div>
  );
}

// The nested page component
export default async function NestedPage({ params, searchParams }: NestedPageProps) {
  // Await the params Promise (required in Next.js)
  const resolvedParams = await params;
  await searchParams; // We need to await this even if we don't use it

  // Access params in a way that's compatible with Next.js async components
  const pageListSlug = resolvedParams?.slug; // Using slug instead of pageListSlug to match parent route
  const pageSlug = resolvedParams?.pageSlug;
  const preview = false; // Set to true if you want to enable preview mode

  // Check if this partial path should be redirected to full nested path
  console.log(
    `Checking if ${pageListSlug}/${pageSlug} should be redirected to full nested path...`
  );
  const fullPath = await checkForPartialPathRedirect(pageListSlug, pageSlug);
  if (fullPath && fullPath !== `${pageListSlug}/${pageSlug}`) {
    console.log(`Redirecting ${pageListSlug}/${pageSlug} to nested path: /${fullPath}`);
    redirect(`/${fullPath}`);
  }

  console.log(
    `[slug]/[pageSlug] route: Attempting to fetch page: ${pageSlug} in PageList: ${pageListSlug}`
  );
  let contentItem: Page | Product | Service | Solution | Post | PageList | null = null;
  let pageList: PageList | null = null;
  let contentType: string | null = null;

  try {
    // First, fetch the PageList
    pageList = await getPageListBySlug(pageListSlug, preview);

    if (!pageList?.pagesCollection?.items.length) {
      console.log(`PageList not found or empty: ${pageListSlug}`);
      notFound();
    }

    // Check if pageSlug is actually a nested PageList
    const nestedPageList = await getPageListBySlug(pageSlug, preview);
    if (nestedPageList) {
      console.log(
        `Found nested PageList "${nestedPageList.title}" - handling directly in [slug]/[pageSlug] route`
      );

      // Verify that the nested PageList is actually contained in the parent PageList
      const isNested = pageList.pagesCollection?.items?.some(
        (item) => item?.sys?.id === nestedPageList.sys.id
      );

      if (!isNested) {
        console.log(`PageList "${nestedPageList.title}" is not nested in "${pageList.title}"`);
        notFound();
      }

      console.log(`Confirmed: "${nestedPageList.title}" is nested in "${pageList.title}"`);

      // Render the nested PageList directly
      // Ensure slug is defined for type compatibility
      if (!nestedPageList.slug) {
        console.error(`Nested PageList "${nestedPageList.title}" has no slug`);
        notFound();
      }
      contentItem = nestedPageList;
      contentType = 'PageList';
    } else {
      console.log(`PageList lookup failed for "${pageSlug}", continuing with content item lookup`);

      // Try to fetch the content item as different content types
      // First try as a Page
      contentItem = await getPageBySlug(pageSlug, preview);
      if (contentItem) {
        contentType = 'Page';
      } else {
        // Try as Product
        contentItem = await getProductBySlug(pageSlug, preview);
        if (contentItem) {
          contentType = 'Product';
        } else {
          // Try as Service
          contentItem = await getServiceBySlug(pageSlug, preview);
          if (contentItem) {
            contentType = 'Service';
          } else {
            // Try as Solution
            contentItem = await getSolutionBySlug(pageSlug, preview);
            if (contentItem) {
              contentType = 'Solution';
            } else {
              // Try as Post
              contentItem = await getPostBySlug(pageSlug, preview);
              if (contentItem) {
                contentType = 'Post';
              }
            }
          }
        }
      }
    }

    if (!contentItem) {
      console.log(`Content item not found: ${pageSlug}`);
      notFound();
    }

    // Check if the content item is in the PageList
    const itemInList = pageList.pagesCollection.items.some(
      (item) => item.sys.id === contentItem!.sys.id
    );

    if (!itemInList) {
      console.log(`Content item ${pageSlug} does not belong to PageList ${pageListSlug}`);
      notFound();
    }

    console.log(`Successfully found ${contentType}: ${pageSlug} in PageList: ${pageListSlug}`);

    // At this point, we know page and pageList are not null due to the checks above
  } catch (error) {
    console.error(`Error fetching page: ${pageSlug} in PageList: ${pageListSlug}`, error);
    notFound();
  }

  // At this point, we know contentItem and pageList are not null because we would have called notFound() above
  // TypeScript doesn't know this though, so we need to assert that they are not null
  if (!contentItem || !pageList) {
    notFound();
  }

  const pageLayout = pageList.pageLayout as PageLayoutType | undefined;
  const pageHeader = pageLayout?.header as HeaderType | undefined;
  const pageFooter = pageLayout?.footer as FooterType | undefined;

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <h1 className="sr-only">{contentItem.title}</h1>

      {/* Render content based on content type */}
      {renderContentByType(contentItem, contentType)}
    </PageLayout>
  );
}
