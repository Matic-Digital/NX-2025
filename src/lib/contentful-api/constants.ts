/**
 * Shared GraphQL field constants for Contentful API
 */

// Base fields for all content types
export const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Asset fields
export const ASSET_FIELDS = `
  sys {
    id
  }
  title
  description
  url
  width
  height
`;

// Social fields
export const SOCIAL_BASIC_FIELDS = `
  ${SYS_FIELDS}
  title
  link
  icon {
    ${ASSET_FIELDS}
  }
`;
