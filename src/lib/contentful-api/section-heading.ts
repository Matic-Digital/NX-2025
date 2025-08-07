import { SYS_FIELDS } from './constants';

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
