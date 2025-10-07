import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';

export const CONTENTSLIDERITEM_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  image {
    ${IMAGE_GRAPHQL_FIELDS}
  }
  title
  description
`;
