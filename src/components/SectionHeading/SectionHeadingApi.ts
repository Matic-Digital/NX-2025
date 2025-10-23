import { fetchGraphQL } from '@/lib/api';
import {
  ASSET_FIELDS,
  INTERNAL_LINK_FIELDS,
  SYS_FIELDS
} from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import type { SectionHeading } from '@/components/SectionHeading/SectionHeadingSchema';

// SectionHeading fields
export const SECTION_HEADING_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  icon {
    ${ASSET_FIELDS}
  }
  overline
  title
  description
  variant
  ctaCollection(limit: 2) {
    items {
      sys { id }
      internalText
      text
      internalLink {
        ${INTERNAL_LINK_FIELDS}
      }
      externalLink
      modal {
        sys { id }
        title
        description
      }
      icon
    }
  }
`;

export const getSectionHeadingById = async (
  id: string,
  preview: boolean
): Promise<SectionHeading | null> => {
  try {
    const response = await fetchGraphQL<SectionHeading>(
      `query GetSectionHeadingById($preview: Boolean!, $id: String!) {
                sectionHeading(id: $id, preview: $preview) {
                    ${SECTION_HEADING_GRAPHQL_FIELDS}
                }
            }`,
      { id, preview },
      preview
    );

    if (!response.data?.sectionHeading) {
      throw new ContentfulError('Failed to fetch section heading from Contentful');
    }

    return response.data.sectionHeading;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching section heading: ${_error.message}`);
    }
    throw new Error('Unknown error fetching section heading');
  }
};
