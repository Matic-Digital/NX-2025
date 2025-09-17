import type {
  Accordion as AccordionType,
  AirImage as AirImageType,
  Collection as CollectionType,
  ContactCard as ContactCardType,
  ContentGridItem as ContentGridItemType,
  CtaGrid as CtaGridType,
  OfficeLocation as OfficeLocationType,
  PageList as PageListType,
  Post as PostType,
  Product as ProductType,
  Slider as SliderType,
  Solution as SolutionType,
  Testimonials as TestimonialsType,
  Video as VideoType
} from '@/types/contentful';

export type ContentGridItemUnion =
  | AccordionType
  | AirImageType
  | CollectionType
  | ContactCardType
  | ContentGridItemType
  | CtaGridType
  | OfficeLocationType
  | PageListType
  | PostType
  | ProductType
  | SliderType
  | SolutionType
  | TestimonialsType
  | VideoType;

/**
 * Content type detection utilities
 */
export const contentTypeDetectors = {
  isAccordion: (item: ContentGridItemUnion): item is AccordionType =>
    item?.__typename === 'Accordion',

  isContactCard: (item: ContentGridItemUnion): item is ContactCardType =>
    item?.__typename === 'ContactCard',

  isCollection: (item: ContentGridItemUnion): item is CollectionType =>
    item?.__typename === 'Collection',

  isContentGridItem: (item: ContentGridItemUnion): item is ContentGridItemType =>
    item?.__typename === 'ContentGridItem',

  isCtaGrid: (item: ContentGridItemUnion): item is CtaGridType => item?.__typename === 'CtaGrid',

  isImage: (item: ContentGridItemUnion): item is AirImageType => item?.__typename === 'Image',

  isLocation: (item: ContentGridItemUnion): item is OfficeLocationType =>
    item?.__typename === 'OfficeLocation',

  isPageList: (item: ContentGridItemUnion): item is PageListType => item?.__typename === 'PageList',

  isPost: (item: ContentGridItemUnion): item is PostType => item?.__typename === 'Post',

  isProduct: (item: ContentGridItemUnion): item is ProductType => item?.__typename === 'Product',

  isService: (item: ContentGridItemUnion): item is SolutionType => item?.__typename === 'Service',

  isSlider: (item: ContentGridItemUnion): item is SliderType => item?.__typename === 'Slider',

  isSolution: (item: ContentGridItemUnion): item is SolutionType => item?.__typename === 'Solution',

  isTestimonials: (item: ContentGridItemUnion): item is TestimonialsType =>
    item?.__typename === 'Testimonials',

  isVideo: (item: ContentGridItemUnion): item is VideoType => item?.__typename === 'Video'
};

/**
 * Collection type analysis utilities
 */
export const collectionAnalyzers = {
  hasAccordions: (items: ContentGridItemUnion[]): boolean =>
    items.some(contentTypeDetectors.isAccordion),

  allItemsAreAccordions: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 &&
    items.every(
      (item) =>
        contentTypeDetectors.isAccordion(item) ||
        (contentTypeDetectors.isContentGridItem(item) &&
          'link' in item &&
          item.link &&
          typeof item.link === 'object' &&
          '__typename' in item.link &&
          item.link.__typename === 'Accordion')
    ),

  allItemsAreSolutions: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 && items.every(contentTypeDetectors.isSolution),

  allItemsAreExpandingHoverCards: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 &&
    items.every(
      (item) =>
        contentTypeDetectors.isContentGridItem(item) &&
        'variant' in item &&
        item.variant === 'ExpandingHoverCard'
    ),

  allItemsArePosts: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 && items.every(contentTypeDetectors.isPost),

  allItemsAreServices: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 && items.every(contentTypeDetectors.isService),

  hasServiceCards: (items: ContentGridItemUnion[]): boolean =>
    items.some(contentTypeDetectors.isService),

  hasImages: (items: ContentGridItemUnion[]): boolean => items.some(contentTypeDetectors.isImage),

  hasVideos: (items: ContentGridItemUnion[]): boolean => items.some(contentTypeDetectors.isVideo),

  hasSliders: (items: ContentGridItemUnion[]): boolean => items.some(contentTypeDetectors.isSlider),

  hasCtaGrids: (items: ContentGridItemUnion[]): boolean =>
    items.some(contentTypeDetectors.isCtaGrid),

  hasCollections: (items: ContentGridItemUnion[]): boolean =>
    items.some(contentTypeDetectors.isCollection),

  // hasFullWidthItems: (items: ContentGridItemUnion[]): boolean =>
  hasFullWidthItems: (items: ContentGridItemUnion[]): boolean =>
    items.some((item) => 'variant' in item && item.variant === 'BackgroundImage')
};

/**
 * Calculate grid configuration based on content types and variant
 */
export const calculateGridConfig = (items: ContentGridItemUnion[], variant?: string) => {
  const analysis = {
    allItemsAreAccordions: collectionAnalyzers.allItemsAreAccordions(items),
    allItemsAreSolutions: collectionAnalyzers.allItemsAreSolutions(items),
    allItemsAreExpandingHoverCards: collectionAnalyzers.allItemsAreExpandingHoverCards(items),
    allItemsArePosts: collectionAnalyzers.allItemsArePosts(items),
    allItemsAreServices: collectionAnalyzers.allItemsAreServices(items),
    hasAccordions: collectionAnalyzers.hasAccordions(items),
    hasImages: collectionAnalyzers.hasImages(items),
    hasVideos: collectionAnalyzers.hasVideos(items),
    hasSliders: collectionAnalyzers.hasSliders(items),
    hasCtaGrids: collectionAnalyzers.hasCtaGrids(items),
    hasCollections: collectionAnalyzers.hasCollections(items),
    hasFullWidthItems: collectionAnalyzers.hasFullWidthItems(items)
  };

  const cols = {
    base: 1,
    md: analysis.allItemsAreSolutions
      ? 1
      : analysis.allItemsAreExpandingHoverCards
        ? 1
        : analysis.hasCtaGrids
          ? 1
          : analysis.hasSliders
            ? 1
            : analysis.hasAccordions
              ? 1
              : analysis.hasCollections
                ? 1
                : 2,
    lg: analysis.hasVideos
      ? 1
      : analysis.hasSliders
        ? 1
        : analysis.hasCtaGrids
          ? 1
          : analysis.hasFullWidthItems
            ? 1
            : analysis.hasCollections
              ? 1
              : analysis.allItemsArePosts
                ? items.length === 4
                  ? 4
                  : 3
                : analysis.allItemsAreSolutions
                  ? 2
                  : analysis.allItemsAreExpandingHoverCards
                    ? 3
                    : analysis.hasImages
                      ? 1
                      : analysis.hasAccordions
                        ? 1
                        : 3
  };

  const gap = analysis.allItemsArePosts
    ? 12
    : analysis.allItemsAreSolutions
      ? 8
      : analysis.allItemsAreExpandingHoverCards
        ? { base: 5, xl: 4 }
        : analysis.allItemsAreServices
          ? 5
          : 8;

  const direction = analysis.allItemsAreSolutions
    ? ('col' as const)
    : analysis.allItemsAreExpandingHoverCards
      ? { base: 'col' as const, xl: 'row' as const }
      : ('col' as const);

  const _sectionGap = analysis.allItemsAreSolutions
    ? 12
    : analysis.allItemsAreExpandingHoverCards
      ? { base: 12, xl: 2 }
      : analysis.hasCtaGrids
        ? 12
        : 12;

  // Handle specific ContentGrid variants
  if (variant === 'Default') {
    return {
      analysis,
      cols: { base: 1, md: 2, xl: 3 }, // 3 columns for Default grid
      gap: 12,
      direction: 'col' as const,
      variant: 'Default'
    };
  }

  if (variant === 'FullWidth') {
    return {
      analysis,
      cols: 1,
      gap: 12,
      direction: 'col' as const,
      variant: 'FullWidth'
    };
  }

  if (variant === 'Offset') {
    return {
      analysis,
      cols: { base: 1, md: 2, lg: 3 }, // 3 columns for offset grid
      gap: 12,
      direction: 'col' as const,
      variant: 'Offset'
    };
  }

  return {
    analysis,
    cols,
    gap,
    direction,
    variant: variant ?? 'Default'
  };
};
