import React from 'react';
import Link from 'next/link';

import { contentTypeDetectors } from '@/lib/component-grid/utils';

import { Box } from '@/components/global/matic-ds';

import { Accordion } from '@/components/Accordion/Accordion';
import { Collection } from '@/components/Collection/Collection';
import { ContactCard } from '@/components/ContactCard/ContactCard';
import { ContentGridItem } from '@/components/ContentGrid/ContentGridItem';
import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { Event } from '@/components/Event/Event';
import { AirImage } from '@/components/Image/AirImage';
import { Location } from '@/components/OfficeLocation/OfficeLocation';
import { PostCard } from '@/components/Post/PostCard';
import { ProductCard } from '@/components/Product/ProductCard';
import { ServiceCard } from '@/components/Service/ServiceCard';
import { Slider } from '@/components/Slider/Slider';
import { SolutionCard } from '@/components/Solution/SolutionCard';
import { Testimonials } from '@/components/Testimonials/Testimonials';
import { MuxVideoPlayer } from '@/components/Video/MuxVideo';

import type { Accordion as AccordionType } from '@/components/Accordion/AccordionSchema';
import type { Collection as CollectionType } from '@/components/Collection/CollectionSchema';
import type { ContactCard as ContactCardType } from '@/components/ContactCard/ContactCardSchema';
import type { ContentGridItem as ContentGridItemType } from '@/components/ContentGrid/ContentGridItemSchema';
import type { CtaGrid as CtaGridType } from '@/components/CtaGrid/CtaGridSchema';
import type { Event as EventType } from '@/components/Event/EventSchema';
import type { Image as AirImageType } from '@/components/Image/ImageSchema';
import type { OfficeLocation as LocationType } from '@/components/OfficeLocation/OfficeLocationSchema';
import type {
  PageListPages as PageListPagesType,
  PageList as PageListType
} from '@/components/PageList/PageListSchema';
import type { Post as PostType } from '@/components/Post/PostSchema';
import type { Product as ProductType } from '@/components/Product/ProductSchema';
import type { Slider as SliderType } from '@/components/Slider/SliderSchema';
import type { Solution as SolutionType } from '@/components/Solution/SolutionSchema';
import type { Testimonials as TestimonialsType } from '@/components/Testimonials/TestimonialsSchema';
import type { Video as VideoType } from '@/components/Video/VideoSchema';
import type { ContentGridItemUnion } from '@/lib/component-grid/utils';

interface RenderContext {
  index: number;
  validItems: ContentGridItemUnion[];
  parentPageListSlug?: string;
  currentPath?: string;
  variant?: string;
}

export const contentRenderers = {
  renderAccordion: (item: AccordionType, context: RenderContext) => (
    <Accordion key={item.sys?.id ?? context.index} {...item} />
  ),

  renderContactCard: (item: ContactCardType, context: RenderContext) => (
    <ContactCard
      key={item.sys?.id ?? context.index}
      {...item}
      contactCardId={item.sys?.id ?? `contact-card-${context.index}`}
    />
  ),

  renderCollection: (item: CollectionType, context: RenderContext) => {
    // Show skeleton immediately if we have sys.id but not full data
    const hasFullData = Boolean(item.title && item.contentType);
    
    if (!hasFullData && item.sys?.id) {
      // Return a Collection skeleton component
      return (
        <div key={`collection-skeleton-${item.sys.id}`} className="animate-pulse">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Collection component handles both full data and lazy loading cases
    return (
      <Collection
        key={`collection-${item.sys?.id ?? context.index}`}
        collectionData={item.title ? item : undefined}
        sys={item.sys}
        __typename={item.__typename}
      />
    );
  },

  renderContentGridItem: (item: ContentGridItemType, context: RenderContext) => (
    <ContentGridItem
      key={item.sys?.id ?? context.index}
      {...item}
      parentPageListSlug={context.parentPageListSlug}
      currentPath={context.currentPath}
      index={context.index}
    />
  ),

  renderCtaGrid: (item: CtaGridType, context: RenderContext) => (
    <CtaGrid key={item.sys?.id ?? context.index} {...item} />
  ),

  renderEvent: (item: EventType, context: RenderContext) => (
    <Event
      key={item.sys?.id ?? context.index}
      eventId={item.sys?.id ?? context.index}
      {...item}
      {...context}
    />
  ),

  renderImage: (item: AirImageType, context: RenderContext) => (
    <AirImage key={item.sys?.id ?? context.index} {...item} />
  ),

  renderLocation: (item: LocationType, context: RenderContext) => (
    <Location key={item.sys?.id ?? context.index} {...item} {...context} />
  ),

  renderPost: (item: PostType, context: RenderContext) => {
    // Safely cast variant to PostCard's expected type
    const validVariant = context.variant as 'default' | 'row' | 'featured' | undefined;
    const safeVariant = ['default', 'row', 'featured'].includes(validVariant as string) ? validVariant : 'default';
    
    return (
      <PostCard 
        key={item.sys?.id ?? context.index} 
        {...item} 
        variant={safeVariant}
      />
    );
  },

  renderProduct: (item: ProductType, context: RenderContext) => (
    <ProductCard key={item.sys?.id ?? context.index} {...item} />
  ),

  renderService: (item: ContentGridItemUnion, context: RenderContext) => {
    const serviceItems = context.validItems.filter(contentTypeDetectors.isService);
    const serviceIndex = serviceItems.findIndex(
      (serviceItem) => serviceItem.sys?.id === item.sys?.id
    );
    const isFirstService = serviceIndex === 0;

    return (
      <ServiceCard
        key={item.sys?.id ?? context.index}
        cardId={item.sys?.id ?? `service-${context.index}`}
        isFirstCard={isFirstService}
        serviceId={item.sys?.id ?? `service-${context.index}`}
      />
    );
  },

  renderSlider: (item: SliderType, context: RenderContext) => {
    console.warn('ContentGrid: Rendering Slider component:', {
      id: item.sys?.id,
      hasItemsCollection: 'itemsCollection' in item,
      itemsLength: item.itemsCollection?.items?.length || 0,
      itemTypes: item.itemsCollection?.items?.map(i => i.__typename) || [],
      sliderData: item
    });
    return <Slider key={item.sys?.id ?? context.index} {...item} />;
  },

  renderSolution: (item: SolutionType, context: RenderContext) => (
    <SolutionCard key={item.sys?.id ?? context.index} {...item} index={context.index} />
  ),

  renderTestimonials: (item: TestimonialsType, context: RenderContext) => {
    return <Testimonials key={item.sys?.id ?? context.index} {...item} />;
  },

  renderVideo: (item: VideoType, context: RenderContext) => (
    <MuxVideoPlayer key={item.sys?.id ?? context.index} {...item} />
  ),

  renderPageList: (item: PageListType, context: RenderContext) => {
    const pageList = item;

    // Check if the PageList contains only Products
    const allItemsAreProducts = pageList.pagesCollection?.items?.every(
      (pageItem: PageListPagesType) => pageItem?.__typename === 'Product'
    );

    if (allItemsAreProducts && pageList.pagesCollection?.items?.length) {
      return (
        <Box key={item.sys?.id ?? context.index} direction="col" gap={8} className="w-full">
          <Box direction="col" gap={4} className="text-center">
            <h3 className="text-headline-md">{pageList.title}</h3>
          </Box>
          <Box
            direction="row"
            gap={6}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {pageList.pagesCollection.items.map(
              (productItem: PageListPagesType, productIndex: number) => (
                <ProductCard
                  key={productItem?.sys?.id ?? productIndex}
                  {...(productItem as ProductType)}
                />
              )
            )}
          </Box>
        </Box>
      );
    }

    // Check if PageList contains nested PageLists
    const hasNestedPageLists = pageList.pagesCollection?.items?.some(
      (pageItem: PageListPagesType) => pageItem?.__typename === 'PageList'
    );

    if (hasNestedPageLists) {
      return (
        <Box key={item.sys?.id ?? context.index} direction="col" gap={6} className="w-full">
          <Box direction="col" gap={4} className="text-center">
            <h3 className="text-headline-md">{pageList.title}</h3>
          </Box>
          <Box direction="row" gap={4} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pageList.pagesCollection?.items?.map(
              (nestedItem: PageListPagesType, nestedIndex: number) => (
                <Box
                  key={nestedItem?.sys?.id ?? nestedIndex}
                  direction="col"
                  gap={2}
                  className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <h4 className="text-lg font-semibold">{nestedItem?.title}</h4>
                  <p className="text-sm text-gray-600">
                    {nestedItem?.__typename === 'PageList' ? 'Page List' : nestedItem?.__typename}
                  </p>
                  {'slug' in nestedItem && nestedItem.slug && (
                    <Link
                      href={
                        nestedItem.__typename === 'PageList'
                          ? // For nested PageLists, construct the full path
                            context.parentPageListSlug
                            ? `/${context.parentPageListSlug}/${nestedItem.slug}`
                            : `/${pageList.slug}/${nestedItem.slug}`
                          : // For content items within PageLists, use the standard pattern
                            context.parentPageListSlug
                            ? `/${context.parentPageListSlug}/${pageList.slug}/${nestedItem.slug}`
                            : `/${pageList.slug}/${nestedItem.slug}`
                      }
                      className="text-blue-600 hover:underline"
                    >
                      View {nestedItem?.__typename}
                    </Link>
                  )}
                </Box>
              )
            )}
          </Box>
        </Box>
      );
    }

    // Fallback: render PageList title only for mixed content
    return (
      <Box key={item.sys?.id ?? context.index} direction="col" gap={4} className="text-center">
        <h3 className="text-headline-md">{pageList.title}</h3>
        <p className="text-body-sm text-gray-600">
          Mixed content PageList ({pageList.pagesCollection?.items?.length ?? 0} items)
        </p>
      </Box>
    );
  }
};
