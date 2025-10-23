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

import { contentfulSchemaMapper } from '@/lib/contentful-schema-mapper';
import { getContentSEOBySlug } from '@/lib/contentful-seo-api';
import {
  extractCanonicalUrl,
  extractIndexing,
  extractOpenGraphDescription,
  extractOpenGraphImage,
  extractOpenGraphTitle,
  extractSEODescription,
  extractSEOTitle
} from '@/lib/metadata-utils';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { Content } from '@/components/Content/Content';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { getPageBySlug } from '@/components/Page/PageApi';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { getAllPageLists, getPageListBySlug } from '@/components/PageList/PageListApi';
import { getPostBySlug } from '@/components/Post/PostApi';
import { getProductBySlug } from '@/components/Product/ProductApi';
import { RichContent } from '@/components/RichContent/RichContent';
import { JsonLdSchema } from '@/components/Schema/JsonLdSchema';
import { getServiceBySlug } from '@/components/Service/ServiceApi';
import { getSolutionBySlug } from '@/components/Solution/SolutionApi';

import type { Footer as FooterType } from '@/components/Footer/FooterSchema';
import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Page } from '@/components/Page/PageSchema';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';
import type { PageList, PageListContent } from '@/components/PageList/PageListSchema';
import type { Post } from '@/components/Post/PostSchema';
import type { Product } from '@/components/Product/ProductSchema';
import type { Service } from '@/components/Service/ServiceSchema';
import type { Solution } from '@/components/Solution/SolutionSchema';
import type { ContentfulContent } from '@/lib/contentful-schema-mapper';
import type { Metadata } from 'next';

// Define the component mapping for content items (same as standalone Product page)
const componentMap = {
  BannerHero,
  Content,
  ContentGrid,
  CtaBanner,
  ImageBetween,
  RichContent,
  ContentTypeRichText: RichContent // Map Contentful's ContentTypeRichText to RichContent component
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
    const pageListsResponse = await getAllPageLists(false);
    const pageLists = pageListsResponse.items;

    // Build routing path by finding parent PageLists
    const buildRoutingPath = (itemId: string, visited = new Set<string>()): string[] => {
      if (visited.has(itemId)) return []; // Prevent infinite loops
      visited.add(itemId);

      for (const pageList of pageLists) {
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
    const targetPageList = pageLists.find((pl) => pl.slug === pageListSlug);
    if (!targetPageList) return null;

    // Check if this PageList has parents
    const parentPath = buildRoutingPath(targetPageList.sys.id);
    if (parentPath.length > 0) {
      const fullPath = [...parentPath, pageListSlug, pageSlug].join('/');
      return fullPath;
    }

    return null;
  } catch {
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

  // Try to fetch SEO data for the content item using lightweight queries
  let contentSEO: unknown = null;
  let _contentType = '';

  try {
    // First try PageList with the full nested slug (e.g., "products/trackers")
    const fullSlug = `${pageListSlug}/${pageSlug}`;
    contentSEO = (await getContentSEOBySlug('pageList', fullSlug, false)) as unknown;
    if (contentSEO) {
      _contentType = 'pageList';
    }

    // If not found as PageList, try different content types with just the pageSlug
    if (!contentSEO) {
      contentSEO = (await getContentSEOBySlug('page', pageSlug, false)) as unknown;
      if (contentSEO) {
        _contentType = 'page';
      }
    }

    if (!contentSEO) {
      contentSEO = (await getContentSEOBySlug('product', pageSlug, false)) as unknown;
      if (contentSEO) {
        _contentType = 'product';
      }
    }

    if (!contentSEO) {
      contentSEO = (await getContentSEOBySlug('service', pageSlug, false)) as unknown;
      if (contentSEO) {
        _contentType = 'service';
      }
    }

    if (!contentSEO) {
      contentSEO = (await getContentSEOBySlug('solution', pageSlug, false)) as unknown;
      if (contentSEO) {
        _contentType = 'solution';
      }
    }

    if (!contentSEO) {
      contentSEO = (await getContentSEOBySlug('post', pageSlug, false)) as unknown;
      if (contentSEO) {
        _contentType = 'post';
      }
    }

    if (!contentSEO) {
      return {
        title: 'Content Not Found',
        description: 'The requested content could not be found.'
      };
    }
  } catch {
    return {
      title: 'Content Not Found',
      description: 'The requested content could not be found.'
    };
  }

  // Construct the base URL for absolute image URLs
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  const fullUrl = `${baseUrl}/${pageListSlug}/${pageSlug}`;

  // Extract SEO data using all utility functions
  const title = extractSEOTitle(contentSEO, 'Nextracker');
  const description = extractSEODescription(contentSEO, 'Nextracker Content');
  const ogTitle = extractOpenGraphTitle(contentSEO, title);
  const ogDescription = extractOpenGraphDescription(contentSEO, description);
  const canonicalUrl = extractCanonicalUrl(contentSEO);
  const shouldIndex = extractIndexing(contentSEO, true);

  // Handle OG image from content SEO data
  const openGraphImage = extractOpenGraphImage(contentSEO, baseUrl, title);

  const ogImages = openGraphImage
    ? [
        {
          url: openGraphImage.url,
          width: openGraphImage.width,
          height: openGraphImage.height,
          alt: openGraphImage.title ?? ogTitle
        }
      ]
    : [];

  return {
    title,
    description,
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex
      }
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImages,
      siteName: 'Nextracker',
      type: 'website',
      url: fullUrl
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: openGraphImage ? [openGraphImage.url] : []
    },
    alternates: {
      canonical: canonicalUrl ?? fullUrl
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
        return null;
      }

      const typeName = component.__typename!;

      // Check if we have a component for this type
      if (typeName && typeName in componentMap) {
        const ComponentType = componentMap[typeName as keyof typeof componentMap];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ComponentType key={component.sys.id} {...(component as any)} />;
      }

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

        {contentType === 'Solution' && (
          <div>
            <h2>{(contentItem as Solution).heading}</h2>
            <h3>{(contentItem as Solution).subheading}</h3>
            <p>{(contentItem as Solution).description}</p>
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
  const fullPath = await checkForPartialPathRedirect(pageListSlug, pageSlug);
  if (fullPath && fullPath !== `${pageListSlug}/${pageSlug}`) {
    redirect(`/${fullPath}`);
  }

  let contentItem: Page | Product | Service | Solution | Post | PageList | null = null;
  let pageList: PageList | null = null;
  let contentType: string | null = null;

  try {
    // First, fetch the PageList
    pageList = await getPageListBySlug(pageListSlug, preview);

    if (!pageList?.pagesCollection?.items.length) {
      notFound();
    }

    // Instead of guessing by slug, find the actual item in the PageList and determine its type

    // Find the specific item in this PageList by slug
    const targetItem = pageList.pagesCollection?.items?.find((item) => {
      if (!item || typeof item !== 'object') return false;

      // Check if item has a slug property that matches
      const itemSlug = (item as { slug?: string }).slug;
      if (typeof itemSlug !== 'string') return false;

      // Check for exact match or if the item slug ends with the pageSlug
      // But ensure it's a proper path segment match, not just a substring match
      const hasMatchingSlug =
        itemSlug === pageSlug ||
        (itemSlug.endsWith(`/${pageSlug}`) && itemSlug.split('/').pop() === pageSlug);

      if (hasMatchingSlug) {
        const _typename = (item as { __typename?: string }).__typename ?? 'Unknown';
        return true;
      }

      return false;
    });

    if (!targetItem) {
      notFound();
    }

    // Determine the content type from the item's __typename
    const itemTypename = (targetItem as { __typename?: string }).__typename;
    const actualSlug = (targetItem as { slug?: string }).slug ?? pageSlug;

    // Fetch the full content based on the typename
    if (itemTypename === 'Page') {
      contentItem = await getPageBySlug(actualSlug, preview);
      contentType = 'Page';
    } else if (itemTypename === 'PageList') {
      contentItem = await getPageListBySlug(actualSlug, preview);
      contentType = 'PageList';
    } else if (itemTypename === 'Product') {
      contentItem = await getProductBySlug(actualSlug, preview);
      contentType = 'Product';
    } else if (itemTypename === 'Service') {
      contentItem = await getServiceBySlug(actualSlug, preview);
      contentType = 'Service';
    } else if (itemTypename === 'Solution') {
      contentItem = await getSolutionBySlug(actualSlug, preview);
      contentType = 'Solution';
    } else if (itemTypename === 'Post') {
      contentItem = await getPostBySlug(actualSlug, preview);
      contentType = 'Post';
    } else {
      // Fallback to trying different content types using the actual slug
      // First try as a Page
      contentItem = await getPageBySlug(actualSlug, preview);
      if (contentItem) {
        contentType = 'Page';
      } else {
        // Try as Product
        contentItem = await getProductBySlug(actualSlug, preview);
        if (contentItem) {
          contentType = 'Product';
        } else {
          // Try as Service
          contentItem = await getServiceBySlug(actualSlug, preview);
          if (contentItem) {
            contentType = 'Service';
          } else {
            // Try as Solution
            contentItem = await getSolutionBySlug(actualSlug, preview);
            if (contentItem) {
              contentType = 'Solution';
            } else {
              // Try as Post
              contentItem = await getPostBySlug(actualSlug, preview);
              if (contentItem) {
                contentType = 'Post';
              } else {
                // Try as PageList as last resort
                contentItem = await getPageListBySlug(actualSlug, preview);
                if (contentItem) {
                  contentType = 'PageList';
                }
              }
            }
          }
        }
      }
    }

    if (!contentItem) {
      notFound();
    }

    // Check if the content item is in the PageList
    const itemInList = pageList.pagesCollection.items.some(
      (item) => item?.sys?.id === contentItem!.sys.id
    );

    if (!itemInList) {
      notFound();
    }

    // At this point, we know page and pageList are not null due to the checks above
  } catch {
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

  // Generate connected schema (includes organization connections)
  const contentPath = `/${pageListSlug}/${pageSlug}`;
  const schemaType = contentType?.toLowerCase() as
    | 'page'
    | 'pageList'
    | 'post'
    | 'product'
    | 'service'
    | 'solution'
    | 'event';
  const contentSchema = contentfulSchemaMapper.mapContentToSchema(
    contentItem as ContentfulContent,
    contentPath,
    schemaType || 'page'
  );

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <JsonLdSchema schema={contentSchema} id={`${schemaType || 'content'}-schema`} />
      <h1 className="sr-only">{contentItem.title}</h1>

      {/* Render content based on content type */}
      {renderContentByType(contentItem, contentType)}
    </PageLayout>
  );
}
