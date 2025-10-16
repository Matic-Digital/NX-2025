/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { fetchGraphQL } from '@/lib/api';
import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { RichContent, RichContentResponse } from '@/components/RichContent/RichContentSchema';

export const RICHCONTENTS_PER_PAGE = 10;

export const RICHCONTENT_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  tableOfContents
  content {
    json
  }
  variant
  legalContent {
    json
  }
`;

/**
 * Fetches all rich content items from Contentful
 * @param preview - Whether to fetch draft content
 * @param limit - Maximum number of rich content items to fetch
 * @param skip - Number of rich content items to skip for pagination
 * @returns Promise resolving to rich content response with pagination info
 */
export async function getAllRichContents(
  preview = false,
  limit = RICHCONTENTS_PER_PAGE,
  skip = 0
): Promise<RichContentResponse> {
  const response = await fetchGraphQL(
    `query GetAllRichContents($preview: Boolean!, $limit: Int!, $skip: Int!) {
      contentTypeRichTextCollection(preview: $preview, limit: $limit, skip: $skip) {
        total
        items {
          ${RICHCONTENT_GRAPHQL_FIELDS}
        }
      }
    }`,
    { preview, limit, skip },
    preview
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedResponse = response as any;

  if (!typedResponse.contentTypeRichTextCollection) {
    return { items: [], total: 0 };
  }

  return {
    items: typedResponse.contentTypeRichTextCollection.items ?? [],
    total: typedResponse.contentTypeRichTextCollection.total ?? 0
  };
}

/**
 * Fetches a single rich content item by ID
 * @param id - The Contentful entry ID
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to rich content item or null if not found
 */
export const getRichContentById = async (
  id: string,
  preview: boolean
): Promise<RichContent | null> => {
  try {
    const response = await fetchGraphQL<RichContent>(
      `query GetRichContentById($preview: Boolean!, $id: String!) {
        contentTypeRichText(id: $id, preview: $preview) {
          ${RICHCONTENT_GRAPHQL_FIELDS}
        }
      }`,
      { id, preview },
      preview
    );

    const data = response.data as unknown as {
      contentTypeRichText?: RichContent;
    };

    if (!data?.contentTypeRichText) {
      throw new ContentfulError('Failed to fetch rich content from Contentful');
    }

    return data.contentTypeRichText;
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching rich content: ${error.message}`);
    }
    throw new Error('Unknown error fetching rich content');
  }
};

/**
 * Fetches rich content items by a list of IDs
 * @param ids - Array of Contentful entry IDs
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to array of rich content items
 */
export async function getRichContentsByIds(ids: string[], preview = false): Promise<RichContent[]> {
  if (ids.length === 0) {
    return [];
  }

  const response = await fetchGraphQL(
    `query GetRichContentsByIds($ids: [String!]!, $preview: Boolean!) {
      contentTypeRichTextCollection(where: { sys: { id_in: $ids } }, preview: $preview) {
        items {
          ${RICHCONTENT_GRAPHQL_FIELDS}
        }
      }
    }`,
    { ids, preview },
    preview
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedResponse = response as any;

  return typedResponse.contentTypeRichTextCollection?.items ?? [];
}

/**
 * Searches rich content items by title
 * @param query - Search query for title
 * @param preview - Whether to fetch draft content
 * @param limit - Maximum number of results to return
 * @returns Promise resolving to array of matching rich content items
 */
export async function searchRichContents(
  query: string,
  preview = false,
  limit = RICHCONTENTS_PER_PAGE
): Promise<RichContent[]> {
  const response = await fetchGraphQL(
    `query SearchRichContents($query: String!, $preview: Boolean!, $limit: Int!) {
      contentTypeRichTextCollection(
        where: {
          OR: [
            { title_contains: $query }
            { content_contains: $query }
          ]
        }
        preview: $preview
        limit: $limit
      ) {
        items {
          ${RICHCONTENT_GRAPHQL_FIELDS}
        }
      }
    }`,
    { query, preview, limit },
    preview
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedResponse = response as any;

  return typedResponse.contentTypeRichTextCollection?.items ?? [];
}

/**
 * Gets the total count of rich content items
 * @param preview - Whether to count draft content
 * @returns Promise resolving to total count
 */
export async function getRichContentsCount(preview = false): Promise<number> {
  const response = await fetchGraphQL(
    `query GetRichContentsCount($preview: Boolean!) {
      contentTypeRichTextCollection(preview: $preview, limit: 0) {
        total
      }
    }`,
    { preview },
    preview
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedResponse = response as any;

  return typedResponse.contentTypeRichTextCollection?.total ?? 0;
}

/**
 * Fetches rich content items with pagination info
 * @param page - Page number (1-based)
 * @param preview - Whether to fetch draft content
 * @param limit - Items per page
 * @returns Promise resolving to rich content response with pagination
 */
export async function getRichContentsPaginated(
  page = 1,
  preview = false,
  limit = RICHCONTENTS_PER_PAGE
): Promise<RichContentResponse & { page: number; totalPages: number }> {
  const skip = (page - 1) * limit;
  const response = await getAllRichContents(preview, limit, skip);

  return {
    ...response,
    page,
    totalPages: Math.ceil(response.total / limit)
  };
}
