import { fetchGraphQL } from '@/lib/api';
import { ASSET_FIELDS, SYS_FIELDS } from '@/lib/contentful-api/graphql-fields';
import { ContentfulError, NetworkError } from '@/lib/errors';

import { IMAGE_GRAPHQL_FIELDS } from '@/components/Image/ImageApi';
import { VIDEO_MINIMAL_FIELDS } from '@/components/Video/VideoApi';

import type { ImageBetween } from '@/components/ImageBetween/ImageBetweenSchema';

// ImageBetween fields
export const IMAGEBETWEEN_GRAPHQL_FIELDS = `
  ${SYS_FIELDS}
  title
  contentTop {
    ... on ContentGrid {
      ${SYS_FIELDS}
    }
    ... on BannerHero {
      ${SYS_FIELDS}
    }
  }
  asset {
    __typename
    ... on Image {
      ${IMAGE_GRAPHQL_FIELDS}
    }
    ... on Video {
      ${VIDEO_MINIMAL_FIELDS}
    }
    ... on Slider {
      ${SYS_FIELDS}
    }
    ... on ContentGrid {
      ${SYS_FIELDS}
    }
  }
  backgroundMedia {
    ${ASSET_FIELDS}
  }
  contentBottom {
    ${SYS_FIELDS}
  }
`;

export async function getImageBetweenById(
  id: string,
  preview = false
): Promise<ImageBetween | null> {
  try {
    const response = await fetchGraphQL(
      `query GetImageBetweenById($id: String!, $preview: Boolean!) {
        imageBetweenCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
          items {
            ${IMAGEBETWEEN_GRAPHQL_FIELDS}
          }
        }
      }`,
      { id, preview },
      preview
    );

    // Use type assertion to bypass the strict typing issue
     
    const data = response.data as any;
     
    if (!data?.imageBetweenCollection?.items?.length) {
      return null;
    }

     
    return data.imageBetweenCollection.items[0] as ImageBetween;
  } catch (_error) {
    if (_error instanceof ContentfulError) {
      throw _error;
    }
    if (_error instanceof Error) {
      throw new NetworkError(`Error fetching ImageBetween by ID: ${_error.message}`);
    }
    throw new Error('Unknown error fetching ImageBetween by ID');
  }
}
