import { fetchGraphQL } from '@/lib/api';
import { getCacheConfig } from '@/lib/cache-tags';
import { SYS_FIELDS } from '@/lib/contentful-api';
import {
  getEXTERNAL_PAGE_FIELDS,
  getPAGELIST_BASIC_FIELDS,
  getPAGELIST_WITH_REFS_FIELDS,
  getPOST_BASIC_FIELDS,
  getPRODUCT_BASIC_FIELDS,
  getSERVICE_BASIC_FIELDS,
  getSOLUTION_BASIC_FIELDS
} from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { BANNERHERO_GRAPHQL_FIELDS as _BANNERHERO_GRAPHQL_FIELDS } from '@/components/BannerHero/BannerHeroApi';
import { CONTENTGRID_GRAPHQL_FIELDS as _CONTENTGRID_GRAPHQL_FIELDS } from '@/components/ContentGrid/ContentGridApi';
import { CTABANNER_GRAPHQL_FIELDS as _CTABANNER_GRAPHQL_FIELDS } from '@/components/CtaBanner/CtaBannerApi';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { IMAGEBETWEEN_GRAPHQL_FIELDS as _IMAGEBETWEEN_GRAPHQL_FIELDS } from '@/components/ImageBetween/ImageBetweenApi';

import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';
import type { PageLayout as PageLayoutType } from '@/components/PageLayout/PageLayoutSchema';
import type {
  PageList,
  PageListBySlugResponse,
  PageListCollectionResponse,
  PageListResponse,
  PageListWithRefs
} from '@/components/PageList/PageListSchema';

// Define a new interface that extends PageList with header and footer
interface PageListWithHeaderFooter extends PageList {
  header: Header | null;
  footer: Footer | null;
}

// Minimal PageList fields for initial fetch
export const PAGELIST_MINIMAL_FIELDS = `
  ${getPAGELIST_BASIC_FIELDS()}
  pagesCollection(limit: 50) {
    items {
      ... on Page {
        ${SYS_FIELDS}
        title
        slug
      }
      ... on ExternalPage {
        ${getEXTERNAL_PAGE_FIELDS()}
      }
      ... on Product {
        ${getPRODUCT_BASIC_FIELDS()}
      }
      ... on Service {
        ${getSERVICE_BASIC_FIELDS()}
      }
      ... on Solution {
        ${getSOLUTION_BASIC_FIELDS()}
      }
      ... on Post {
        ${getPOST_BASIC_FIELDS()}
      }
      ... on PageList {
        ${SYS_FIELDS}
        title
        slug
      }
    }
  }
`;

// PageList fields with page layout (header/footer references) only (no full data)
export const PAGELIST_WITH_REFS_FIELDS = `
    ${getPAGELIST_BASIC_FIELDS()}
    ${getPAGELIST_WITH_REFS_FIELDS()}
`;

// Simplified PageList fields for listing and reference checks
export const PAGELIST_SIMPLIFIED_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  pagesCollection(limit: 50) {
    items {
      ... on Page {
        ${SYS_FIELDS}
        title
        slug
      }
      ... on ExternalPage {
        ${getEXTERNAL_PAGE_FIELDS()}
      }
      ... on Product {
        ${getPRODUCT_BASIC_FIELDS()}
      }
      ... on Service {
        ${getSERVICE_BASIC_FIELDS()}
      }
      ... on Solution {
        ${getSOLUTION_BASIC_FIELDS()}
      }
      ... on Post {
        ${getPOST_BASIC_FIELDS()}
      }
      ... on PageList {
        ${SYS_FIELDS}
        title
        slug
      }
    }
  }
`;

/**
 * Checks if a page belongs to any PageList and returns the first PageList it belongs to
 * @param pageId - The ID of the page to check
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the PageList or null if not found
 */
export async function checkPageBelongsToPageList(
  pageId: string,
  preview = true
): Promise<PageList | null> {
  try {
    // Fetch all PageLists
    const pageLists = await getAllPageLists(preview);

    if (!pageLists.items.length) {
      return null;
    }

    // Check each PageList to see if the page belongs to it
    for (const pageList of pageLists.items) {
      if (!pageList.pagesCollection?.items?.length) {
        continue;
      }

      // Log all page IDs in this PageList for debugging
      const _pageIds = pageList.pagesCollection.items
        .map((item) => item?.sys?.id)
        .filter((id): id is string => Boolean(id));

      const pageInList = pageList.pagesCollection.items.some((item) => item?.sys?.id === pageId);

      if (pageInList) {
        return pageList;
      }
    }

    return null;
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error checking if page belongs to any PageList: ${_error.message}`);
    }
    throw new Error('Unknown error checking if page belongs to any PageList');
  }
}

// Note: getPageBySlugInPageList function removed to avoid circular dependency
// This function would require importing getPageBySlug from './page' which creates a circular dependency

/**
 * Fetches all page lists from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to page lists response
 */
export async function getAllPageLists(preview = false): Promise<PageListResponse> {
  try {
    // Use simplified fields to reduce query complexity
    const response = await fetchGraphQL<PageListCollectionResponse>(
      `query GetAllPageLists($preview: Boolean!) {
        pageListCollection(preview: $preview) {
          items {
            ${PAGELIST_SIMPLIFIED_FIELDS}
          }
          total
        }
      }`,
      { preview },
      preview
    );

    if (!response.data?.pageListCollection) {
      throw new ContentfulError('Failed to fetch page lists from Contentful');
    }

    return {
      items: response.data.pageListCollection.items as unknown as PageList[],
      total: response.data.pageListCollection.total
    };
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching page lists: ${_error.message}`);
    }
    throw new Error('Unknown error fetching page lists');
  }
}

/**
 * Fetches a single page list by slug
 * @param slug - The slug of the page list to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page list with header and footer or null if not found
 */
export async function getPageListBySlug(
  slug: string,
  preview = false
): Promise<PageListWithHeaderFooter | null> {
  try {
    // Generate cache configuration with proper tags
    const cacheConfig = getCacheConfig('PageList', { slug, id: undefined });
    
    // Fetch PageList with minimal pageContentCollection fields (like Page API)
    const response = await fetchGraphQL<PageListBySlugResponse>(
      `query GetPageListBySlug($slug: String!, $preview: Boolean!) {
        pageListCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            sys {
              id
            }
            title
            slug
            pagesCollection(limit: 10) {
              items {
                __typename
                ... on Page {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on ExternalPage {
                  sys {
                    id
                  }
                  title
                  link
                }
                ... on Product {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on Service {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on Solution {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on Post {
                  sys {
                    id
                  }
                  title
                  slug
                }
                ... on PageList {
                  sys {
                    id
                  }
                  title
                  slug
                }
              }
            }
            pageLayout {
              sys {
                id
              }
              header {
                sys {
                  id
                }
              }
              footer {
                sys {
                  id
                }
              }
            }
            pageContentCollection(limit: 20) {
              items {
                __typename
                ... on Entry {
                  sys {
                    id
                  }
                }
                ... on BannerHero {
                  sys {
                    id
                  }
                }
                ... on Content {
                  sys {
                    id
                  }
                }
                ... on ContentGrid {
                  sys {
                    id
                  }
                }
                ... on CtaBanner {
                  sys {
                    id
                  }
                }
                ... on ImageBetween {
                  sys {
                    id
                  }
                }
              }
            }
          }
        }
      }`,
      { slug, preview },
      preview,
      cacheConfig
    );

    if (!response.data?.pageListCollection?.items?.length) {
      return null;
    }

    const pageListData = response.data.pageListCollection.items[0]! as unknown as PageListWithRefs;
    const pageLayout = (pageListData as unknown as { pageLayout?: PageLayoutType }).pageLayout;

    // Fetch header and footer in parallel
    const [header, footer] = await Promise.all([
      pageLayout?.header?.sys?.id ? getHeaderById(pageLayout.header.sys.id, preview) : null,
      pageLayout?.footer?.sys?.id ? getFooterById(pageLayout.footer.sys.id, preview) : null
    ]);

    // Server-side enrichment for pageContentCollection (same as Page API)
    let pageContent: any = null;
    try {
      const rawPageContent = (pageListData as any).pageContentCollection;
      if (rawPageContent?.items?.length) {
        pageContent = rawPageContent;
      }
    } catch {
      pageContent = null;
    }

    // Post-process to enrich components (SAME AS PAGE API)
    if (pageContent?.items) {
      const enrichmentPromises = pageContent.items.map(async (item: any) => {
        if (!item.sys?.id || !item.__typename) {
          return item;
        }
        
        try {
          switch (item.__typename) {
            case 'BannerHero': {
              const { getBannerHero } = await import('@/components/BannerHero/BannerHeroApi');
              const enrichedItem = await getBannerHero(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Content': {
              const { getContentById } = await import('@/components/Content/ContentApi');
              const enrichedItem = await getContentById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Accordion': {
              const { getAccordionById } = await import('@/components/Accordion/AccordionApi');
              const enrichedItem = await getAccordionById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Product': {
              const { getProductById } = await import('@/components/Product/ProductApi');
              const enrichedItem = await getProductById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Solution': {
              const { getSolutionById } = await import('@/components/Solution/SolutionApi');
              const enrichedItem = await getSolutionById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Service': {
              const { getServiceById } = await import('@/components/Service/ServiceApi');
              const enrichedItem = await getServiceById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            default:
              return item;
          }
        } catch (_error) {
          return item;
        }
      });
      
      const enrichedItems = await Promise.all(enrichmentPromises);
      pageContent = { items: enrichedItems };
    }

    const result: PageListWithHeaderFooter = {
      ...(pageListData as unknown as PageList),
      header,
      footer,
      pageContentCollection: pageContent
    } as PageListWithHeaderFooter;

    return result;
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching page list by slug: ${_error.message}`);
    }
    throw new Error('Unknown error fetching page list by slug');
  }
}

/**
 * Fetches a single page list by ID
 * @param id - The ID of the page list to fetch
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to the page list with header and footer or null if not found
 */
export async function getPageListById(
  id: string,
  preview = false
): Promise<PageListWithHeaderFooter | null> {
  try {
    // Fetch PageList with minimal pageContentCollection fields (like Page API)
    const response = await fetchGraphQL<PageListWithRefs>(
      `query GetPageListById($id: String!, $preview: Boolean!) {
        pageListCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${PAGELIST_WITH_REFS_FIELDS}
            pageContentCollection(limit: 20) {
              items {
                __typename
                ... on Entry {
                  sys {
                    id
                  }
                }
                ... on BannerHero {
                  sys {
                    id
                  }
                }
                ... on Content {
                  sys {
                    id
                  }
                }
                ... on ContentGrid {
                  sys {
                    id
                  }
                }
                ... on CtaBanner {
                  sys {
                    id
                  }
                }
                ... on ImageBetween {
                  sys {
                    id
                  }
                }
              }
            }
          }
        }
      }`,
      { id, preview },
      preview
    );

    if (!response.data?.pageListCollection?.items?.length) {
      return null;
    }

    const pageListData = response.data.pageListCollection.items[0]!;
    const pageLayout = pageListData.pageLayout as PageLayoutType | undefined;

    // Fetch header and footer in parallel
    const [header, footer] = await Promise.all([
      pageLayout?.header?.sys?.id ? getHeaderById(pageLayout.header.sys.id, preview) : null,
      pageLayout?.footer?.sys?.id ? getFooterById(pageLayout.footer.sys.id, preview) : null
    ]);

    // Server-side enrichment for pageContentCollection (same as Page API)
    let pageContent: any = null;
    try {
      const rawPageContent = (pageListData as any).pageContentCollection;
      if (rawPageContent?.items?.length) {
        pageContent = rawPageContent;
      }
    } catch {
      pageContent = null;
    }

    // Post-process to enrich components (SAME AS PAGE API)
    if (pageContent?.items) {
      const enrichmentPromises = pageContent.items.map(async (item: any) => {
        if (!item.sys?.id || !item.__typename) {
          return item;
        }
        
        try {
          switch (item.__typename) {
            case 'BannerHero': {
              const { getBannerHero } = await import('@/components/BannerHero/BannerHeroApi');
              const enrichedItem = await getBannerHero(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Content': {
              const { getContentById } = await import('@/components/Content/ContentApi');
              const enrichedItem = await getContentById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'ContentGrid': {
              const { getContentGridById } = await import('@/components/ContentGrid/ContentGridApi');
              const enrichedItem = await getContentGridById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'CtaBanner': {
              const { getCtaBannerById } = await import('@/components/CtaBanner/CtaBannerApi');
              const enrichedItem = await getCtaBannerById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'ImageBetween': {
              const { getImageBetweenById } = await import('@/components/ImageBetween/ImageBetweenApi');
              const enrichedItem = await getImageBetweenById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Slider': {
              const { getSliderById } = await import('@/components/Slider/SliderApi');
              const enrichedItem = await getSliderById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'CtaGrid': {
              const { getCtaGridById } = await import('@/components/CtaGrid/CtaGridApi');
              const enrichedResult = await getCtaGridById(item.sys.id, preview);
              const enrichedItem = enrichedResult?.item;
              return enrichedItem || item;
            }
            
            case 'Profile': {
              const { getProfileById } = await import('@/components/Profile/ProfileApi');
              const enrichedItem = await getProfileById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Accordion': {
              const { getAccordionById } = await import('@/components/Accordion/AccordionApi');
              const enrichedItem = await getAccordionById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Product': {
              const { getProductById } = await import('@/components/Product/ProductApi');
              const enrichedItem = await getProductById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Solution': {
              const { getSolutionById } = await import('@/components/Solution/SolutionApi');
              const enrichedItem = await getSolutionById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            case 'Service': {
              const { getServiceById } = await import('@/components/Service/ServiceApi');
              const enrichedItem = await getServiceById(item.sys.id, preview);
              return enrichedItem || item;
            }
            
            default:
              return item;
          }
        } catch (_error) {
          return item;
        }
      });
      
      const enrichedItems = await Promise.all(enrichmentPromises);
      pageContent = { items: enrichedItems };
    }

    const result: PageListWithHeaderFooter = {
      ...(pageListData as unknown as PageList),
      header,
      footer,
      pageContentCollection: pageContent
    } as PageListWithHeaderFooter;

    return result;
  } catch (_error) {
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching page list by ID: ${_error.message}`);
    }
    throw new Error('Unknown error fetching page list by ID');
  }
}
