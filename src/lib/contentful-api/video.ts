const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

// Video fields
export const VIDEO_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  playbackId
  id
  title
`;
