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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unnecessary-type-assertion */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageListBySlug } from '@/components/PageList/PageListApi';
import { getProductBySlug } from '@/components/Product/ProductApi';
import { getServiceBySlug } from '@/components/Service/ServiceApi';
import { getSolutionBySlug } from '@/components/Solution/SolutionApi';
import { getPostBySlug } from '@/components/Post/PostApi';
import { getPageBySlug } from '@/components/Page/PageApi';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { BannerHero } from '@/components/BannerHero/BannerHero';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { Content } from '@/components/Content/Content';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import RichContent from '@/components/RichContent/RichContent';
import { Slider } from '@/components/Slider/Slider';
import { RegionsMap } from '@/components/Region/RegionsMap';
import type { Page } from '@/components/Page/PageSchema';
import type { PageList as PageListType } from '@/components/PageList/PageListSchema';
import type { Product } from '@/components/Product/ProductSchema';
import type { Service } from '@/components/Service/ServiceSchema';
import type { Solution } from '@/components/Solution/SolutionSchema';
import type { Post } from '@/components/Post/PostSchema';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';
import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Footer as FooterType } from '@/components/Footer/FooterSchema';
import {
  extractOpenGraphImage,
  extractSEOTitle,
  extractSEODescription
} from '@/lib/metadata-utils';

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

console.log('🔍 Component map initialized:', {
  hasRichContent: !!RichContent,
  hasContentTypeRichText: !!componentMap.ContentTypeRichText,
  richContentName: RichContent?.name,
  allKeys: Object.keys(componentMap)
});

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

// Define appropriate caching behavior
export const dynamic = 'force-static';
export const revalidate = 3600;

// Generate metadata for nested routes
export async function generateMetadata({ params }: NestedSegmentsProps): Promise<Metadata> {
  const { segments } = await params;

  if (!segments || segments.length === 0) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextracker.com';
  const fullPath = segments.join('/');

  try {
    // Try to resolve the content
    const result = await resolveNestedContent(segments);

    if (!result) {
      return {
        openGraph: {
          title: 'Nextracker',
          description: 'Nextracker Content'
        }
      };
    }

    const { content } = result;

    // Extract SEO data
    const title = extractSEOTitle(content, 'Nextracker');
    const description = extractSEODescription(content, 'Nextracker Content');
    const openGraphImage = extractOpenGraphImage(content, baseUrl, title);

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
        images: ogImages ?? [],
        siteName: 'Nextracker',
        type: 'website',
        url: `${baseUrl}/${fullPath}`
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: openGraphImage ? [openGraphImage.url] : []
      },
      alternates: {
        canonical: `${baseUrl}/${fullPath}`
      }
    };
  } catch (error) {
    console.error(`Error generating metadata for: ${fullPath}`, error);
    return {
      title: 'Error',
      description: 'An error occurred while loading this page.'
    };
  }
}

// Helper function to resolve nested content
/**
 * Resolve nested content based on URL segments
 *
 * This function implements the core PageList nesting logic:
 * 1. For single segments: Try to find as PageList or content item
 * 2. For multiple segments: Traverse the hierarchy to validate nesting
 * 3. Ensures each PageList in the path is properly nested in its parent
 * 4. Returns the final content item with its complete parent chain
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
    const slug = segments[i]!;
    const pageList = await getPageListBySlug(slug, preview);

    if (!pageList) {
      console.log(`PageList not found for slug: ${slug}`);
      return null;
    }

    // Critical nesting validation: If this is not the first PageList,
    // verify it's actually nested within the previous one in the hierarchy
    if (currentPageList) {
      console.log(
        `Checking if PageList "${pageList.title}" (${pageList.sys.id}) is nested in "${currentPageList.title}" (${currentPageList.sys.id})`
      );
      console.log(
        `Current PageList has ${currentPageList.pagesCollection?.items?.length ?? 0} items in pagesCollection`
      );

      // Debug logging: Show all items in the current PageList to verify nesting structure
      currentPageList.pagesCollection?.items?.forEach((item: unknown, index: number) => {
        const typedItem = item as { sys?: { id?: string }; title?: string; __typename?: string };
        console.log(
          `Item ${index}: ID=${typedItem?.sys?.id}, Title=${typedItem?.title ?? 'No title'}, Type=${typedItem?.__typename ?? 'Unknown'}`
        );
      });

      // Validate nesting: Check if the current PageList contains the next PageList in its pagesCollection
      // This ensures URLs like /products/trackers are valid (trackers must be nested under products)
      const isNested = currentPageList.pagesCollection?.items?.some((item: unknown) => {
        const typedItem = item as { sys?: { id?: string } };
        return typedItem?.sys?.id === pageList.sys.id;
      });

      console.log(`Is nested result: ${isNested}`);

      // If nesting validation fails, return null to trigger 404
      // This prevents access to invalid nested URLs
      if (!isNested) {
        console.log(`PageList "${pageList.title}" is not nested in "${currentPageList.title}"`);
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
  console.log(`Final PageList lookup for "${finalSlug}": ${finalPageList ? 'Found' : 'Not found'}`);

  // Case 1: Final segment is a PageList nested within the current parent PageList
  if (finalPageList && currentPageList) {
    console.log(
      `Checking if final PageList "${finalPageList.title}" (${finalPageList.sys.id}) is nested in "${currentPageList.title}" (${currentPageList.sys.id})`
    );
    console.log(
      `Parent PageList has ${currentPageList.pagesCollection?.items?.length ?? 0} items in pagesCollection`
    );

    // Debug logging: Show all items in the parent PageList
    currentPageList.pagesCollection?.items?.forEach((item: unknown, index: number) => {
      const typedItem = item as { sys?: { id?: string }; title?: string; __typename?: string };
      console.log(
        `Parent item ${index}: ID=${typedItem?.sys?.id}, Title=${typedItem?.title ?? 'No title'}, Type=${typedItem?.__typename ?? 'Unknown'}`
      );
    });

    // Final nesting validation: Ensure the final PageList is actually nested in its parent
    const isNested = currentPageList.pagesCollection?.items?.some((item: unknown) => {
      const typedItem = item as { sys?: { id?: string } };
      return typedItem?.sys?.id === finalPageList.sys.id;
    });

    console.log(`Final PageList is nested result: ${isNested}`);

    if (isNested) {
      return { content: finalPageList, type: 'PageList', parentPageLists };
    }
  } else if (finalPageList && !currentPageList) {
    // Case 2: This is a standalone PageList (single segment URL like /products)
    console.log(`Found standalone PageList: ${finalPageList.title}`);
    return { content: finalPageList, type: 'PageList', parentPageLists };
  }

  // Case 3: Final segment is a content item (Page, Product, Service, etc.)
  // Try to fetch as different content types and validate it belongs to the parent PageList
  const contentItem = await tryFetchContentItem(finalSlug, preview);
  if (contentItem && currentPageList) {
    // Critical validation: Ensure the content item is actually contained within the parent PageList
    // This prevents access to content items via incorrect nested URLs
    const isInList = currentPageList.pagesCollection?.items?.some(
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
      itemsCollection?: { items?: unknown[] }; // Products and Solutions use itemsCollection
    };

    // Use the appropriate collection based on content type
    const contentItems =
      type === 'Product' || type === 'Solution'
        ? (contentItem.itemsCollection?.items ?? [])
        : (contentItem.pageContentCollection?.items ?? []);

    console.log(`Rendering ${type} content: ${contentItem.title}`);
    console.log(`Content items count: ${contentItems.length}`);
    console.log(
      'Content items:',
      contentItems.map((item: any) => ({
        id: item?.sys?.id,
        type: item?.__typename
      }))
    );

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
    console.warn(`Component at index ${componentIndex} has no __typename:`, component);
    return null;
  }

  console.log(
    `Rendering component: ${typedComponent.__typename} with ID: ${typedComponent.sys?.id}`
  );
  console.log('Full component data:', JSON.stringify(component, null, 2));
  console.log('Available component types:', Object.keys(componentMap));
  console.log('RichContent component:', RichContent);
  
  // Check if this is a RichContent item (has richText or content field)
  const hasRichText = 'richText' in (component as any) || 'content' in (component as any);
  console.log('Has richText/content field:', hasRichText);
  if (hasRichText) {
    console.log('This appears to be RichContent, checking fields:', {
      richText: (component as any).richText,
      content: (component as any).content,
      tableOfContents: (component as any).tableOfContents
    });
  }

  const ComponentType = componentMap[typedComponent.__typename as keyof typeof componentMap];
  if (ComponentType) {
    console.log(`Found ComponentType for ${typedComponent.__typename}:`, ComponentType.name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <ComponentType key={typedComponent.sys?.id ?? componentIndex} {...(component as any)} />;
  }

  console.warn(
    `No component found for type: ${typedComponent.__typename}. Available types:`,
    Object.keys(componentMap)
  );
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
    console.log(`Attempting to resolve nested content for: ${segments.join('/')}`);

    const result = await resolveNestedContent(segments);

    if (!result) {
      console.log(`No content found for: ${segments.join('/')}`);
      notFound();
    }

    const { content, type, parentPageLists } = result;

    console.log(
      `Successfully resolved ${type}: ${content.title} with ${parentPageLists.length} parent PageLists`
    );

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
  } catch (error) {
    console.error(`Error handling nested segments: ${segments.join('/')}`, error);
    notFound();
  }
}
