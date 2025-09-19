import React from 'react';
import Link from 'next/link';
import { Box } from '@/components/global/matic-ds';
import { ContentGridItem } from './ContentGridItem';
import { Accordion } from '@/components/Accordion/Accordion';
import { AirImage } from '@/components/media/AirImage';
import { MuxVideoPlayer } from '@/components/media/MuxVideo';
import { ProductCard } from '@/components/global/ProductCard';
import { ServiceCard } from '@/components/global/ServiceCard';
import { SolutionCard } from '../SolutionCard';
import { PostCard } from '@/components/Post/PostCard';
import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { Slider } from '@/components/Slider/Slider';
import { Testimonials } from '@/components/Testimonials/Testimonials';
import Collection from '@/components/Collection/Collection';
import { Location } from '@/components/OfficeLocation';
import { ContactCard } from '@/components/ContactCard/ContactCard';

import type {
  Accordion as AccordionType,
  AirImage as AirImageType,
  ContactCard as ContactCardType,
  Collection as CollectionType,
  ContentGridItem as ContentGridItemType,
  CtaGrid as CtaGridType,
  OfficeLocation as LocationType,
  PageList as PageListType,
  PageListPages as PageListPagesType,
  Post as PostType,
  Product as ProductType,
  Slider as SliderType,
  Solution as SolutionType,
  Testimonials as TestimonialsType,
  Video as VideoType
} from '@/types/contentful';

import { contentTypeDetectors, type ContentGridItemUnion } from '../../lib/component-grid/utils';

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
    />
  ),

  renderCtaGrid: (item: CtaGridType, context: RenderContext) => (
    <CtaGrid key={item.sys?.id ?? context.index} {...item} />
  ),

  renderImage: (item: AirImageType, context: RenderContext) => (
    <AirImage key={item.sys?.id ?? context.index} {...item} />
  ),

  renderLocation: (item: LocationType, context: RenderContext) => (
    <Location key={item.sys?.id ?? context.index} {...item} {...context} />
  ),

  renderPost: (item: PostType, context: RenderContext) => {
    // spread in context to use the variant prop in PostCard
    return <PostCard key={item.sys?.id ?? context.index} {...item} {...context} />;
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
        isFirst={isFirstService}
        serviceId={item.sys?.id ?? `service-${context.index}`}
      />
    );
  },

  renderSlider: (item: SliderType, context: RenderContext) => (
    <Slider key={item.sys?.id ?? context.index} {...item} />
  ),

  renderSolution: (item: SolutionType, context: RenderContext) => {
    // If we only have sys.id (lazy loading case), use solutionId prop
    if (item.sys?.id && !item.title && !item.heading) {
      return (
        <SolutionCard key={`lazy-${item.sys.id}`} solutionId={item.sys.id} index={context.index} />
      );
    }
    // If we have full data, render normally
    return (
      <SolutionCard key={`full-${item.sys?.id ?? context.index}`} {...item} index={context.index} />
    );
  },

  renderTestimonials: (item: TestimonialsType, context: RenderContext) => {
    // If we only have sys.id (lazy loading case), pass testimonialsId to unified component
    if (item.sys?.id && !item.itemsCollection) {
      return <Testimonials key={`lazy-${item.sys.id}`} testimonialsId={item.sys.id} />;
    }
    // If we have full data, render normally
    return <Testimonials key={`full-${item.sys?.id ?? context.index}`} {...item} />;
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
