import { SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';

import { BUTTON_GRAPHQL_FIELDS } from '@/components/Button/ButtonApi';
import { REGION_STAT_ITEM_GRAPHQL_FIELDS } from '@/components/RegionStats/RegionStatItem/RegionStatItemApi';

export const REGION_STATS_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  image {
    ${SYS_FIELDS}
    __typename
    ... on Asset {
      url
      width
      height
    }
  }
  itemsCollection {
    items {
      ${REGION_STAT_ITEM_GRAPHQL_FIELDS}
    }
  }
  cta {
    ${BUTTON_GRAPHQL_FIELDS}
  }
  __typename
`;
