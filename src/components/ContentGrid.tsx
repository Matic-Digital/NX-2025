'use client';

import * as React from 'react';
import Link from 'next/link';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';
import { SectionHeading } from '@/components/SectionHeading';
import { ContentGridItem } from './ContentGridItem';
import { AirImage } from '@/components/media/AirImage';
import { MuxVideoPlayer } from '@/components/media/MuxVideo';
import { ProductCard } from '@/components/global/ProductCard';
import { ServiceCard } from '@/components/global/ServiceCard';
import { SolutionCard } from '@/components/SolutionCard';
import { PostCard } from '@/components/global/PostCard';
import { CtaGrid } from '@/components/CtaGrid';
import { Slider } from '@/components/Slider';
import { ServiceCardProvider } from '@/contexts/ServiceCardContext';

import type {
  ContentGrid as ContentGridType,
  ContentGridItem as ContentGridItemType,
  PageList as PageListType,
  PageListPages as PageListPagesType,
  CtaGrid as CtaGridType,
  Post as PostType,
  AirImage as AirImageType,
  Video as VideoType,
  Product as ProductType,
  Solution as SolutionType,
  Slider as SliderType
} from '@/types/contentful';

interface ContentGridProps extends ContentGridType {
  parentPageListSlug?: string; // Optional parent PageList slug for nested routing
  currentPath?: string; // Full current path for deeply nested structures
}

export function ContentGrid(props: ContentGridProps) {
  const contentGrid = useContentfulLiveUpdates(props);

  console.log('content grid props', props);
  console.log('content grid items:', contentGrid.itemsCollection?.items);

  // Filter out empty/incomplete items
  const validItems =
    contentGrid.itemsCollection?.items?.filter((item) => item && (item.title || item.__typename)) ||
    [];

  const allItemsAreSolutions =
    validItems.length > 0 && validItems.every((item) => item.__typename === 'Solution');

  // Type guard: Check if item is a CtaGrid with essential CtaGrid structure
  const isCtaGrid = validItems.some((item) => item.__typename === 'CtaGrid');

  // Check if any valid item has an image
  const isFullWidthGrid = contentGrid.itemsCollection?.items?.some(
    (item) => 'image' in item && item.image
  );

  // Check if all valid items are Posts
  const allItemsArePosts =
    validItems.length > 0 && validItems.every((item) => item.__typename === 'Post');

  // Type guard: Check if item is a Video with essential Video structure
  const isVideo = validItems.some((item) => item.__typename === 'Video');

  // Type guard: Check if item is a Slider with essential Slider structure
  const isSlider = validItems.some((item) => item.__typename === 'Slider');

  // Check if there are any service cards to wrap with provider
  const hasServiceCards = validItems.some((item) => item.__typename === 'Service');

  const direction = allItemsAreSolutions ? { base: 'col' as const, xl: 'row' as const } : 'col';
  const gap = allItemsAreSolutions ? { base: 12, xl: 2 } : isCtaGrid ? 12 : 12;

  return (
    <ErrorBoundary>
      <div data-theme={props.isDarkMode && 'dark'}>
        <Section className="relative dark:bg-black">
          <Box className="absolute top-0 left-0 h-full w-full">
            <AirImage
              link={contentGrid.backgroundImage?.link}
              altText={contentGrid.backgroundImage?.altText}
              className="h-full w-full object-cover"
            />
          </Box>
          <Container>
            <Box direction={direction} gap={gap} className="relative z-20">
              {/* section heading */}
              <SectionHeading {...contentGrid.heading} isDarkMode={props.isDarkMode} />

              {/* items */}
              {(() => {
                const cols = {
                  base: 1,
                  md: allItemsAreSolutions ? 1 : isCtaGrid ? 1 : 2,
                  lg: isVideo
                    ? 1
                    : isSlider
                      ? 1
                      : isCtaGrid
                        ? 1
                        : allItemsArePosts
                          ? 4
                          : isFullWidthGrid
                            ? 1
                            : allItemsAreSolutions
                              ? 3
                              : 3
                };
                const gap = allItemsArePosts ? 5 : allItemsAreSolutions ? { base: 5, xl: 4 } : 12;

                const gridContent = (
                  <Box cols={cols} gap={gap} wrap={true}>
                    {validItems.map((item, index) => {
                      // Debug: Log each item's structure and typename
                      console.log(`ContentGrid item ${index}:`, {
                        typename: item.__typename,
                        hasSlug: 'slug' in item,
                        hasContent: 'content' in item,
                        hasLink: 'link' in item,
                        hasDescription: 'description' in item,
                        item: item
                      });
                      // Type guard: Check if item is a ContentGridItem with proper ContentGridItem structure
                      const isContentGridItem = item.__typename === 'ContentGridItem';

                      if (isContentGridItem) {
                        // Type assertion since we've verified it's a proper ContentGridItem
                        return (
                          <ContentGridItem
                            key={item.sys?.id || index}
                            {...(item as ContentGridItemType)}
                          />
                        );
                      }

                      // Type guard: Check if item is a Post with essential Post structure
                      // Note: PostCard doesn't require author information, so we only check for core fields
                      const isPost = item.__typename === 'Post';

                      if (isPost) {
                        // Type assertion since we've verified it's a proper Post
                        return <PostCard key={item.sys?.id || index} {...(item as PostType)} />;
                      }

                      if (isVideo) {
                        // Type assertion since we've verified it's a proper Video
                        return (
                          <MuxVideoPlayer key={item.sys?.id || index} {...(item as VideoType)} />
                        );
                      }

                      const isImage = item.__typename === 'Image';

                      if (isImage) {
                        return <AirImage key={item.sys?.id || index} {...(item as AirImageType)} />;
                      }

                      // Type guard: Check if item is a Product with essential Product structure
                      const isProduct = item.__typename === 'Product';

                      if (isProduct) {
                        // Transform Product to ContentGridItem format, mapping slug to link and icon to image
                        return (
                          <ProductCard key={item.sys?.id || index} {...(item as ProductType)} />
                        );
                      }

                      // Type guard: Check if item is a Solution with essential Solution structure
                      const isSolution = item.__typename === 'Solution';

                      if (isSolution) {
                        // Type assertion since we've verified it's a proper Solution
                        return (
                          <SolutionCard
                            key={item.sys?.id || index}
                            index={index}
                            {...(item as SolutionType)}
                          />
                        );
                      }

                      const isService = item.__typename === 'Service';

                      if (isService) {
                        // Find the first service item index
                        const serviceItems = validItems.filter(
                          (item) => item.__typename === 'Service'
                        );
                        const serviceIndex = serviceItems.findIndex(
                          (serviceItem) => serviceItem.sys?.id === item.sys?.id
                        );
                        const isFirstService = serviceIndex === 0;

                        // Type assertion since we've verified it's a proper Service
                        return (
                          <ServiceCard
                            key={item.sys?.id || index}
                            cardId={item.sys?.id || `service-${index}`}
                            isFirst={isFirstService}
                            serviceId={item.sys?.id || `service-${index}`}
                          />
                        );
                      }

                      const isSlider = item.__typename === 'Slider';

                      if (isSlider) {
                        // Type assertion since we've verified it's a proper Slider
                        return <Slider key={item.sys?.id || index} {...(item as SliderType)} />;
                      }

                      const isCtaGrid = item.__typename === 'CtaGrid';

                      if (isCtaGrid) {
                        // Type assertion since we've verified it's a proper CtaGrid
                        return <CtaGrid key={item.sys?.id || index} {...(item as CtaGridType)} />;
                      }

                      const isPageList = item.__typename === 'PageList';

                      if (isPageList) {
                        const pageList = item as PageListType;

                        // Check if the PageList contains only Products
                        const allItemsAreProducts = pageList.pagesCollection?.items?.every(
                          (pageItem: PageListPagesType) => pageItem?.__typename === 'Product'
                        );

                        if (allItemsAreProducts && pageList.pagesCollection?.items?.length) {
                          // Render as a grid of ProductCards
                          return (
                            <Box
                              key={item.sys?.id || index}
                              direction="col"
                              gap={8}
                              className="w-full"
                            >
                              {/* PageList title */}
                              <Box direction="col" gap={4} className="text-center">
                                <h3 className="text-headline-md">{pageList.title}</h3>
                              </Box>

                              {/* Product grid */}
                              <Box
                                direction="row"
                                gap={6}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                              >
                                {pageList.pagesCollection.items.map(
                                  (productItem: PageListPagesType, productIndex: number) => (
                                    <ProductCard
                                      key={productItem?.sys?.id ?? productIndex}
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      {...(productItem as any)}
                                    />
                                  )
                                )}
                              </Box>
                            </Box>
                          );
                        } else {
                          // Check if PageList contains nested PageLists
                          const hasNestedPageLists = pageList.pagesCollection?.items?.some(
                            (pageItem: PageListPagesType) => pageItem?.__typename === 'PageList'
                          );

                          if (hasNestedPageLists) {
                            // Render nested PageLists as a navigation structure
                            return (
                              <Box
                                key={item.sys?.id ?? index}
                                direction="col"
                                gap={6}
                                className="w-full"
                              >
                                {/* PageList title */}
                                <Box direction="col" gap={4} className="text-center">
                                  <h3 className="text-headline-md">{pageList.title}</h3>
                                </Box>

                                {/* Nested items grid */}
                                <Box
                                  direction="row"
                                  gap={4}
                                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                >
                                  {pageList.pagesCollection?.items?.map(
                                    (nestedItem: PageListPagesType, nestedIndex: number) => (
                                      <Box
                                        key={nestedItem?.sys?.id ?? nestedIndex}
                                        direction="col"
                                        gap={2}
                                        className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                                      >
                                        <h4 className="text-lg font-semibold">
                                          {nestedItem?.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {nestedItem?.__typename === 'PageList'
                                            ? 'Page List'
                                            : nestedItem?.__typename}
                                        </p>
                                        {'slug' in nestedItem && nestedItem.slug && (
                                          <Link
                                            href={
                                              props.currentPath
                                                ? `${props.currentPath}/${pageList.slug}/${nestedItem.slug}`
                                                : props.parentPageListSlug
                                                  ? `/${props.parentPageListSlug}/${pageList.slug}/${nestedItem.slug}`
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
                          } else {
                            // Fallback: render PageList title only for mixed content
                            return (
                              <Box
                                key={item.sys?.id ?? index}
                                direction="col"
                                gap={4}
                                className="text-center"
                              >
                                <h3 className="text-headline-md">{pageList.title}</h3>
                                <p className="text-body-sm text-gray-600">
                                  Mixed content PageList (
                                  {pageList.pagesCollection?.items?.length ?? 0} items)
                                </p>
                              </Box>
                            );
                          }
                        }
                      }

                      // Fallback: skip unrecognized items
                      return null;
                    })}
                  </Box>
                );

                // Return content wrapped with ServiceCardProvider if service cards are present
                return hasServiceCards ? (
                  <ServiceCardProvider>{gridContent}</ServiceCardProvider>
                ) : (
                  gridContent
                );
              })()}
            </Box>
          </Container>
        </Section>
      </div>
    </ErrorBoundary>
  );
}
