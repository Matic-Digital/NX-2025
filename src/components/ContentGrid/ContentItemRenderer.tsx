import { contentTypeDetectors, type ContentGridItemUnion } from '../../lib/component-grid/utils';
import { contentRenderers } from './Renderers';

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
  },
  {
    detector: contentTypeDetectors.isTestimonials,
    renderer: contentRenderers.renderTestimonials
  },
  {
    detector: contentTypeDetectors.isCollection,
    renderer: contentRenderers.renderCollection
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
  const context = {
    index,
    validItems,
    parentPageListSlug,
    currentPath,
    variant
  };

  console.log('ContentItemRenderer processing item:', { 
    typename: item.__typename, 
    sysId: item.sys?.id,
    hasTitle: !!item.title 
  });

  // Find the appropriate renderer for this content type
  for (const { detector, renderer } of contentTypeRegistry) {
    if (detector(item)) {
      console.log(`Found renderer for ${item.__typename}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      return renderer(item as any, context);
    }
  }

  // Fallback: skip unrecognized items
  console.warn(`Unrecognized content type: ${item.__typename}`);
  return null;
};
