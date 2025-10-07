import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';

export const REGION_STAT_ITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  heading
  subHeading
  description
  __typename
`;
