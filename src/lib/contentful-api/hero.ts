const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Hero fields
export const HERO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  name
  description
`;
