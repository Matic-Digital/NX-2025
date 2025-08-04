import { IMAGE_GRAPHQL_FIELDS } from './image';

const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Solution fields
export const SOLUTION_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  slug
  cardHeading
  cardSubheading
  cardTitle
  cardDescription
  cardBackgroundImage {
    ${IMAGE_GRAPHQL_FIELDS}
  }
`;
