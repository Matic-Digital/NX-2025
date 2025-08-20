import { contentTypeDetectors, type ContentGridItemUnion } from '../../lib/component-grid/utils';
import { contentRenderers } from './Renderers';

interface ContentItemRendererProps {
  item: ContentGridItemUnion;
  index: number;
  validItems: ContentGridItemUnion[];
  parentPageListSlug?: string;
  currentPath?: string;
}

/**
 * Content type registry that maps content types to their renderers
 */
const contentTypeRegistry = [
  {
    detector: contentTypeDetectors.isContentGridItem,
    renderer: contentRenderers.renderContentGridItem
  },
  {
    detector: contentTypeDetectors.isPost,
    renderer: contentRenderers.renderPost
  },
  {
    detector: contentTypeDetectors.isVideo,
    renderer: contentRenderers.renderVideo
  },
  {
    detector: contentTypeDetectors.isImage,
    renderer: contentRenderers.renderImage
  },
  {
    detector: contentTypeDetectors.isProduct,
    renderer: contentRenderers.renderProduct
  },
  {
    detector: contentTypeDetectors.isSolution,
    renderer: contentRenderers.renderSolution
  },
  {
    detector: contentTypeDetectors.isService,
    renderer: contentRenderers.renderService
  },
  {
    detector: contentTypeDetectors.isSlider,
    renderer: contentRenderers.renderSlider
  },
  {
    detector: contentTypeDetectors.isCtaGrid,
    renderer: contentRenderers.renderCtaGrid
  },
  {
    detector: contentTypeDetectors.isPageList,
    renderer: contentRenderers.renderPageList
  }
];

/**
 * Renders a content item based on its type using the registry pattern
 */
export const ContentItemRenderer: React.FC<ContentItemRendererProps> = ({
  item,
  index,
  validItems,
  parentPageListSlug,
  currentPath
}) => {
  // Debug logging
  console.log(`ContentGrid item ${index}:`, {
    typename: item.__typename,
    hasSlug: 'slug' in item,
    hasContent: 'content' in item,
    hasLink: 'link' in item,
    hasDescription: 'description' in item,
    item: item
  });

  const context = {
    index,
    validItems,
    parentPageListSlug,
    currentPath
  };

  // Find the appropriate renderer for this content type
  for (const { detector, renderer } of contentTypeRegistry) {
    if (detector(item)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      return renderer(item as any, context);
    }
  }

  // Fallback: skip unrecognized items
  console.warn(`Unrecognized content type: ${item.__typename}`);
  return null;
};
