import type {
  ContentGridItem as ContentGridItemType,
  Post as PostType,
  Video as VideoType,
  Product as ProductType,
  Solution as SolutionType,
  AirImage as AirImageType,
  Slider as SliderType,
  CtaGrid as CtaGridType,
  PageList as PageListType
} from '@/types/contentful';

export type ContentGridItemUnion =
  | ContentGridItemType
  | PostType
  | VideoType
  | ProductType
  | SolutionType
  | AirImageType
  | SliderType
  | CtaGridType
  | PageListType;

/**
 * Content type detection utilities
 */
export const contentTypeDetectors = {
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

  isPageList: (item: ContentGridItemUnion): item is PageListType => item.__typename === 'PageList'
};

/**
 * Collection type analysis utilities
 */
export const collectionAnalyzers = {
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

  hasFullWidthItems: (items: ContentGridItemUnion[]): boolean =>
    items.some((item) => 'image' in item && item.image)
};

/**
 * Grid configuration calculator
 */
export const calculateGridConfig = (items: ContentGridItemUnion[]) => {
  const analysis = {
    allItemsAreSolutions: collectionAnalyzers.allItemsAreSolutions(items),
    allItemsArePosts: collectionAnalyzers.allItemsArePosts(items),
    hasImages: collectionAnalyzers.hasImages(items),
    hasVideos: collectionAnalyzers.hasVideos(items),
    hasSliders: collectionAnalyzers.hasSliders(items),
    hasCtaGrids: collectionAnalyzers.hasCtaGrids(items),
    hasFullWidthItems: collectionAnalyzers.hasFullWidthItems(items)
  };

  // Debug logging for grid analysis
  console.log('Grid: Grid analysis:', analysis);
  console.log(
    'Grid: Items detailed analysis:',
    items.map((item, index) => ({
      index,
      typename: item.__typename,
      isContentGridItem: contentTypeDetectors.isContentGridItem(item),
      hasImage: 'image' in item,
      imageValue: 'image' in item ? item.image : 'NO IMAGE PROP',
      imageExists: 'image' in item && !!item.image,
      hasIcon: 'icon' in item,
      iconValue: 'icon' in item ? item.icon : 'NO ICON PROP',
      allKeys: Object.keys(item),
      fullItem: item
    }))
  );

  const cols = {
    base: 1,
    md: analysis.allItemsAreSolutions ? 1 : analysis.hasCtaGrids ? 1 : 2,
    lg: analysis.hasVideos
      ? 1
      : analysis.hasSliders
        ? 1
        : analysis.hasCtaGrids
          ? 1
          : analysis.allItemsArePosts
            ? 4
            : analysis.hasFullWidthItems
              ? 1
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
    : 'row';

  const sectionGap = analysis.allItemsAreSolutions
    ? { base: 12, xl: 2 }
    : analysis.hasCtaGrids
      ? 12
      : 12;

  return {
    analysis,
    cols,
    gap,
    direction,
    sectionGap
  };
};
