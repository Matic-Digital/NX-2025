import { INTERNAL_LINK_FIELDS, SYS_FIELDS } from './graphql-fields';

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
