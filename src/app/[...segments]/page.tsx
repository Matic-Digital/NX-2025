/**
 * Nested PageList and Content Component
 *
 * Dynamic catch-all route for nested PageList content
 *
 * This route handles URLs like:
 * - /products (single PageList)
 * - /products/trackers (nested PageList)
 * - /products/trackers/nx-horizon (deeply nested content)
 *
 * Features:
 * - Recursive PageList nesting support
 * - Content item rendering within nested PageLists
 * - Server-side rendering with proper error handling
 *
 * PageList Nesting Integration:
 * - Validates parent-child relationships between PageLists
 * - Ensures content items are properly nested within their parent PageLists
 * - Supports multi-level nesting (e.g., products > trackers > specific-product)
 * - Provides fallback handling for orphaned content
 * - Generates proper metadata for nested structures
 */

 

import { notFound } from 'next/navigation';

import {
  extractCanonicalUrl,
  extractIndexing,
  extractOpenGraphDescription,
  extractOpenGraphImage,
  extractOpenGraphTitle,
  extractSEODescription,
  extractSEOTitle
} from '@/lib/metadata-utils';
import { staticRoutingService } from '@/lib/static-routing';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { Content } from '@/components/Content/Content';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { getPageBySlug } from '@/components/Page/PageApi';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { getPageListBySlug } from '@/components/PageList/PageListApi';
import { getPostBySlug } from '@/components/Post/PostApi';
import { getProductBySlug } from '@/components/Product/ProductApi';
import { RegionsMap } from '@/components/Region/RegionsMap';
import { RichContent } from '@/components/RichContent/RichContent';
import { getServiceBySlug } from '@/components/Service/ServiceApi';
import { Slider } from '@/components/Slider/Slider';
import { getSolutionBySlug } from '@/components/Solution/SolutionApi';

import type { Footer as FooterType } from '@/components/Footer/FooterSchema';
import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Page } from '@/components/Page/PageSchema';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';
import type { PageList as PageListType } from '@/components/PageList/PageListSchema';
import type { Post } from '@/components/Post/PostSchema';
import type { Product } from '@/components/Product/ProductSchema';
import type { Service } from '@/components/Service/ServiceSchema';
import type { Solution } from '@/components/Solution/SolutionSchema';
import type { Metadata } from 'next';

// Define the component mapping for content items
const componentMap = {
  BannerHero,
  Content,
  ContentGrid,
  CtaBanner,
  CtaGrid,
  ImageBetween,
  RichContent,
  ContentTypeRichText: RichContent, // Map Contentful's ContentTypeRichText to RichContent component
  Slider,
  RegionsMap
} as const;

// console.log('🔍 Component map initialized:', {
//   hasRichContent: !!RichContent,
//   hasContentTypeRichText: !!componentMap.ContentTypeRichText,
//   richContentName: RichContent?.name,
//   allKeys: Object.keys(componentMap)
// });

// Type-safe component map with explicit typing
type _ComponentMapType = {
  [K in keyof typeof componentMap]: (typeof componentMap)[K];
};

// Define props for the nested component
interface NestedSegmentsProps {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Content item type union
type ContentItem = Page | Product | Service | Solution | Post;

// Generate static params for static site generation
export async function generateStaticParams() {
  return [];
}

// Define appropriate caching behavior for ISR
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow new paths to be generated

// Generate metadata for nested routes
export async function generateMetadata({ params }: NestedSegmentsProps): Promise<Metadata> {
  const { segments } = await params;

  if (!segments || segments.length === 0) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  const fullPath = segments.join('/');

  try {
    // Try to resolve the content
    const result = await resolveContentWithStaticCache(segments);

    if (!result) {
      return {
        openGraph: {
          title: 'Nextracker',
          description: 'Nextracker Content'
        }
      };
    }

    const { content } = result;

    // Extract SEO data using all utility functions
    const title = extractSEOTitle(content, 'Nextracker');
    const description = extractSEODescription(content, 'Nextracker Content');
    const ogTitle = extractOpenGraphTitle(content, title);
    const ogDescription = extractOpenGraphDescription(content, description);
    const canonicalUrl = extractCanonicalUrl(content);
    const shouldIndex = extractIndexing(content, true);
    const openGraphImage = extractOpenGraphImage(content, baseUrl, title);

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
        images: ogImages ?? [],
        siteName: 'Nextracker',
        type: 'website',
        url: `${baseUrl}/${fullPath}`
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: openGraphImage ? [openGraphImage.url] : []
      },
      alternates: {
        canonical: canonicalUrl ?? `${baseUrl}/${fullPath}`
      }
    };
  } catch {
    return {
      title: 'Error',
      description: 'An error occurred while loading this page.'
    };
  }
}

// Helper function to resolve nested content
/**
 * Fast route resolution using static sitemap cache first, then fallback to dynamic resolution
 *
 * @param segments - Array of URL segments (e.g., ['products', 'trackers', 'nx-horizon'])
 * @returns Object containing the resolved content, its type, and parent PageList chain
 */
async function resolveContentWithStaticCache(segments: string[]): Promise<{
  content: ContentItem | PageListType;
  type: 'Page' | 'Product' | 'Service' | 'Solution' | 'Post' | 'PageList';
  parentPageLists: PageListType[];
} | null> {
  const preview = false;

  // First, try static routing cache for fast lookup
  const staticRoute = staticRoutingService.getRouteBySegments(segments);

  if (staticRoute) {
    try {
      // Fetch the content directly using the cached metadata
      let content: ContentItem | PageListType | null = null;

      switch (staticRoute.contentType) {
        case 'Page':
          // Try full path first (e.g., 'what-we-do/design'), then fall back to last segment
          content = await getPageBySlug(segments.join('/'), preview);
          if (!content) {
            content = await getPageBySlug(segments[segments.length - 1]!, preview);
          }
          break;
        case 'Product':
          // Try full path first (e.g., 'products/trackers/nx-horizon'), then fall back to last segment
          content = await getProductBySlug(segments.join('/'), preview);
          if (!content) {
            content = await getProductBySlug(segments[segments.length - 1]!, preview);
          }
          break;
        case 'Service':
          // Try full path first, then fall back to last segment
          content = await getServiceBySlug(segments.join('/'), preview);
          if (!content) {
            content = await getServiceBySlug(segments[segments.length - 1]!, preview);
          }
          break;
        case 'Solution':
          // Try full path first, then fall back to last segment
          content = await getSolutionBySlug(segments.join('/'), preview);
          if (!content) {
            content = await getSolutionBySlug(segments[segments.length - 1]!, preview);
          }
          break;
        case 'Post':
          content = await getPostBySlug(segments[segments.length - 1]!, preview);
          break;
        case 'PageList':
          // For PageLists, use the full path as the slug (e.g., 'services/design')
          content = await getPageListBySlug(segments.join('/'), preview);
          break;
      }

      if (content) {
        // Build parent PageLists from static cache metadata
        const parentPageLists: PageListType[] = [];

        for (const parentInfo of staticRoute.parentPageLists) {
          const parentPageList = await getPageListBySlug(parentInfo.slug, preview);
          if (parentPageList) {
            parentPageLists.push(parentPageList);
          }
        }

        return {
          content,
          type: staticRoute.contentType,
          parentPageLists
        };
      }
    } catch {
      return resolveNestedContent(segments);
    }
  }

  // Fallback to dynamic resolution if static cache fails or route not found
  return resolveNestedContent(segments);
}

/**
 * Resolve nested content based on URL segments with comprehensive nesting validation
 * (Original dynamic resolution function - now used as fallback)
 *
 * @param segments - Array of URL segments (e.g., ['products', 'trackers', 'nx-horizon'])
 * @returns Object containing the resolved content, its type, and parent PageList chain
 */
async function resolveNestedContent(segments: string[]): Promise<{
  content: ContentItem | PageListType;
  type: 'Page' | 'Product' | 'Service' | 'Solution' | 'Post' | 'PageList';
  parentPageLists: PageListType[];
} | null> {
  const preview = false;

  // If only one segment, try to find it as a PageList or content item
  if (segments.length === 1) {
    const slug = segments[0]!;

    // Try PageList first
    const pageList = await getPageListBySlug(slug, preview);
    if (pageList) {
      return { content: pageList, type: 'PageList', parentPageLists: [] };
    }

    // Try other content types
    const contentItem = await tryFetchContentItem(slug, preview);
    if (contentItem) {
      return { content: contentItem.item, type: contentItem.type, parentPageLists: [] };
    }

    return null;
  }

  // For multiple segments, traverse the hierarchy
  // This implements the core nesting validation logic
  const parentPageLists: PageListType[] = [];
  let currentPageList: PageListType | null = null;

  // Traverse through parent PageLists to build and validate the nesting chain
  // Each PageList must be nested within the previous one in the URL path
  for (let i = 0; i < segments.length - 1; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const slug = segments[i]!;
    let pageList = await getPageListBySlug(slug, preview);

    // If direct slug lookup fails and we have a parent, search within the parent's items
    if (!pageList && currentPageList) {
      const nestedItem = currentPageList.pagesCollection?.items?.find((item: any) => {
        const itemSlug = item?.slug;
        if (typeof itemSlug !== 'string') return false;

        // Check if this item matches the segment we're looking for
        return (
          itemSlug === slug || (itemSlug.endsWith(`/${slug}`) && itemSlug.split('/').pop() === slug)
        );
      });

      if (nestedItem && nestedItem.__typename === 'PageList') {
        // Found the nested PageList, now fetch it using its actual slug
        const actualSlug = (nestedItem as any).slug;
        pageList = await getPageListBySlug(actualSlug as string, preview);
      }
    }

    if (!pageList) {
      return null;
    }

    // Critical nesting validation: If this is not the first PageList,
    // verify it's actually nested within the previous one in the hierarchy
    if (currentPageList) {
      const isNested = currentPageList.pagesCollection?.items?.some((item: unknown) => {
        const typedItem = item as { sys?: { id?: string } };
        return typedItem?.sys?.id === pageList.sys.id;
      });

      if (!isNested) {
        return null;
      }
    }

    parentPageLists.push(pageList);
    currentPageList = pageList;
  }

  // Final step: Try to resolve the last segment in the URL path
  // This could be either a nested PageList or a content item (Page, Product, etc.)
  const finalSlug = segments[segments.length - 1]!;

  // First attempt: Try to find the final segment as a PageList
  const finalPageList = await getPageListBySlug(finalSlug, preview);

  // Case 1: Final segment is a PageList nested within the current parent PageList
  if (finalPageList && currentPageList) {
    const isNested = currentPageList.pagesCollection?.items?.some((item: unknown) => {
      const typedItem = item as { sys?: { id?: string } };
      return typedItem?.sys?.id === finalPageList.sys.id;
    });

    if (isNested) {
      return { content: finalPageList, type: 'PageList', parentPageLists };
    }
  } else if (finalPageList && !currentPageList) {
    // Case 2: This is a standalone PageList (single segment URL like /products)
    return { content: finalPageList, type: 'PageList', parentPageLists };
  }

  // Case 3: Final segment is a content item (Page, Product, Service, etc.)
  // First find the item in the PageList to get its actual slug, then fetch it
  if (currentPageList) {
    const targetItem = currentPageList.pagesCollection?.items?.find((item: any) => {
      if (!item || typeof item !== 'object') return false;

      const itemSlug = (item as any).slug;
      if (typeof itemSlug !== 'string') return false;

      // Check for exact match or if the item slug ends with the finalSlug
      // This handles compound slugs like "products/trackers/nx-horizon"
      return (
        itemSlug === finalSlug ||
        (itemSlug.endsWith(`/${finalSlug}`) && itemSlug.split('/').pop() === finalSlug)
      );
    });

    if (targetItem) {
      const actualSlug = (targetItem as any).slug ?? finalSlug;

      // Fetch the content using the actual slug
      const contentItem = await tryFetchContentItem(actualSlug as string, preview);
      if (contentItem) {
        return { content: contentItem.item, type: contentItem.type, parentPageLists };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  // Fallback: Try to fetch using just the final slug (for backward compatibility)
  const contentItem = await tryFetchContentItem(finalSlug, preview);
  if (contentItem && currentPageList) {
    // Critical validation: Ensure the content item is actually contained within the parent PageList
    const isInList = (currentPageList as PageListType).pagesCollection?.items?.some(
      (item: any) => item?.sys?.id === contentItem.item.sys.id
    );

    if (isInList) {
      return { content: contentItem.item, type: contentItem.type, parentPageLists };
    }
  }

  return null;
}

// Helper function to try fetching content item as different types
async function tryFetchContentItem(
  slug: string,
  preview: boolean
): Promise<{
  item: ContentItem;
  type: 'Page' | 'Product' | 'Service' | 'Solution' | 'Post';
} | null> {
  // Try Page
  const page = await getPageBySlug(slug, preview);
  if (page) return { item: page, type: 'Page' };

  // Try Product
  const product = await getProductBySlug(slug, preview);
  if (product) return { item: product, type: 'Product' };

  // Try Service
  const service = await getServiceBySlug(slug, preview);
  if (service) return { item: service, type: 'Service' };

  // Try Solution
  const solution = await getSolutionBySlug(slug, preview);
  if (solution) return { item: solution, type: 'Solution' };

  // Try Post
  const post = await getPostBySlug(slug, preview);
  if (post) return { item: post, type: 'Post' };

  return null;
}

// Helper function to render content based on type
function renderContentByType(item: unknown, _index: number): React.ReactNode {
  if (!item) return null;

  const typedItem = item as { type?: string; content?: unknown };
  const { type, content } = typedItem;

  if (type === 'PageList') {
    const pageList = content as PageListType;

    // Extract page content items if available
    const pageContentItems = pageList.pageContentCollection?.items ?? [];

    return (
      <>
        <h1 className="sr-only">{pageList.title}</h1>
        {/* Render components from pageContentCollection */}
        {pageContentItems.map((component: unknown, componentIndex: number) => {
          return renderPageListContentByType(component, componentIndex);
        })}
      </>
    );
  }

  // Handle other content types (Product, Page, Service, Solution, Post)
  // These content types have different field names for their content collections
  if (
    type === 'Product' ||
    type === 'Page' ||
    type === 'Service' ||
    type === 'Solution' ||
    type === 'Post'
  ) {
    // Different content types use different field names for their collections
    const contentItem = content as {
      title?: string;
      pageContentCollection?: { items?: unknown[] };
      itemsCollection?: { items?: unknown[] }; // Products, Solutions, and Services use itemsCollection
    };

    // Use the appropriate collection based on content type
    const contentItems =
      type === 'Product' || type === 'Solution' || type === 'Service'
        ? (contentItem.itemsCollection?.items ?? [])
        : (contentItem.pageContentCollection?.items ?? []);

    return (
      <>
        <h1 className="sr-only">{contentItem.title}</h1>
        {/* Render components from the appropriate collection */}
        {contentItems.map((component: unknown, componentIndex: number) => {
          return renderPageListContentByType(component, componentIndex);
        })}
      </>
    );
  }

  // Fallback for unknown content types
  return (
    <div>
      <h1>{(content as { title?: string }).title}</h1>
      <p>Content type &quot;{type}&quot; is not supported for rendering.</p>
    </div>
  );
}

const renderPageListContentByType = (component: unknown, componentIndex: number) => {
  const typedComponent = component as { __typename?: string; sys?: { id?: string } };
  if (!typedComponent?.__typename) {
    return null;
  }

  const ComponentType = componentMap[typedComponent.__typename as keyof typeof componentMap];
  if (ComponentType) {
     
    return <ComponentType key={typedComponent.sys?.id ?? componentIndex} {...(component as any)} />;
  }

  return null;
};

export default async function NestedSegmentsPage({ params, searchParams }: NestedSegmentsProps) {
  const resolvedParams = await params;
  await searchParams;

  const segments = resolvedParams?.segments;

  if (!segments || segments.length === 0) {
    notFound();
  }

  try {
    const result = await resolveContentWithStaticCache(segments);

    if (!result) {
      notFound();
    }

    const { content, type, parentPageLists } = result;

    // Get layout from the deepest PageList or content item
    let pageLayout: PageLayoutType | undefined;

    if (type === 'PageList') {
      const pageList = content as PageListType;
      pageLayout = pageList.pageLayout as PageLayoutType | undefined;
    } else if (parentPageLists.length > 0) {
      // Use layout from the deepest parent PageList
      const deepestParent = parentPageLists[parentPageLists.length - 1]!;
      pageLayout = deepestParent.pageLayout as PageLayoutType | undefined;
    } else {
      // For standalone content items, try to get their layout
      const item = content as ContentItem;
      if ('pageLayout' in item) {
        pageLayout = item.pageLayout as PageLayoutType | undefined;
      }
    }

    const pageHeader = pageLayout?.header as HeaderType | undefined;
    const pageFooter = pageLayout?.footer as FooterType | undefined;

    return (
      <PageLayout header={pageHeader} footer={pageFooter}>
        {/* Render content */}
        <div key={0}>{renderContentByType({ type, content }, 0)}</div>
      </PageLayout>
    );
  } catch {
    notFound();
  }
}
