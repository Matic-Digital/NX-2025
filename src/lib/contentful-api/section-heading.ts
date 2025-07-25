import { fetchGraphQL } from '../api';

import type { SectionHeading, SectionHeadingResponse } from '@/types/contentful';

import { ContentfulError, NetworkError } from '../errors';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// SectionHeading fields
export const SECTIONHEADING_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  overline
  title
  description
  ctaCollection(limit: 2) {
    items {
      sys {
        id
      }
      internalText
      text
      internalLink {
        sys {
          id
        }
        slug
      }
      externalLink
      modal {
        sys {
          id
        }
        title
        description
      }
    }
  }
`;

/**
 * Fetches all SectionHeadings from Contentful
 * @param preview - Whether to fetch draft content
 * @returns Promise resolving to SectionHeadings response with pagination info
 */
export async function getAllSectionHeadings(preview = false): Promise<SectionHeadingResponse> {
  try {
    const response = await fetchGraphQL<SectionHeading>(
      `query GetAllSectionHeadings($preview: Boolean!) {
        sectionHeadingCollection(preview: $preview) {
          items {
            ${SECTIONHEADING_GRAPHQL_FIELDS}
          }
        }
      }`,
      { preview },
      preview
    );

    // Check for valid response
    if (!response?.data) {
      throw new ContentfulError('Invalid response from Contentful');
    }

    // Access data using type assertion to help TypeScript understand the structure
    const data = response.data as unknown as {
      sectionHeadingCollection?: { items?: SectionHeading[] };
    };

    // Validate the data structure
    if (!data.sectionHeadingCollection?.items?.length) {
      throw new ContentfulError('Failed to fetch SectionHeadings from Contentful');
    }

    return {
      items: data.sectionHeadingCollection.items
    };
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching SectionHeadings: ${error.message}`);
    }
    throw new Error('Unknown error fetching SectionHeadings');
  }
}
