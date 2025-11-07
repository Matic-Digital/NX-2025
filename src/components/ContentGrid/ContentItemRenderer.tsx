import { contentTypeDetectors } from '@/lib/component-grid/utils';

import { contentRenderers } from '@/components/ContentGrid/Renderers';

import type { ContentGridItemUnion } from '@/lib/component-grid/utils';

interface ContentItemRendererProps {
  item: ContentGridItemUnion;
  index: number;
  validItems: ContentGridItemUnion[];
  parentPageListSlug?: string;
  currentPath?: string;
  variant?: string;
}

/**
 * Content type registry that maps content types to their renderers
 */
const contentTypeRegistry = [
  {
    detector: contentTypeDetectors.isAccordion,
    renderer: contentRenderers.renderAccordion
  },
  {
    detector: contentTypeDetectors.isCollection,
    renderer: contentRenderers.renderCollection
  },
  {
    detector: contentTypeDetectors.isContactCard,
    renderer: contentRenderers.renderContactCard
  },
  {
    detector: contentTypeDetectors.isContent,
    renderer: contentRenderers.renderContent
  },
  {
    detector: contentTypeDetectors.isContentGridItem,
    renderer: contentRenderers.renderContentGridItem
  },
  {
    detector: contentTypeDetectors.isCtaGrid,
    renderer: contentRenderers.renderCtaGrid
  },
  {
    detector: contentTypeDetectors.isEvent,
    renderer: contentRenderers.renderEvent
  },
  {
    detector: contentTypeDetectors.isImage,
    renderer: contentRenderers.renderImage
  },
  {
    detector: contentTypeDetectors.isLocation,
    renderer: contentRenderers.renderLocation
  },
  {
    detector: contentTypeDetectors.isPageList,
    renderer: contentRenderers.renderPageList
  },
  {
    detector: contentTypeDetectors.isPost,
    renderer: contentRenderers.renderPost
  },
  {
    detector: contentTypeDetectors.isProduct,
    renderer: contentRenderers.renderProduct
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
    detector: contentTypeDetectors.isSolution,
    renderer: contentRenderers.renderSolution
  },
  {
    detector: contentTypeDetectors.isTestimonials,
    renderer: contentRenderers.renderTestimonials
  },
  {
    detector: contentTypeDetectors.isVideo,
    renderer: contentRenderers.renderVideo
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
  currentPath,
  variant
}) => {
  // Early return if item is null/undefined
  if (!item) {
    return null;
  }

  const context = {
    index,
    validItems,
    parentPageListSlug,
    currentPath,
    variant
  };

  // Find the appropriate renderer for this content type
  for (const { detector, renderer } of contentTypeRegistry) {
    if (detector(item)) {
       
      return renderer(item as any, context);
    }
  }

  // Fallback: skip unrecognized items
  return null;
};
