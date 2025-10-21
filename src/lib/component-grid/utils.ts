import type { Accordion as AccordionType } from '@/components/Accordion/AccordionSchema';
import type { Collection as CollectionType } from '@/components/Collection/CollectionSchema';
import type { ContactCard as ContactCardType } from '@/components/ContactCard/ContactCardSchema';
import type { ContentGridItem as ContentGridItemType } from '@/components/ContentGrid/ContentGridItemSchema';
import type { CtaGrid as CtaGridType } from '@/components/CtaGrid/CtaGridSchema';
import type { Event as EventType } from '@/components/Event/EventSchema';
import type { Image as AirImageType } from '@/components/Image/ImageSchema';
import type { OfficeLocation as OfficeLocationType } from '@/components/OfficeLocation/OfficeLocationSchema';
import type { PageList as PageListType } from '@/components/PageList/PageListSchema';
import type { Post as PostType } from '@/components/Post/PostSchema';
import type { Product as ProductType } from '@/components/Product/ProductSchema';
import type { Slider as SliderType } from '@/components/Slider/SliderSchema';
import type { Solution as SolutionType } from '@/components/Solution/SolutionSchema';
import type { Testimonials as TestimonialsType } from '@/components/Testimonials/TestimonialsSchema';
import type { Video as VideoType } from '@/components/Video/VideoSchema';

export type ContentGridItemUnion =
  | AccordionType
  | AirImageType
  | CollectionType
  | ContactCardType
  | ContentGridItemType
  | CtaGridType
  | EventType
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

  isEvent: (item: ContentGridItemUnion): item is EventType => item?.__typename === 'Event',

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
    items.length > 0 && items.every(contentTypeDetectors.isAccordion),

  allItemsAreSolutions: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 && items.every(contentTypeDetectors.isSolution),

  allItemsAreEvents: (items: ContentGridItemUnion[]): boolean =>
    items.length > 0 && items.every(contentTypeDetectors.isEvent),

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

  hasServiceCards: (items: ContentGridItemUnion[]): boolean => {
    const hasDirectServices = items.some(contentTypeDetectors.isService);
    const hasPrimaryHoverSlideUp = items.some(item => 
      contentTypeDetectors.isContentGridItem(item) && 
      item.variant === 'PrimaryHoverSlideUp'
    );
    
    const result = hasDirectServices || hasPrimaryHoverSlideUp;
    
    return result;
  },

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
    allItemsAreEvents: collectionAnalyzers.allItemsAreEvents(items),
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
    md: analysis.hasVideos
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
        : analysis.allItemsAreExpandingHoverCards
          ? 2
          : analysis.hasCtaGrids
            ? 2
            : analysis.hasAccordions
              ? 2
              : analysis.hasCollections
                ? 2
                : analysis.hasImages
                  ? 1
                  : analysis.hasAccordions
                    ? 1
                    : 3
  };

  const gap = analysis.allItemsArePosts
    ? 12
    : analysis.allItemsAreExpandingHoverCards
      ? { base: 5, xl: 4 }
      : analysis.allItemsAreServices
        ? 5
        : 8;

  const direction = analysis.allItemsAreExpandingHoverCards
    ? { base: 'col' as const, xl: 'row' as const }
    : ('col' as const);

  const _sectionGap = analysis.allItemsAreExpandingHoverCards
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

  if (variant === 'HoverCardCustom') {
    return {
      analysis,
      cols: { base: 1, md: 2, lg: 3 },
      gap: 12,
      direction: { base: 'col' as const, xl: 'row' as const },
      variant: 'HoverCardCustom'
    };
  }

  if (variant === 'TwoColumn') {
    return {
      analysis,
      cols: { base: 1, lg: 2 }, // 2 columns for TwoColumns grid
      gap: 12,
      direction: 'col' as const,
      variant: 'TwoColumn'
    };
  }

  if (variant === 'FourColumn') {
    return {
      analysis,
      cols: { base: 1, md: 2, lg: 4 }, // 4 columns for FourColumns grid
      gap: 12,
      direction: 'col' as const,
      variant: 'FourColumn'
    };
  }

  if (variant === 'FullWidth') {
    return {
      analysis,
      cols: 1, // 1 column for FullWidth grid
      gap: 12,
      direction: 'col' as const,
      variant: 'FullWidth'
    };
  }

  if (variant === 'OffsetStart' || variant === 'OffsetEnd') {
    return {
      analysis,
      cols: { base: 1, md: 2, lg: 3 }, // 3 columns for offset grid
      gap: 12,
      direction: 'col' as const,
      variant: variant
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
