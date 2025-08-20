import React from 'react';
import Link from 'next/link';
import { Box } from '@/components/global/matic-ds';
import { ContentGridItem } from '../ContentGridItem';
import { AirImage } from '@/components/media/AirImage';
import { MuxVideoPlayer } from '@/components/media/MuxVideo';
import { ProductCard } from '@/components/global/ProductCard';
import { ServiceCard } from '@/components/global/ServiceCard';
import { SolutionCard } from '@/components/SolutionCard';
import { PostCard } from '@/components/global/PostCard';
import { CtaGrid } from '@/components/CtaGrid';
import { Slider } from '@/components/Slider';

import type {
  ContentGridItem as ContentGridItemType,
  Post as PostType,
  Video as VideoType,
  Product as ProductType,
  Solution as SolutionType,
  AirImage as AirImageType,
  Slider as SliderType,
  CtaGrid as CtaGridType,
  PageList as PageListType,
  PageListPages as PageListPagesType
} from '@/types/contentful';

import { contentTypeDetectors, type ContentGridItemUnion } from '../../lib/component-grid/utils';

interface RenderContext {
  index: number;
  validItems: ContentGridItemUnion[];
  parentPageListSlug?: string;
  currentPath?: string;
}

export const contentRenderers = {
  renderContentGridItem: (item: ContentGridItemType, context: RenderContext) => (
    <ContentGridItem key={item.sys?.id ?? context.index} {...item} />
  ),

  renderPost: (item: PostType, context: RenderContext) => (
    <PostCard key={item.sys?.id ?? context.index} {...item} />
  ),

  renderVideo: (item: VideoType, context: RenderContext) => (
    <MuxVideoPlayer key={item.sys?.id ?? context.index} {...item} />
  ),

  renderImage: (item: AirImageType, context: RenderContext) => (
    <AirImage key={item.sys?.id ?? context.index} {...item} />
  ),

  renderProduct: (item: ProductType, context: RenderContext) => (
    <ProductCard key={item.sys?.id ?? context.index} {...item} />
  ),

  renderSolution: (item: SolutionType, context: RenderContext) => (
    <SolutionCard key={item.sys?.id ?? context.index} index={context.index} {...item} />
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

  renderCtaGrid: (item: CtaGridType, context: RenderContext) => (
    <CtaGrid key={item.sys?.id ?? context.index} {...item} />
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
                        context.currentPath
                          ? `${context.currentPath}/${pageList.slug}/${nestedItem.slug}`
                          : context.parentPageListSlug
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
