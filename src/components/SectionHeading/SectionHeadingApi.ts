import { INTERNAL_LINK_FIELDS, SYS_FIELDS } from '../../lib/contentful-api/graphql-fields';
import { fetchGraphQL } from '../../lib/api';
import type { SectionHeadingSchema } from '@/types/contentful';
import { ContentfulError, NetworkError } from '../../lib/errors';

// SectionHeading fields
export const SECTION_HEADING_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
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
    }
  }
`;

export const getSectionHeadingById = async (id: string, preview: boolean) => {
  try {
    const response = await fetchGraphQL<SectionHeadingSchema>(
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
  } catch (error) {
    if (error instanceof ContentfulError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new NetworkError(`Error fetching section heading: ${error.message}`);
    }
    throw new Error('Unknown error fetching section heading');
  }
};
