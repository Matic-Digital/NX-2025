/**
 * Contentful SEO API
 * 
 * Lightweight API functions for fetching SEO metadata without complex queries
 * to avoid GraphQL complexity limits during metadata generation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { fetchGraphQL } from '@/lib/api';
import { 
  getPAGE_SEO_FIELDS,
  getPAGELIST_SEO_FIELDS,
  getPRODUCT_SEO_FIELDS,
  getSERVICE_SEO_FIELDS,
  getSOLUTION_SEO_FIELDS,
  getPOST_SEO_FIELDS,
  SEO_FIELDS,
  SYS_FIELDS
} from '@/lib/contentful-api/graphql-fields';
import { NetworkError } from '@/lib/errors';

// SEO-only Event fields
export const EVENT_SEO_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  ${SEO_FIELDS}
`;

/**
 * Fetches SEO data for a Page by slug
 */
export async function getPageSEOBySlug(slug: string, preview = false): Promise<any | null> {
  try {
    const response = await fetchGraphQL(
      `query GetPageSEO($slug: String!, $preview: Boolean!) {
        pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getPAGE_SEO_FIELDS()}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    return response.data?.pageCollection?.items?.[0] ?? null;
  } catch (error) {
    console.error(`Error fetching Page SEO for slug: ${slug}`, error);
    throw new NetworkError(`Failed to fetch Page SEO: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches SEO data for a PageList by slug
 */
export async function getPageListSEOBySlug(slug: string, preview = false): Promise<any | null> {
  try {
    const response = await fetchGraphQL(
      `query GetPageListSEO($slug: String!, $preview: Boolean!) {
        pageListCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getPAGELIST_SEO_FIELDS()}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    const result = response.data?.pageListCollection?.items?.[0] ?? null;
    
    if (result) {
      console.log(`📋 [SEO API] PageList data:`, {
        title: (result as any).title,
        seoTitle: (result as any).seoTitle,
        slug: (result as any).slug,
        hasOpenGraphImage: !!(result as any).openGraphImage
      });
    } else {
    }
    
    return result;
  } catch (error) {
    console.error(`❌ [SEO API] Error fetching PageList SEO for slug: ${slug}`, error);
    throw new NetworkError(`Failed to fetch PageList SEO: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches SEO data for a Product by slug
 */
export async function getProductSEOBySlug(slug: string, preview = false): Promise<any | null> {
  try {
    const response = await fetchGraphQL<any>(
      `query GetProductSEO($slug: String!, $preview: Boolean!) {
        productCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getPRODUCT_SEO_FIELDS()}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    return (response.data as any)?.productCollection?.items?.[0] ?? null;
  } catch (error) {
    console.error(`Error fetching Product SEO for slug: ${slug}`, error);
    throw new NetworkError(`Failed to fetch Product SEO: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches SEO data for a Service by slug
 */
export async function getServiceSEOBySlug(slug: string, preview = false): Promise<any | null> {
  try {
    const response = await fetchGraphQL<any>(
      `query GetServiceSEO($slug: String!, $preview: Boolean!) {
        serviceCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getSERVICE_SEO_FIELDS()}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    return (response.data as any)?.serviceCollection?.items?.[0] || null;
  } catch (error) {
    console.error(`Error fetching Service SEO for slug: ${slug}`, error);
    throw new NetworkError(`Failed to fetch Service SEO: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches SEO data for a Solution by slug
 */
export async function getSolutionSEOBySlug(slug: string, preview = false): Promise<any | null> {
  try {
    const response = await fetchGraphQL<any>(
      `query GetSolutionSEO($slug: String!, $preview: Boolean!) {
        solutionCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getSOLUTION_SEO_FIELDS()}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    return (response.data as any)?.solutionCollection?.items?.[0] || null;
  } catch (error) {
    console.error(`Error fetching Solution SEO for slug: ${slug}`, error);
    throw new NetworkError(`Failed to fetch Solution SEO: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches SEO data for a Post by slug
 */
export async function getPostSEOBySlug(slug: string, preview = false): Promise<any | null> {
  try {
    const response = await fetchGraphQL(
      `query GetPostSEO($slug: String!, $preview: Boolean!) {
        postCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${getPOST_SEO_FIELDS()}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    return response.data?.postCollection?.items?.[0] ?? null;
  } catch (error) {
    console.error(`Error fetching Post SEO for slug: ${slug}`, error);
    throw new NetworkError(`Failed to fetch Post SEO: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches SEO data for an Event by slug
 */
export async function getEventSEOBySlug(slug: string, preview = false): Promise<any | null> {
  try {
    const response = await fetchGraphQL(
      `query GetEventSEO($slug: String!, $preview: Boolean!) {
        eventCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
          items {
            ${EVENT_SEO_FIELDS}
          }
        }
      }`,
      { slug, preview },
      preview
    );

    return response.data?.eventCollection?.items?.[0] ?? null;
  } catch (error) {
    console.error(`Error fetching Event SEO for slug: ${slug}`, error);
    throw new NetworkError(`Failed to fetch Event SEO: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generic function to fetch SEO data by content type and slug
 */
export async function getContentSEOBySlug(
  contentType: 'page' | 'pageList' | 'product' | 'service' | 'solution' | 'post' | 'event',
  slug: string,
  preview = false
): Promise<any | null> {
  switch (contentType) {
    case 'page':
      return getPageSEOBySlug(slug, preview);
    case 'pageList':
      return getPageListSEOBySlug(slug, preview);
    case 'product':
      return getProductSEOBySlug(slug, preview);
    case 'service':
      return getServiceSEOBySlug(slug, preview);
    case 'solution':
      return getSolutionSEOBySlug(slug, preview);
    case 'post':
      return getPostSEOBySlug(slug, preview);
    case 'event':
      return getEventSEOBySlug(slug, preview);
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}
