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
  title 
  link
  altText
`;

// BannerHero fields
export const BANNERHERO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  heading {
    ${SECTIONHEADING_GRAPHQL_FIELDS}
  }
  backgroundImage {
    ${IMAGE_FIELDS}
  }
`;
