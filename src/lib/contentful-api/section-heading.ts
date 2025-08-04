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
