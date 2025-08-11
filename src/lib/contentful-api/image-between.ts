import { CONTENTGRID_GRAPHQL_FIELDS } from './content-grid';
import { IMAGE_GRAPHQL_FIELDS } from './image';
import { VIDEO_GRAPHQL_FIELDS } from './video';
import { SYS_FIELDS, ASSET_FIELDS } from './graphql-fields';

// ImageBetween fields
export const IMAGEBETWEEN_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  contentTop {
    ${CONTENTGRID_GRAPHQL_FIELDS}
  }
  asset {
    __typename
    ... on Image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
    ... on Video {
      ${VIDEO_GRAPHQL_FIELDS}
    }
    ... on Slider {
      ${SYS_FIELDS}
    }
  }
  backgroundMedia {
    ${ASSET_FIELDS}
  }
  contentBottom {
    ${CONTENTGRID_GRAPHQL_FIELDS}
  }
`;
