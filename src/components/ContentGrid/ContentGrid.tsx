'use client';

import * as React from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

import {
  calculateGridConfig,
  collectionAnalyzers,
  contentTypeDetectors
} from '@/lib/component-grid/utils';
import { cn } from '@/lib/utils';

import { ServiceCardProvider } from '@/contexts/ServiceCardContext';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';

import { getCollectionIdsFromContentGrid } from '@/components/ContentGrid/ContentGridApi';
import { ContentItemRenderer } from '@/components/ContentGrid/ContentItemRenderer';
import { AirImage } from '@/components/Image/AirImage';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';

import type { ContentGrid as ContentGridType } from './ContentGridSchema';
import type { ContentGridItemUnion } from '@/lib/component-grid/utils';

interface ContentGridProps extends ContentGridType {
  isDarkMode?: boolean;
  parentPageListSlug?: string; // Optional parent PageList slug for nested routing
  currentPath?: string; // Full current path for deeply nested structures
  forceTabletSingleColumn?: boolean; // Force single column layout on tablet
}

export function ContentGrid(props: ContentGridProps) {
  const contentGrid = useContentfulLiveUpdates(props);
  const renderKey = React.useId(); // Unique identifier for this render
  const [enhancedItems, setEnhancedItems] = React.useState<ContentGridItemUnion[]>([]);
  const [_isLoadingCollections, setIsLoadingCollections] = React.useState(false);

  const rawItems = contentGrid.itemsCollection?.items;

  // Enhanced items processing with Collection detection and fetching
  React.useEffect(() => {
    const processItems = async () => {
      if (!rawItems?.length) {
        setEnhancedItems([]);
        return;
      }

      setIsLoadingCollections(true);
      const processedItems = [];

      // First, check if we have any empty objects (potential Collections)
      const hasEmptyObjects = rawItems.some(
        (item) => item && typeof item === 'object' && Object.keys(item).length === 0
      );

      let collectionIds: string[] = [];
      if (hasEmptyObjects && contentGrid.sys?.id) {
        console.log('Detected empty objects, fetching Collection IDs...');
        try {
          collectionIds = await getCollectionIdsFromContentGrid(contentGrid.sys.id);
          console.log('Found Collection IDs:', collectionIds);
        } catch (error) {
          console.warn('Failed to fetch Collection IDs:', error);
        }
      }

      let collectionIndex = 0;
      for (const item of rawItems) {
        console.log(
          'Processing item:',
          item,
          'Keys:',
          Object.keys(item || {}),
          'Has sys:',
          !!item?.sys
        );

        // Check if item might be a Collection (completely empty object)
        if (item && typeof item === 'object' && Object.keys(item).length === 0) {
          console.log('Detected empty object - likely a Collection');
          if (collectionIds[collectionIndex]) {
            // Create a minimal Collection object with just sys.id for lazy loading
            processedItems.push({
              sys: { id: collectionIds[collectionIndex] },
              __typename: 'Collection' as const
            } as ContentGridItemUnion);
            collectionIndex++;
          } else {
            // Fallback placeholder
            processedItems.push({
              sys: { id: 'unknown-collection' },
              __typename: 'Collection' as const,
              title: 'Collection (No ID Found)',
              isEmpty: true
            } as ContentGridItemUnion);
          }
        } else {
          processedItems.push(item);
        }
      }

      setEnhancedItems(processedItems);
      setIsLoadingCollections(false);
    };

    void processItems();
  }, [rawItems, contentGrid.sys?.id]);

  // Filter out items that don't have a valid typename or sys.id
  const validItems =
    enhancedItems?.filter((item): item is ContentGridItemUnion => {
      const hasValidId = Boolean(item?.sys?.id);
      const hasValidTypename = Boolean(item?.__typename);

      return hasValidId && hasValidTypename;
    }) || [];

  // Check for duplicate items
  const itemIds =
    contentGrid.itemsCollection?.items
      ?.map((item) => item?.sys?.id)
      .filter((id): id is string => Boolean(id)) || [];
  const duplicateIds = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    console.warn(`ContentGrid render ${renderKey} - Duplicate items found:`, duplicateIds);
  }

  // Check if content grid contains only services for mobile carousel
  const serviceItems = validItems.filter(contentTypeDetectors.isService);
  const isServiceOnlyGrid = validItems.length > 0 && serviceItems.length === validItems.length;
  const isEventOnlyGrid = validItems.length > 0 && validItems.every(contentTypeDetectors.isEvent);

  // Embla carousel for service-only grids
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { active: false }
    }
  });

  // Track current slide for indicators
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Service card context is handled by the ServiceCardProvider wrapper
  // Individual ServiceCard components will manage their own active state

  // Calculate grid configuration using utilities
  const gridConfig = calculateGridConfig(validItems, contentGrid.variant);
  const { direction, gap, analysis, variant: gridVariant } = gridConfig;

  // Check if this is a 3-item post layout that needs special handling (but not if variant is ThreeColumn)
  const isThreeItemPostLayout =
    validItems.length === 3 &&
    validItems.every((item) => item.__typename === 'Post') &&
    contentGrid.variant !== 'ThreeColumn';

  // Check if this is a location layout that needs featured grid handling
  const isLocationLayout =
    validItems.length > 1 && validItems.every((item) => item.__typename === 'OfficeLocation');

  // Check if there are any service cards to wrap with provider
  const hasServiceCards = collectionAnalyzers.hasServiceCards(validItems);

  // Auto-enable dark mode if all items are accordions OR if backgroundAsset is present
  const shouldUseDarkMode =
    props.isDarkMode ?? (analysis.allItemsAreAccordions || !!contentGrid.backgroundAsset);

  // Check if this is an ImageBetween component
  const isImageBetweenComponent = props.componentType === 'ImageBetween';

  return (
    <ErrorBoundary>
      <div
        className={cn(
          shouldUseDarkMode ? 'dark' : '',
          isImageBetweenComponent ? '' : 'bg-background'
        )}
      >
        <Section className="relative overflow-hidden">
          {/* Background Asset or Background Image */}
          {(contentGrid.backgroundAsset ?? contentGrid.backgroundImage) && (
            <Box className="absolute top-0 left-0 h-full w-full z-0">
              {contentGrid.backgroundAsset ? (
                <Image
                  src={contentGrid.backgroundAsset.url}
                  alt={
                    contentGrid.backgroundAsset.title ??
                    contentGrid.backgroundAsset.description ??
                    ''
                  }
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <AirImage
                  link={contentGrid.backgroundImage?.link}
                  altText={contentGrid.backgroundImage?.altText}
                  className="h-full w-full object-cover"
                />
              )}
            </Box>
          )}
          <Container>
            <Box
              direction={direction}
              gap={gap}
              className={cn(
                'relative z-20',
                analysis.allItemsAreExpandingHoverCards && 'justify-between'
              )}
            >
              {/* section heading */}
              {contentGrid.heading && (
                <SectionHeading
                  componentType={contentGrid.componentType}
                  sectionHeadingId={contentGrid.heading?.sys.id}
                  isDarkMode={shouldUseDarkMode}
                  hasSolutionItems={
                    analysis.allItemsAreSolutions || analysis.allItemsAreExpandingHoverCards
                  }
                />
              )}

              {/* items */}
              {(() => {
                const gridContent = isServiceOnlyGrid ? (
                  // Service carousel for service-only content grids on mobile
                  <div className="w-full">
                    {/* Mobile Carousel */}
                    <div className="md:hidden">
                      <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-4 pl-4">
                          {serviceItems.map((service, index) => {
                            const isActiveSlide = currentSlide === index;
                            return (
                              <div
                                key={service.sys?.id ?? `service-${index}`}
                                className="min-w-0 flex-[0_0_80%]"
                              >
                                <div className={isActiveSlide ? 'group' : ''}>
                                  <ContentItemRenderer
                                    item={service}
                                    index={index}
                                    validItems={validItems}
                                    parentPageListSlug={props.parentPageListSlug}
                                    currentPath={props.currentPath}
                                    variant="grid"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Carousel Indicators with Navigation */}
                      <div className="relative z-50 mx-auto mt-8 flex h-1 w-full max-w-[90vw] flex-shrink-0 items-center justify-between gap-4 px-4">
                        <div className="flex h-1 flex-1 items-center">
                          {serviceItems.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                emblaApi?.scrollTo(index);
                                // Active card state is managed by ServiceCard components
                              }}
                              className={cn('h-full flex-1 cursor-pointer bg-neutral-300', {
                                'bg-surface-invert': currentSlide === index
                              })}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                        <div className="ml-8 flex items-center gap-4">
                          <button
                            onClick={() => emblaApi?.scrollPrev()}
                            className="relative left-0 flex size-8 items-center justify-center rounded-none border border-gray-300 bg-transparent text-white shadow-sm hover:bg-white hover:text-gray-900"
                            aria-label="Previous slide"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m12 19-7-7 7-7" />
                              <path d="M19 12H5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => emblaApi?.scrollNext()}
                            className="relative right-0 flex size-8 items-center justify-center rounded-none border border-gray-300 bg-transparent text-white shadow-sm hover:bg-white hover:text-gray-900"
                            aria-label="Next slide"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Grid */}
                    <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
                      {serviceItems.map((service, index) => (
                        <ContentItemRenderer
                          key={service.sys?.id ?? `service-${index}`}
                          item={service}
                          index={index}
                          validItems={validItems}
                          parentPageListSlug={props.parentPageListSlug}
                          currentPath={props.currentPath}
                          variant="grid"
                        />
                      ))}
                    </div>
                  </div>
                ) : isLocationLayout ? (
                  // Location featured grid layout - first item featured, rest in grid
                  <Box direction="col" gap={8} className="w-full">
                    {/* Featured location - spans full width */}
                    {validItems[0] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-0-${validItems[0].sys?.id ?? 0}`}
                        item={validItems[0]}
                        index={0}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                        variant="featured"
                      />
                    )}

                    {/* Remaining locations in responsive grid */}
                    {validItems.length > 1 && (
                      <Box direction="col" cols={{ base: 1, md: 2, lg: 3 }} gap={6}>
                        {validItems
                          .slice(1)
                          .map((item, index) =>
                            item ? (
                              <ContentItemRenderer
                                key={`${contentGrid.sys?.id}-${index + 1}-${item.sys?.id ?? index + 1}`}
                                item={item}
                                index={index + 1}
                                validItems={validItems}
                                parentPageListSlug={props.parentPageListSlug}
                                currentPath={props.currentPath}
                                variant="grid"
                              />
                            ) : null
                          )}
                      </Box>
                    )}
                  </Box>
                ) : isThreeItemPostLayout ? (
                  // Custom 3-item layout with first item on left, next two stacked on right
                  <div
                    className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5 lg:gap-5"
                    style={
                      {
                        '--left-column-width': '3fr',
                        '--right-column-width': '2fr'
                      } as React.CSSProperties
                    }
                  >
                    {/* First item takes left 3 columns and spans 2 rows */}
                    {validItems[0] && (
                      <div className="lg:col-span-3 lg:row-span-2">
                        <ContentItemRenderer
                          key={`${contentGrid.sys?.id}-0-${validItems[0].sys?.id ?? 0}`}
                          item={validItems[0]}
                          index={0}
                          validItems={validItems}
                          parentPageListSlug={props.parentPageListSlug}
                          currentPath={props.currentPath}
                          variant="featured"
                        />
                      </div>
                    )}
                    {/* Next two items stacked on the right 2 columns */}
                    {validItems[1] && (
                      <div className="lg:col-span-2">
                        <ContentItemRenderer
                          key={`${contentGrid.sys?.id}-1-${validItems[1].sys?.id ?? 1}`}
                          item={validItems[1]}
                          index={1}
                          validItems={validItems}
                          parentPageListSlug={props.parentPageListSlug}
                          currentPath={props.currentPath}
                          variant="row"
                        />
                      </div>
                    )}
                    {validItems[2] && (
                      <div className="lg:col-span-2">
                        <ContentItemRenderer
                          key={`${contentGrid.sys?.id}-2-${validItems[2].sys?.id ?? 2}`}
                          item={validItems[2]}
                          index={2}
                          validItems={validItems}
                          parentPageListSlug={props.parentPageListSlug}
                          currentPath={props.currentPath}
                          variant="row"
                        />
                      </div>
                    )}
                  </div>
                ) : gridVariant === 'OffsetStart' ? (
                  // Custom 4-item staggered grid using Box
                  <Box
                    cols={gridConfig.cols}
                    gap={gridConfig.gap}
                    className="[&>*]:min-h-[22.5rem]"
                  >
                    {/* Top row - items in columns 1 and 2 */}
                    {validItems[0] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-0-${validItems[0].sys?.id ?? 0}`}
                        item={validItems[0]}
                        index={0}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                    {validItems[1] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-1-${validItems[1].sys?.id ?? 1}`}
                        item={validItems[1]}
                        index={1}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                    {/* Empty space in column 3 for top row */}
                    <div className="hidden lg:block"></div>

                    {/* Bottom row - empty column 1, items in columns 2 and 3 */}
                    <div className="hidden lg:block"></div>

                    {validItems[2] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-2-${validItems[2].sys?.id ?? 2}`}
                        item={validItems[2]}
                        index={2}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                    {validItems[3] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-3-${validItems[3].sys?.id ?? 3}`}
                        item={validItems[3]}
                        index={3}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                  </Box>
                ) : gridVariant === 'OffsetEnd' ? (
                  <Box
                    cols={gridConfig.cols}
                    gap={gridConfig.gap}
                    className="[&>*]:min-h-[22.5rem]"
                  >
                    {/* Empty space in column 3 for top row */}
                    <div className="hidden lg:block"></div>
                    {/* Top row - items in columns 1 and 2 */}
                    {validItems[0] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-0-${validItems[0].sys?.id ?? 0}`}
                        item={validItems[0]}
                        index={0}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                    {validItems[1] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-1-${validItems[1].sys?.id ?? 1}`}
                        item={validItems[1]}
                        index={1}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                    {validItems[2] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-2-${validItems[2].sys?.id ?? 2}`}
                        item={validItems[2]}
                        index={2}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                    {validItems[3] && (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-3-${validItems[3].sys?.id ?? 3}`}
                        item={validItems[3]}
                        index={3}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    )}
                    {/* Bottom row - empty column 1, items in columns 2 and 3 */}
                    <div className="hidden lg:block"></div>
                  </Box>
                ) : gridVariant === 'FullWidth' ? (
                  <Box
                    cols={1}
                    gap={gridConfig.gap}
                    wrap={true}
                    className={cn(isEventOnlyGrid && 'gap-4 lg:gap-0')}
                  >
                    {validItems.filter(Boolean).map((item, index) => (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-${index}-${item.sys?.id ?? index}`}
                        item={item}
                        index={index}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                        variant="fullWidth"
                      />
                    ))}
                  </Box>
                ) : gridVariant === 'HoverCardCustom' ? (
                  <Box cols={gridConfig.cols} gap={gridConfig.gap} wrap={true}>
                    {validItems.filter(Boolean).map((item, index) => (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-${index}-${item.sys?.id ?? index}`}
                        item={item}
                        index={index}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                        variant="hoverCardCustom"
                      />
                    ))}
                  </Box>
                ) : (
                  <Box
                    cols={
                      props.forceTabletSingleColumn
                        ? {
                            base: 1,
                            lg:
                              typeof gridConfig.cols === 'number'
                                ? gridConfig.cols
                                : 'lg' in gridConfig.cols
                                  ? (gridConfig.cols.lg ?? 2)
                                  : 'xl' in gridConfig.cols
                                    ? (gridConfig.cols.xl ?? 2)
                                    : 2
                          }
                        : gridConfig.cols
                    }
                    gap={gridConfig.gap}
                    wrap={true}
                  >
                    {validItems.filter(Boolean).map((item, index) => (
                      <ContentItemRenderer
                        key={`${contentGrid.sys?.id}-${index}-${item.sys?.id ?? index}`}
                        item={item}
                        index={index}
                        validItems={validItems}
                        parentPageListSlug={props.parentPageListSlug}
                        currentPath={props.currentPath}
                      />
                    ))}
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
