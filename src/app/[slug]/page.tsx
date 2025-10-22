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

import { getAllPageLists, getPageBySlug, getPageListBySlug } from '@/lib/contentful-api';
import { getPageSEOBySlug, getPageListSEOBySlug } from '@/lib/contentful-seo-api';
import { getProductBySlug } from '@/components/Product/ProductApi';
import { getServiceBySlug } from '@/components/Service/ServiceApi';
import { getSolutionBySlug } from '@/components/Solution/SolutionApi';
import { getPostBySlug } from '@/components/Post/PostApi';
import {
  extractOpenGraphImage,
  extractSEODescription,
  extractSEOTitle,
  extractOpenGraphTitle,
  extractOpenGraphDescription,
  extractCanonicalUrl,
  extractIndexing
} from '@/lib/metadata-utils';
import { contentfulSchemaMapper } from '@/lib/contentful-schema-mapper';
import { JsonLdSchema } from '@/components/Schema/JsonLdSchema';

import { BannerHero } from '@/components/BannerHero/BannerHero';
import { Content } from '@/components/Content/Content';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { PageList } from '@/components/PageList/PageList';
import { RegionsMap } from '@/components/Region/RegionsMap';
import { RegionStats } from '@/components/RegionStats/RegionStats';
import { RichContent } from '@/components/RichContent/RichContent';

import type { Footer as FooterType } from '@/components/Footer/FooterSchema';
import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Page } from '@/components/Page/PageSchema';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';
import type {
  PageListContent,
  PageList as PageListType
} from '@/components/PageList/PageListSchema';
import type { Metadata } from 'next';

// Define the component mapping for pageContent items
const componentMap = {
  BannerHero: BannerHero,
  Content: Content,
  ContentGrid: ContentGrid,
  CtaBanner: CtaBanner,
  ImageBetween: ImageBetween,
  RegionsMap: RegionsMap,
  RegionStats: RegionStats,
  RichContent: RichContent,
  ContentTypeRichText: RichContent // Map Contentful's ContentTypeRichText to RichContent component
};

// Define props for the content component
interface ContentPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Helper function to check if a slug should be redirected to nested path
async function checkForNestedRedirect(slug: string): Promise<string | null> {
  try {
    const pageListsResponse = await getAllPageLists(false);
    const pageLists = pageListsResponse.items;

    // Type guard to check if an item has a slug property
    const hasSlug = (item: unknown): item is { slug: string; sys: { id: string } } => {
      return Boolean(item && typeof (item as { slug?: string }).slug === 'string');
    };

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

    // Find the PageList that matches slug
    const targetPageList = pageLists.find((pageList) => pageList.slug === slug);
    if (!targetPageList) {
      // No direct PageList match, continue to check for content items
    } else {
      // Found direct PageList match, check for parents
    }

    // Check if this PageList has parents, but also check for Page conflicts first
    if (targetPageList) {
      // Before redirecting a PageList, check if there are also Pages with the same slug
      // This prevents conflicts where both a PageList and Page have the same slug
      let hasPageConflict = false;
      
      for (const pageList of pageLists) {
        if (!pageList.pagesCollection?.items?.length) continue;
        
        const foundPage = pageList.pagesCollection.items.find(
          (item) => hasSlug(item) && (item.slug === slug || item.slug?.endsWith(`/${slug}`))
        );
        
        if (foundPage) {
          hasPageConflict = true;
          break;
        }
      }
      
      // If there's a conflict, don't auto-redirect - let user access via explicit nested URLs
      if (hasPageConflict) {
        return null;
      }
      
      const parentPath = buildRoutingPath(targetPageList.sys.id);
      if (parentPath.length > 0) {
        const fullPath = [...parentPath, slug].join('/');
        return fullPath;
      }
    }

    // Check if slug is a content item within any PageList (including nested PageLists)
    const matchingPageLists: Array<{ pageList: typeof pageLists[0]; fullPath: string }> = [];
    
    for (const pageList of pageLists) {
      if (!pageList.pagesCollection?.items?.length) continue;

      const foundItem = pageList.pagesCollection.items.find(
        (item) => hasSlug(item) && item.slug === slug
      );

      if (foundItem && hasSlug(foundItem)) {
        const parentPath = buildRoutingPath(pageList.sys.id);
        const fullPath = [...parentPath, pageList.slug, foundItem.slug].join('/');
        matchingPageLists.push({ pageList, fullPath });
      }
    }

    // If we found multiple matches, don't auto-redirect to avoid conflicts
    // Let the user access the content directly via the nested URL structure
    if (matchingPageLists.length > 1) {
      return null;
    }

    // If we found exactly one match, redirect to it
    if (matchingPageLists.length === 1) {
      return matchingPageLists[0]!.fullPath;
    }

    // Also check if slug is a product/content item that should be nested deeper
    // This handles cases like individual products within trackers
    const allContentTypes = ['Product', 'Service', 'Solution', 'Post', 'Page'];

    for (const contentType of allContentTypes) {
      try {
        let contentItem = null;

        // Try to fetch the content item by slug using the appropriate API
        if (contentType === 'Product') {
          contentItem = await getProductBySlug(slug, false);
        } else if (contentType === 'Service') {
          contentItem = await getServiceBySlug(slug, false);
        } else if (contentType === 'Solution') {
          contentItem = await getSolutionBySlug(slug, false);
        } else if (contentType === 'Post') {
          contentItem = await getPostBySlug(slug, false);
        } else if (contentType === 'Page') {
          contentItem = await getPageBySlug(slug, false);
        }


        if (contentItem) {

          // Find which PageLists contain this content item
          const containingPageLists: Array<{ pageList: typeof pageLists[0]; fullPath: string }> = [];

          for (const pageList of pageLists) {
            if (!pageList.pagesCollection?.items?.length) continue;


            const isInPageList = pageList.pagesCollection.items.some((item) => {
              const match = item?.sys?.id === contentItem.sys.id;
              if (match) {
              }
              return match;
            });

            if (isInPageList) {
              const parentPath = buildRoutingPath(pageList.sys.id);
              const fullPath = [...parentPath, pageList.slug, contentItem.slug].join('/');
              containingPageLists.push({ pageList, fullPath });
            }
          }

          // If content item is in multiple PageLists, don't auto-redirect
          if (containingPageLists.length > 1) {
            return null;
          }

          // If content item is in exactly one PageList, redirect to it
          if (containingPageLists.length === 1) {
            const fullPath = containingPageLists[0]!.fullPath;
            return fullPath;
          }

        }
      } catch (_error) {
        // Continue to next content type if this one fails
        continue;
      }
    }
    return null;
  } catch (_error) {
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
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  try {
    // First, check if this slug should be redirected to a nested path
    const nestedPath = await checkForNestedRedirect(slug);
    if (nestedPath && nestedPath !== slug) {
      redirect(`/${nestedPath}`);
    }

    // Try to fetch SEO data for a Page first (lightweight query)
    const pageSEO = await getPageSEOBySlug(slug, false) as unknown;

    if (pageSEO) {
      // Found Page SEO data
    } else {
      // No Page SEO found
    }

    if (pageSEO) {
      // Extract SEO data from Page SEO data using utility functions
      const title = extractSEOTitle(pageSEO, 'Nextracker');
      const description = extractSEODescription(pageSEO, 'Nextracker Website');
      const ogTitle = extractOpenGraphTitle(pageSEO, title);
      const ogDescription = extractOpenGraphDescription(pageSEO, description);
      const canonicalUrl = extractCanonicalUrl(pageSEO);
      const shouldIndex = extractIndexing(pageSEO, true);

      // Handle OG image from Page SEO data
      const openGraphImage = extractOpenGraphImage(pageSEO, baseUrl, title);

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
          url: `${baseUrl}/${slug}`
        },
        twitter: {
          card: 'summary_large_image',
          title: ogTitle,
          description: ogDescription,
          images: openGraphImage ? [openGraphImage.url] : []
        },
        alternates: {
          canonical: canonicalUrl ?? `${baseUrl}/${slug}`
        }
      };
    }

    // Try to fetch SEO data for a PageList (lightweight query)
    const pageListSEO = await getPageListSEOBySlug(slug, false) as unknown;

    if (pageListSEO) {
      // Found PageList SEO data
    } else {
      // No PageList SEO found
    }

    if (pageListSEO) {
      // Extract SEO data from PageList SEO data using utility functions
      const title = extractSEOTitle(pageListSEO, 'Nextracker');
      const description = extractSEODescription(pageListSEO, 'Nextracker Website');
      const ogTitle = extractOpenGraphTitle(pageListSEO, title);
      const ogDescription = extractOpenGraphDescription(pageListSEO, description);
      const canonicalUrl = extractCanonicalUrl(pageListSEO);
      const shouldIndex = extractIndexing(pageListSEO, true);

      // Handle OG image from PageList SEO data
      const openGraphImage = extractOpenGraphImage(pageListSEO, baseUrl, title);

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
          url: `${baseUrl}/${slug}`
        },
        twitter: {
          card: 'summary_large_image',
          title: ogTitle,
          description: ogDescription,
          images: openGraphImage ? [openGraphImage.url] : []
        },
        alternates: {
          canonical: canonicalUrl ?? `${baseUrl}/${slug}`
        }
      };
    }

    // If neither found, return 404 metadata
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  } catch (_error) {
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
    const nestedPath = await checkForNestedRedirect(slug);
    if (nestedPath && nestedPath !== slug) {
      redirect(`/${nestedPath}`);
    }

    // Try to fetch the content as a Page first
    let page;
    try {
      page = await getPageBySlug(slug, preview);
    } catch (pageError) {
      throw new Error(
        `Failed to fetch page: ${pageError instanceof Error ? pageError.message : String(pageError)}`
      );
    }

    // If it's a Page, render it as a standalone page
    if (page) {
      try {
        return await renderPage(page, slug);
      } catch (renderError) {
        throw new Error(
          `Failed to render page: ${renderError instanceof Error ? renderError.message : String(renderError)}`
        );
      }
    }

    // If it's not a Page, try to fetch it as a PageList
    let pageList;
    try {
      pageList = await getPageListBySlug(slug, preview);
    } catch (pageListError) {
      throw new Error(
        `Failed to fetch pageList: ${pageListError instanceof Error ? pageListError.message : String(pageListError)}`
      );
    }

    // If it's a PageList, render it
    if (pageList) {
      try {
        return await renderPageList(pageList, slug);
      } catch (renderError) {
        throw new Error(
          `Failed to render pageList: ${renderError instanceof Error ? renderError.message : String(renderError)}`
        );
      }
    }

    // If neither Page nor PageList is found, return a 404
    notFound();
  } catch (_error) {

    // Instead of converting all errors to 404s, let's throw the actual error
    // to help with debugging the 500 error in production
    throw _error;
  }
}

// Helper function to render a Page
async function renderPage(page: Page, slug: string) {
  const pageLayout = page.pageLayout as PageLayoutType | undefined;
  const pageHeader = pageLayout?.header as HeaderType | undefined;
  const pageFooter = pageLayout?.footer as FooterType | undefined;
  
  // Generate connected schema (includes organization connections)
  const pageSchema = contentfulSchemaMapper.mapContentToSchema(page, `/${slug}`, 'page');
  
  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <JsonLdSchema schema={pageSchema} id="page-schema" />
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return <ComponentType key={componentWithSys.sys.id} {...(component as any)} />;
        }

        // Log a warning if we don't have a component for this type
        return null;
      })}
    </PageLayout>
  );
}

// Helper function to render a PageList
async function renderPageList(pageList: PageListType, slug: string) {
  const pageLayout = pageList.pageLayout as PageLayoutType | undefined;
  const pageHeader = pageLayout?.header as HeaderType | undefined;
  const pageFooter = pageList.pageLayout as PageLayoutType | undefined;

  // Extract page content items if available and type them properly
  const pageContentItems = (pageList.pageContentCollection?.items ?? []).filter(
    Boolean
  ) as PageListContent[];

  // Generate connected schema (includes organization connections)
  const pageListSchema = contentfulSchemaMapper.mapContentToSchema(pageList, `/${slug}`, 'pagelist');

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <JsonLdSchema schema={pageListSchema} id="pagelist-schema" />
      <h1 className="sr-only">{pageList.title}</h1>
      {/* Render components from pageContentCollection directly */}
      {pageContentItems.map((component) => {
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return <ComponentType key={componentWithSys.sys.id} {...(component as any)} />;
        }

        // Log a warning if we don't have a component for this type
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
