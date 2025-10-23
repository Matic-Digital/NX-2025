import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';

export const NEWSLETTER_SIGNUP_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  description
  formId
  __typename
`;
