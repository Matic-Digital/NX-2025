import type {
  Accordion as AccordionType,
  ContentGridItem as ContentGridItemType,
  Post as PostType,
  Video as VideoType,
  Product as ProductType,
  Solution as SolutionType,
  AirImage as AirImageType,
  Slider as SliderType,
  CtaGrid as CtaGridType,
  PageList as PageListType,
  Testimonials as TestimonialsType
} from '@/types/contentful';

export type ContentGridItemUnion =
  | AccordionType
  | ContentGridItemType
  | PostType
  | VideoType
  | ProductType
  | SolutionType
  | AirImageType
  | SliderType
  | CtaGridType
  | PageListType
  | TestimonialsType;

/**
 * Content type detection utilities
 */
export const contentTypeDetectors = {
  isAccordion: (item: ContentGridItemUnion): item is AccordionType =>
    item.__typename === 'Accordion',

  isContentGridItem: (item: ContentGridItemUnion): item is ContentGridItemType =>
    item.__typename === 'ContentGridItem',

  isPost: (item: ContentGridItemUnion): item is PostType => item.__typename === 'Post',

  isVideo: (item: ContentGridItemUnion): item is VideoType => item.__typename === 'Video',

  isImage: (item: ContentGridItemUnion): item is AirImageType => item.__typename === 'Image',

  isProduct: (item: ContentGridItemUnion): item is ProductType => item.__typename === 'Product',

  isSolution: (item: ContentGridItemUnion): item is SolutionType => item.__typename === 'Solution',

  isService: (item: ContentGridItemUnion): item is SolutionType => item.__typename === 'Service',

  isSlider: (item: ContentGridItemUnion): item is SliderType => item.__typename === 'Slider',

  isCtaGrid: (item: ContentGridItemUnion): item is CtaGridType => item.__typename === 'CtaGrid',

  isPageList: (item: ContentGridItemUnion): item is PageListType => item.__typename === 'PageList',

  isTestimonials: (item: ContentGridItemUnion): item is TestimonialsType =>
    item.__typename === 'Testimonials'
};

/**
 * Collection type analysis utilities
 */
export const collectionAnalyzers = {
  hasAccordions: (items: ContentGridItemUnion[]): boolean =>
    items.some(contentTypeDetectors.isAccordion),

  allItemsAreSolutions: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 && items.every(contentTypeDetectors.isSolution),

  allItemsArePosts: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 && items.every(contentTypeDetectors.isPost),

  hasServiceCards: (items: ContentGridItemUnion[]): boolean =>
    items.some(contentTypeDetectors.isService),

  hasImages: (items: ContentGridItemUnion[]): boolean => items.some(contentTypeDetectors.isImage),

  hasVideos: (items: ContentGridItemUnion[]): boolean => items.some(contentTypeDetectors.isVideo),

  hasSliders: (items: ContentGridItemUnion[]): boolean => items.some(contentTypeDetectors.isSlider),

  hasCtaGrids: (items: ContentGridItemUnion[]): boolean =>
    items.some(contentTypeDetectors.isCtaGrid),

  // hasFullWidthItems: (items: ContentGridItemUnion[]): boolean =>
  //   items.some((item) => 'image' in item && item.image)

  hasFullWidthItems: (items: ContentGridItemUnion[]): boolean =>
    items.some((item) => 'variant' in item && item.variant === 'BackgroundImage')
};

/**
 * Grid configuration calculator
 */
export const calculateGridConfig = (items: ContentGridItemUnion[]) => {
  const analysis = {
    allItemsAreSolutions: collectionAnalyzers.allItemsAreSolutions(items),
    allItemsArePosts: collectionAnalyzers.allItemsArePosts(items),
    hasAccordions: collectionAnalyzers.hasAccordions(items),
    hasImages: collectionAnalyzers.hasImages(items),
    hasVideos: collectionAnalyzers.hasVideos(items),
    hasSliders: collectionAnalyzers.hasSliders(items),
    hasCtaGrids: collectionAnalyzers.hasCtaGrids(items),
    hasFullWidthItems: collectionAnalyzers.hasFullWidthItems(items)
  };

  const cols = {
    base: 1,
    md: analysis.allItemsAreSolutions
      ? 1
      : analysis.hasCtaGrids
        ? 1
        : analysis.hasAccordions
          ? 1
          : 2,
    lg: analysis.hasVideos
      ? 1
      : analysis.hasAccordions
        ? 1
        : analysis.hasSliders
          ? 1
          : analysis.hasCtaGrids
            ? 1
            : analysis.hasFullWidthItems
              ? 1
              : analysis.allItemsArePosts
                ? 4
                : analysis.allItemsAreSolutions
                  ? 3
                  : analysis.hasImages
                    ? 1
                    : 3
  };

  const gap = analysis.allItemsArePosts
    ? 5
    : analysis.allItemsAreSolutions
      ? { base: 5, xl: 4 }
      : 12;

  const direction = analysis.allItemsAreSolutions
    ? { base: 'col' as const, xl: 'row' as const }
    : ('col' as const);

  const sectionGap = analysis.allItemsAreSolutions
    ? { base: 12, xl: 2 }
    : analysis.hasCtaGrids
      ? 12
      : 12;

  // Special case for 4-item asymmetric layout
  if (
    items.length === 4 &&
    !analysis.hasAccordions &&
    !analysis.allItemsArePosts &&
    !analysis.hasSliders &&
    !analysis.hasVideos
  ) {
    return {
      analysis,
      cols: { base: 1, md: 2, lg: 2 }, // This will be overridden by custom grid
      gap: 12,
      direction: 'col' as const,
      sectionGap: 12,
      useCustomLayout: true, // Flag to indicate custom layout
      layoutType: 'fourItemAsymmetric'
    };
  }

  return {
    analysis,
    cols,
    gap,
    direction,
    sectionGap
  };
};
