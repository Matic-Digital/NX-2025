import { fetchGraphQL } from '@/lib/api';
import { getCacheConfig } from '@/lib/cache-tags';
import { getPAGE_WITH_REFS_FIELDS, SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BANNERHERO_GRAPHQL_FIELDS } from '@/components/BannerHero/BannerHeroApi';
import { CONTENTGRID_GRAPHQL_FIELDS } from '@/components/ContentGrid/ContentGridApi';
import { CTABANNER_GRAPHQL_FIELDS } from '@/components/CtaBanner/CtaBannerApi';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { IMAGEBETWEEN_GRAPHQL_FIELDS, getImageBetweenById } from '@/components/ImageBetween/ImageBetweenApi';
import { REGIONS_MAP_GRAPHQL_FIELDS } from '@/components/Region/RegionApi';
import { REGIONSTATS_GRAPHQL_FIELDS } from '@/components/RegionStats/RegionStatsApi';
import { RICHCONTENT_GRAPHQL_FIELDS } from '@/components/RichContent/RichContentApi';

import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';
import type { Page, PageResponse, PageWithRefs } from '@/components/Page/PageSchema';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';

// Define a new interface that extends Page with header and footer
interface PageWithHeaderFooter extends Page {
  header: Header | null;
  footer: Footer | null;
}

/**
 * Fetches all pages from Contentful with minimal data (for collections/listings)
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to pages response with minimal data
 */
export async function getAllPagesMinimal(preview = false): Promise<PageResponse> {
  try {
    const response = await fetchGraphQL<Page>(
      `query GetAllPagesMinimal($preview: Boolean!) {
        pageCollection(preview: $preview) {
          items {
            ${SYS_FIELDS}
            title
            slug
            description
            openGraphImage {
              link
              altText
            }
            contentfulMetadata {
              tags {
                id
                name
              }
            }
          }
          total
        }
      }`,
      { preview },
      preview
    );

    if (!response.data?.pageCollection) {
      throw new ContentfulError('Failed to fetch pages from Contentful');
    }

    return {
      items: response.data.pageCollection.items,
      total: response.data.pageCollection.total
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching pages: ${_error.message}`);
    }
    throw new Error('Unknown error fetching pages');
  }
}

/**
 * Fetches all pages from Contentful
 * @param preview - Whether to fetch draft content
 * @param skip - Number of pages to skip for pagination
 * @param limit - Maximum number of pages to fetch
 * @returns Promise resolving to pages response with pagination info
 */
export async function getAllPages(preview = false, skip = 0, limit = 10): Promise<PageResponse> {
  try {
    // Use minimal fields for listing pages to avoid QUERY_TOO_BIG
    const response = await fetchGraphQL<Page>(
      `query GetAllPages($preview: Boolean!, $skip: Int!, $limit: Int!) {
        pageCollection(preview: $preview, skip: $skip, limit: $limit) {
          items {
            ${getPAGE_WITH_REFS_FIELDS()}
          }
          total
        }
      }`,
      { preview, skip, limit },
      preview
    );

    if (!response.data?.pageCollection) {
      throw new ContentfulError('Failed to fetch pages from Contentful');
    }

    return {
      items: response.data.pageCollection.items,
      total: response.data.pageCollection.total
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching pages: ${_error.message}`);
    }
    throw new Error('Unknown error fetching pages');
  }
}

/**
 * Fetches a single page by slug
 * @param slug - The slug of the page to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page with header and footer or null if not found
 */
export async function getPageBySlug(
  slug: string,
  preview = true
): Promise<PageWithHeaderFooter | null> {
  try {
    const cacheConfig = {
      next: {
        revalidate: preview ? 0 : 3600,
        tags: [`page-${slug}`]
      }
    };

    const response = await fetchGraphQL<PageWithRefs>(
      `query GetPageBySlug($slug: String!, $preview: Boolean!) {
        pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getPAGE_WITH_REFS_FIELDS()}
          }
        }
      }`,
      { slug, preview },
      preview,
      cacheConfig
    );

    if (!response.data?.pageCollection?.items?.length) {
      return null;
    }

    const pageData = response.data.pageCollection.items[0]!;

    // Type assertion for pageLayout to avoid 'any' type
    const pageLayout = pageData.pageLayout as PageLayoutType | undefined;

    // Fetch header data if referenced
    let header = null;
    if (pageLayout?.header) {
      // Type assertion for header reference
      const headerRef = pageLayout.header as { sys: { id: string } };
      if (headerRef.sys?.id) {
        header = await getHeaderById(headerRef.sys.id, preview);
      }
    }

    // Fetch footer data if referenced
    let footer = null;
    if (pageLayout?.footer) {
      // Type assertion for footer reference
      const footerRef = pageLayout.footer as { sys: { id: string } };
      if (footerRef.sys?.id) {
        footer = await getFooterById(footerRef.sys.id, preview);
      }
    }

    // Fetch page content separately
    const pageContentResponse = await fetchGraphQL(
      `query GetPageContent($slug: String!, $preview: Boolean!) {
        pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            pageContentCollection(limit: 10) {
              items {
                ... on BannerHero {
                  ${BANNERHERO_GRAPHQL_FIELDS}
                }
                ... on Content {
                  ${SYS_FIELDS}
                }
                ... on ContentGrid {
                  ${CONTENTGRID_GRAPHQL_FIELDS}
                }
                ... on CtaBanner {
                  ${CTABANNER_GRAPHQL_FIELDS}
                }
                ... on ImageBetween {
                  ${IMAGEBETWEEN_GRAPHQL_FIELDS}
                }
                ... on RegionsMap {
                  ${SYS_FIELDS}
                }
                ... on RegionStats {
                  ${REGIONSTATS_GRAPHQL_FIELDS}
                }
                ... on ContentTypeRichText {
                  ${RICHCONTENT_GRAPHQL_FIELDS}
                }
              }
            }
          }
        }
      }`,
      { slug, preview },
      preview
    );

    // Safely extract page content with proper error checking
    let pageContent: any = null;
    try {
      const items = pageContentResponse.data?.pageCollection?.items;
      if (items && items.length > 0 && items[0]) {
        // Type assertion is safe here since we know the GraphQL query structure
        const pageItem = items[0] as { pageContentCollection?: { items: Array<unknown> } };
        pageContent = (pageItem.pageContentCollection ?? null) as typeof pageContent;
      }
    } catch {
      pageContent = null;
    }

    // Post-process to enrich ImageBetween and ContentGrid components (PARALLEL)
    console.log('Page API: Starting PARALLEL server-side enrichment for pageContent:', pageContent);
    if (pageContent?.items) {
      console.log('Page API: Found', pageContent.items.length, 'items to process in PARALLEL');
      const enrichmentPromises = pageContent.items.map(async (item: any) => {
        console.log('Page API: Processing item in PARALLEL:', item.__typename, item.sys?.id);
        if (item.__typename === 'ImageBetween' && item.sys?.id) {
          try {
            const enrichedImageBetween = await getImageBetweenById(item.sys.id, preview);
            return enrichedImageBetween || item;
          } catch (error) {
            return item;
          }
        } else if (item.__typename === 'ContentGrid' && item.itemsCollection?.items?.length > 0) {
          try {
            // Enrich Posts and Collections in ContentGrid (server-side lazy loading)
            // First, get Collection IDs for empty objects (same as client-side logic)
            const hasEmptyObjects = item.itemsCollection.items.some(
              (gridItem: any) => gridItem && typeof gridItem === 'object' && Object.keys(gridItem).length === 0
            );
            
            let collectionIds: string[] = [];
            if (hasEmptyObjects && item.sys?.id) {
              try {
                const { getCollectionIdsFromContentGrid } = await import('@/components/ContentGrid/ContentGridApi');
                collectionIds = await getCollectionIdsFromContentGrid(item.sys.id);
                console.log('Page ContentGrid: Found Collection IDs:', collectionIds);
              } catch (error) {
                console.warn('Failed to get Collection IDs for ContentGrid:', error);
              }
            }
            
            let collectionIndex = 0;
            const enrichmentPromises = item.itemsCollection.items.map(async (gridItem: any) => {
              // Handle empty objects (Collections)
              if (gridItem && typeof gridItem === 'object' && Object.keys(gridItem).length === 0) {
                const collectionId = collectionIds.at(collectionIndex);
                collectionIndex++;
                if (collectionId) {
                  try {
                    const { getCollectionById } = await import('@/components/Collection/CollectionApi');
                    console.log('Page ContentGrid: Enriching Collection (empty object)', collectionId);
                    const enrichedCollection = await getCollectionById(collectionId, preview);
                    console.log('Page ContentGrid: Collection enrichment result:', {
                      id: collectionId,
                      hasEnrichedData: !!enrichedCollection,
                      hasTitle: !!enrichedCollection?.title
                    });
                    return enrichedCollection || { sys: { id: collectionId }, __typename: 'Collection' };
                  } catch (error) {
                    console.warn(`Failed to enrich Collection ${collectionId} in Page ContentGrid:`, error);
                    return { sys: { id: collectionId }, __typename: 'Collection' };
                  }
                } else {
                  console.warn('No Collection ID found for empty object');
                  return { sys: { id: 'unknown-collection' }, __typename: 'Collection', title: 'Collection (No ID Found)' };
                }
              } else if (gridItem.__typename === 'Post' && gridItem.sys?.id) {
                try {
                  // Dynamically import Post API to avoid circular dependency
                  const { getPostById } = await import('@/components/Post/PostApi');
                  console.log('Page ContentGrid: Enriching Post', gridItem.sys.id);
                  const enrichedPost = await getPostById(gridItem.sys.id, preview);
                  console.log('Page ContentGrid: Post enrichment result:', {
                    id: gridItem.sys.id,
                    hasEnrichedData: !!enrichedPost,
                    hasTitle: !!enrichedPost?.title,
                    hasSlug: !!enrichedPost?.slug
                  });
                  return enrichedPost || gridItem;
                } catch (error) {
                  console.warn(`Failed to enrich Post ${gridItem.sys.id} in Page ContentGrid:`, error);
                  return gridItem;
                }
              } else if (gridItem.__typename === 'Collection' && gridItem.sys?.id) {
                try {
                  // Dynamically import Collection API to avoid circular dependency
                  const { getCollectionById } = await import('@/components/Collection/CollectionApi');
                  console.log('Page ContentGrid: Enriching Collection', gridItem.sys.id);
                  const enrichedCollection = await getCollectionById(gridItem.sys.id, preview);
                  console.log('Page ContentGrid: Collection enrichment result:', {
                    id: gridItem.sys.id,
                    hasEnrichedData: !!enrichedCollection,
                    hasTitle: !!enrichedCollection?.title
                  });
                  return enrichedCollection || gridItem;
                } catch (error) {
                  console.warn(`Failed to enrich Collection ${gridItem.sys.id} in Page ContentGrid:`, error);
                  return gridItem;
                }
              }
              return gridItem;
            });
            
            const enrichedGridItems = await Promise.all(enrichmentPromises);
            return {
              ...item,
              itemsCollection: {
                ...item.itemsCollection,
                items: enrichedGridItems
              }
            };
          } catch (error) {
            console.warn('Failed to enrich ContentGrid in Page:', error);
            return item;
          }
        }
        return item;
      });
      
      const enrichedItems = await Promise.all(enrichmentPromises);
      pageContent = {
        ...pageContent,
        items: enrichedItems
      };
    }

    // Combine all the data
    return {
      ...pageData,
      header,
      footer,
      pageContentCollection: pageContent
    } as PageWithHeaderFooter;
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching page by slug: ${_error.message}`);
    }
    throw new Error('Unknown error fetching page by slug');
  }
}

/**
 * Fetches a single page by ID
 * @param id - The ID of the page to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page with header and footer or null if not found
 */
export async function getPageById(
  id: string,
  preview = false
): Promise<PageWithHeaderFooter | null> {
  try {
    // First, fetch the basic page data with references
    const response = await fetchGraphQL<PageWithRefs>(
      `query GetPageById($id: String!, $preview: Boolean!) {
        pageCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${getPAGE_WITH_REFS_FIELDS()}
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.pageCollection?.items?.length) {
      return null;
    }

    const pageData = response.data.pageCollection.items[0]!;

    // Type assertion for pageLayout to avoid 'any' type
    const pageLayout = pageData.pageLayout as PageLayoutType | undefined;

    // Fetch header data if referenced
    let header = null;
    if (pageLayout?.header) {
      // Type assertion for header reference
      const headerRef = pageLayout.header as { sys: { id: string } };
      if (headerRef.sys?.id) {
        header = await getHeaderById(headerRef.sys.id, preview);
      }
    }

    // Fetch footer data if referenced
    let footer = null;
    if (pageLayout?.footer) {
      // Type assertion for footer reference
      const footerRef = pageLayout.footer as { sys: { id: string } };
      if (footerRef.sys?.id) {
        footer = await getFooterById(footerRef.sys.id, preview);
      }
    }

    // Fetch page content separately
    const pageContentResponse = await fetchGraphQL(
      `query GetPageContentById($id: String!, $preview: Boolean!) {
        pageCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            pageContentCollection(limit: 10) {
              items {
                ... on BannerHero {
                  ${BANNERHERO_GRAPHQL_FIELDS}
                }
                ... on Content {
                  ${SYS_FIELDS}
                }
                ... on ContentGrid {
                  ${CONTENTGRID_GRAPHQL_FIELDS}
                }
                ... on CtaBanner {
                  ${CTABANNER_GRAPHQL_FIELDS}
                }
                ... on ImageBetween {
                  ${IMAGEBETWEEN_GRAPHQL_FIELDS}
                }
                ... on RegionsMap {
                  ${REGIONS_MAP_GRAPHQL_FIELDS}
                }
                ... on RegionStats {
                  ${REGIONSTATS_GRAPHQL_FIELDS}
                }
                ... on ContentTypeRichText {
                  ${RICHCONTENT_GRAPHQL_FIELDS}
                }
              }
            }
          }
        }
      }`,
      { id, preview },
      preview
    );

    // Safely extract page content with proper error checking
    let pageContent = null;
    try {
      const items = pageContentResponse.data?.pageCollection?.items;
      if (items && items.length > 0 && items[0]) {
        // Type assertion is safe here since we know the GraphQL query structure
        const pageItem = items[0] as { pageContentCollection?: { items: Array<unknown> } };
        pageContent = pageItem.pageContentCollection ?? null;
      }
    } catch {
      pageContent = null;
    }

    // Post-process to enrich ImageBetween components
    if (pageContent?.items) {
      const enrichmentPromises = pageContent.items.map(async (item: any) => {
        if (item.__typename === 'ImageBetween' && item.sys?.id) {
          try {
            const enrichedImageBetween = await getImageBetweenById(item.sys.id, preview);
            return enrichedImageBetween || item;
          } catch (error) {
            return item;
          }
        }
        return item;
      });
      
      const enrichedItems = await Promise.all(enrichmentPromises);
      pageContent = {
        ...pageContent,
        items: enrichedItems
      };
    }

    // Combine all the data
    return {
      ...pageData,
      header,
      footer,
      pageContentCollection: pageContent
    } as PageWithHeaderFooter;
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching page by ID: ${_error.message}`);
    }
    throw new Error('Unknown error fetching page by ID');
  }
}
