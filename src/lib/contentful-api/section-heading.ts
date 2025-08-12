<<<<<<< Updated upstream
import { INTERNAL_LINK_FIELDS, SYS_FIELDS } from './graphql-fields';
=======
import { SYS_FIELDS } from './constants';
>>>>>>> Stashed changes
import { fetchGraphQL } from '../api';
import type { SectionHeading } from '@/types/contentful';
import { ContentfulError, NetworkError } from '../errors';

// SectionHeading fields
export const SECTIONHEADING_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  overline
  title
  description
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
<<<<<<< Updated upstream
  try {
    const response = await fetchGraphQL<SectionHeading>(
      `query GetSectionHeadingById($preview: Boolean!, $id: String!) {
=======
    try {
        const response = await fetchGraphQL<SectionHeading>(
            `query GetSectionHeadingById($preview: Boolean!, $id: String!) {
>>>>>>> Stashed changes
                sectionHeading(id: $id, preview: $preview) {
                    ${SECTIONHEADING_GRAPHQL_FIELDS}
                }
            }`,
<<<<<<< Updated upstream
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
=======
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
}

>>>>>>> Stashed changes
