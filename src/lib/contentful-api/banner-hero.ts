import { SECTIONHEADING_GRAPHQL_FIELDS } from './section-heading';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

const IMAGE_FIELDS = `
  sys {
    id
  }
  internalName
  link
  altText
`;

// Hero fields
export const BANNERHERO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  name
  heading {
    ${SECTIONHEADING_GRAPHQL_FIELDS}
  }
  backgroundImage {
    ${IMAGE_FIELDS}
  }
`;
