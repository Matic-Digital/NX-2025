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
 * - Automatic breadcrumb generation
 * - Recursive PageList nesting support
 * - Content item rendering within nested PageLists
 * - Breadcrumb navigation for nested structures
 * - Server-side rendering with proper error handling
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/prefer-optional-chain */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPageListBySlug } from '@/lib/contentful-api/page-list';
import { getProductBySlug } from '@/lib/contentful-api/product';
import { getServiceBySlug } from '@/lib/contentful-api/service';
import { getSolutionBySlug } from '@/lib/contentful-api/solution';
import { getPostBySlug } from '@/lib/contentful-api/post';
import { getPageBySlug } from '@/lib/contentful-api/page';
import { PageLayout } from '@/components/layout/PageLayout';
import { BannerHero } from '@/components/BannerHero';
import { CtaBanner } from '@/components/CtaBanner';
import { Content } from '@/components/Content';
import { ContentGrid } from '@/components/ContentGrid';
import { ImageBetween } from '@/components/ImageBetween';
import type { Page } from '@/types/contentful/Page';
import type { PageList as PageListType } from '@/types/contentful/PageList';
import type { Product } from '@/types/contentful/Product';
import type { Service } from '@/types/contentful/Service';
import type { Solution } from '@/types/contentful/Solution';
import type { Post } from '@/types/contentful/Post';
import type { PageLayout as PageLayoutType } from '@/types/contentful/PageLayout';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Footer as FooterType } from '@/types/contentful/Footer';
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
  ImageBetween
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
async function resolveNestedContent(segments: string[]): Promise<{
  content: ContentItem | PageListType;
  type: 'Page' | 'PageList' | 'Product' | 'Service' | 'Solution' | 'Post';
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
  const parentPageLists: PageListType[] = [];
  let currentPageList: PageListType | null = null;

  // Traverse through parent PageLists
  for (let i = 0; i < segments.length - 1; i++) {
    const slug = segments[i]!;
    const pageList = await getPageListBySlug(slug, preview);

    if (!pageList) {
      console.log(`PageList not found for slug: ${slug}`);
      return null;
    }

    // If this is not the first PageList, verify it's nested in the previous one
    if (currentPageList) {
      console.log(
        `Checking if PageList "${pageList.title}" (${pageList.sys.id}) is nested in "${currentPageList.title}" (${currentPageList.sys.id})`
      );
      console.log(
        `Current PageList has ${currentPageList.pagesCollection?.items?.length ?? 0} items in pagesCollection`
      );

      // Log all items in the current PageList for debugging
      currentPageList.pagesCollection?.items?.forEach((item: unknown, index: number) => {
        const typedItem = item as { sys?: { id?: string }; title?: string; __typename?: string };
        console.log(
          `Item ${index}: ID=${typedItem?.sys?.id}, Title=${typedItem?.title ?? 'No title'}, Type=${typedItem?.__typename ?? 'Unknown'}`
        );
      });

      const isNested = currentPageList.pagesCollection?.items?.some((item: unknown) => {
        const typedItem = item as { sys?: { id?: string } };
        return typedItem?.sys?.id === pageList.sys.id;
      });

      console.log(`Is nested result: ${isNested}`);

      if (!isNested) {
        console.log(`PageList "${pageList.title}" is not nested in "${currentPageList.title}"`);
        return null;
      }
    }

    parentPageLists.push(pageList);
    currentPageList = pageList;
  }

  // Now try to find the final item
  const finalSlug = segments[segments.length - 1]!;

  // Try as PageList first
  const finalPageList = await getPageListBySlug(finalSlug, preview);
  console.log(`Final PageList lookup for "${finalSlug}": ${finalPageList ? 'Found' : 'Not found'}`);

  if (finalPageList && currentPageList) {
    console.log(
      `Checking if final PageList "${finalPageList.title}" (${finalPageList.sys.id}) is nested in "${currentPageList.title}" (${currentPageList.sys.id})`
    );
    console.log(
      `Parent PageList has ${currentPageList.pagesCollection?.items?.length ?? 0} items in pagesCollection`
    );

    // Log all items in the parent PageList for debugging
    currentPageList.pagesCollection?.items?.forEach((item: unknown, index: number) => {
      const typedItem = item as { sys?: { id?: string }; title?: string; __typename?: string };
      console.log(
        `Parent item ${index}: ID=${typedItem?.sys?.id}, Title=${typedItem?.title ?? 'No title'}, Type=${typedItem?.__typename ?? 'Unknown'}`
      );
    });

    // Verify it's nested in the parent
    const isNested = currentPageList.pagesCollection?.items?.some((item: unknown) => {
      const typedItem = item as { sys?: { id?: string } };
      return typedItem?.sys?.id === finalPageList.sys.id;
    });

    console.log(`Final PageList is nested result: ${isNested}`);

    if (isNested) {
      return { content: finalPageList, type: 'PageList', parentPageLists };
    }
  } else if (finalPageList && !currentPageList) {
    // This is a standalone PageList (single slug)
    console.log(`Found standalone PageList: ${finalPageList.title}`);
    return { content: finalPageList, type: 'PageList', parentPageLists };
  }

  // Try as content item
  const contentItem = await tryFetchContentItem(finalSlug, preview);
  if (contentItem && currentPageList) {
    // Verify it's in the parent PageList
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

  // For other content types, render using the existing renderContentByType from the main component
  return (
    <div>
      <h1>{(content as { title?: string }).title}</h1>
      {(
        content as { pageContentCollection?: { items?: unknown[] } }
      ).pageContentCollection?.items?.map((component: unknown, componentIndex: number) => {
        const typedComponent = component as { __typename?: string; sys?: { id?: string } };
        if (!typedComponent || !typedComponent.__typename) return null;

        const typeName = typedComponent.__typename;

        if (typeName && typeName in componentMap) {
          const ComponentType = componentMap[typeName as keyof typeof componentMap];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (
            <ComponentType key={typedComponent.sys?.id ?? componentIndex} {...(component as any)} />
          );
        }

        console.warn(`No component found for type: ${typedComponent.__typename}`);
        return null;
      })}
    </div>
  );
}

const renderPageListContentByType = (component: unknown, componentIndex: number) => {
  const typedComponent = component as { __typename?: string; sys?: { id?: string } };
  if (!typedComponent?.__typename) return null;

  const ComponentType = componentMap[typedComponent.__typename as keyof typeof componentMap];
  if (ComponentType) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <ComponentType key={typedComponent.sys?.id ?? componentIndex} {...(component as any)} />;
  }

  console.warn(`No component found for type: ${typedComponent.__typename}`);
  return null;
};

// Helper function to render breadcrumbs
function renderBreadcrumbs(
  segments: string[],
  parentPageLists: PageListType[],
  currentTitle: string
) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Home
            </Link>
          </li>

          {/* Render parent PageList breadcrumbs */}
          {parentPageLists.map((pageList, index) => (
            <li key={pageList.sys.id}>
              <div className="flex items-center">
                <svg
                  className="mx-1 h-3 w-3 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <Link
                  href={`/${segments.slice(0, index + 1).join('/')}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  {pageList.title}
                </Link>
              </div>
            </li>
          ))}

          {/* Current page */}
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="mx-1 h-3 w-3 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{currentTitle}</span>
            </div>
          </li>
        </ol>
      </nav>
    </div>
  );
}

// Main component
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
        {/* Breadcrumb navigation */}
        {renderBreadcrumbs(segments, parentPageLists, content.title ?? 'Untitled')}

        {/* Render content */}
        <div key={0}>{renderContentByType({ type, content }, 0)}</div>
      </PageLayout>
    );
  } catch (error) {
    console.error(`Error handling nested segments: ${segments.join('/')}`, error);
    notFound();
  }
}
