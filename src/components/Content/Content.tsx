'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import Link from 'next/link';

// Components
import { AirImage } from '@/components/Image/AirImage';
import { Box } from '@/components/global/matic-ds';
import { Button } from '../ui/button';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { RequestAQuoteModal } from '../Modals/RequestAQuoteModal';
import { ModalCtaButton, type ModalType } from '../Button/ModalCtaButton';
import type { Modal } from '../Modals/Modal';

// API
import { getContentById } from '@/components/Content/ContentApi';

// Types
import type { Content, ContentOverlay } from '@/components/Content/ContentSchema';
import type { ContentVariant } from '@/components/Content/ContentVariant';
import type { Product } from '@/components/Product/ProductSchema';
import type {
  SectionHeading as SectionHeadingType,
  SectionHeadingVariant
} from '../SectionHeading/SectionHeadingSchema';
import type { ContentGridItem } from '@/components/ContentGrid/ContentGridItemSchema';
import type { Image } from '@/components/Image/ImageSchema';

// Constants
import { SECTION_HEADING_VARIANTS } from '@/components/SectionHeading/SectionHeadingVariants';

// Utils
import { cn } from '@/lib/utils';
import { ContentSkeleton } from './ContentSkeleton';

// ===== TYPES & INTERFACES =====

type ProductCardData = Pick<Product, 'title' | 'description' | 'slug' | 'image' | 'tags'>;

type SectionHeadingCardData = Pick<
  SectionHeadingType,
  'overline' | 'title' | 'description' | 'ctaCollection' | 'variant'
> & {
  image: {
    link?: string;
    altText?: string;
    title?: string;
  };
};

type ContentGridItemCardData = Pick<
  ContentGridItem,
  'title' | 'heading' | 'description' | 'variant' | 'ctaCollection' | 'icon'
> & {
  image: {
    link?: string;
    altText?: string;
    title?: string;
  };
};

type ModalData = {
  title?: string;
  description?: string;
  sys?: { id: string };
};

interface ContentCardProps {
  data: ProductCardData | SectionHeadingCardData | ContentGridItemCardData;
  inspectorProps: (options: { fieldId: string }) => Record<string, unknown> | null;
  variant: ContentVariant;
}

interface ContentContainerProps {
  children: React.ReactNode;
}

interface ContentProps extends Content {
  contentId?: string;
}

// ===== MAIN COMPONENT =====

export function Content(props: ContentProps) {
  // ===== STATE & HOOKS =====
  const contentId = props.sys.id;
  const { ...restProps } = props;
  const [fetchedData, setFetchedData] = useState<Content | null>(null);
  const [loading, setLoading] = useState(!!contentId);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalData | null>(null);

  console.log('🤩contentId', contentId);
  console.log('🤩restProps', restProps);
  console.log('🤩fetchedData', fetchedData);

  // Fetch data if contentId is provided
  useEffect(() => {
    if (!contentId) return;

    async function fetchContent() {
      try {
        setLoading(true);
        const data = await getContentById(contentId ?? '', false);
        setFetchedData(data.item);
      } catch (err) {
        console.error('Failed to fetch content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    void fetchContent();
  }, [contentId]);

  // ===== CONTENTFUL HOOKS =====
  const content = useContentfulLiveUpdates(fetchedData ?? restProps);
  const inspectorProps = useContentfulInspectorMode({ entryId: content?.sys?.id });

  // ===== HANDLERS =====
  const handleModalOpen = (modal: Modal, _modalType: ModalType) => {
    setActiveModal({
      title: modal.title ?? 'Request a Quote',
      description: modal.description ?? 'Please fill out the form below to request a quote.',
      sys: modal.sys ?? { id: 'modal-' + Date.now() }
    });
    setIsModalOpen(true);
  };

  // ===== EARLY RETURNS =====
  if (!loading) {
    return <ContentSkeleton variant={fetchedData?.variant} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!content?.sys) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">No content found</div>
        <div className="mt-2 text-sm text-gray-500">
          {content
            ? `Content exists but liveContent is invalid: ${JSON.stringify(content).substring(0, 100)}...`
            : 'No content data'}
        </div>
      </div>
    );
  }

  // ===== SHARED COMPONENTS =====
  const ContentContainer = ({ children }: ContentContainerProps) => (
    <div
      className={cn(
        'relative container mx-auto mt-12 mb-20 h-[502px] overflow-hidden px-6 sm:px-6 md:px-9'
      )}
    >
      {children}
    </div>
  );

  const ContentOverlay = ({ children }: ContentOverlay) => (
    <div
      className="flex h-full w-full max-w-[558px] p-6 backdrop-blur-[14px] sm:p-8 md:p-10"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  );

  // ===== HELPER FUNCTIONS =====
  const isProductData = (
    data: ProductCardData | SectionHeadingCardData | ContentGridItemCardData
  ): data is ProductCardData => {
    return 'slug' in data;
  };

  const isSectionHeadingCardData = (
    data: ProductCardData | SectionHeadingCardData | ContentGridItemCardData
  ): data is SectionHeadingCardData => {
    return 'variant' in data && 'overline' in data;
  };

  const isContentGridItemData = (
    data: ProductCardData | SectionHeadingCardData | ContentGridItemCardData
  ): data is ContentGridItemCardData => {
    return 'heading' in data && 'variant' in data && 'ctaCollection' in data;
  };

  const isSectionHeadingData = (
    data: ProductCardData | SectionHeadingCardData | ContentGridItemCardData
  ): data is SectionHeadingCardData => {
    return (
      'overline' in data && 'ctaCollection' in data && !('heading' in data) && !('slug' in data)
    );
  };

  const getValidVariant = (variant: string | undefined): SectionHeadingVariant => {
    if (variant && SECTION_HEADING_VARIANTS.includes(variant as SectionHeadingVariant)) {
      return variant as SectionHeadingVariant;
    }
    return 'Default';
  };

  // ===== CONTENT CARD COMPONENT =====
  const ContentCard = ({ data, inspectorProps, variant }: ContentCardProps) => {
    console.log('ContentCard data', data);
    console.log('ContentCard variant', variant);
    console.log('ContentCard isSectionHeadingData', isSectionHeadingData(data));
    if (variant === 'ContentLeft') {
      return (
        <>
          <ContentContainer>
            <div className="relative h-full overflow-hidden px-6 sm:px-6 md:px-9">
              <AirImage
                link={data.image?.link}
                altText={data.image?.altText ?? data.image?.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center px-6 sm:px-6 md:px-9">
              <ContentOverlay>
                <Box
                  direction="col"
                  gap={12}
                  className="w-full items-center justify-center text-center"
                >
                  <Box direction="col" gap={5}>
                    <Box direction="col" gap={1.5}>
                      {isProductData(data) && data.tags && (
                        <p
                          className="text-body-sm text-text-on-invert uppercase"
                          {...inspectorProps({ fieldId: 'categories' })}
                        >
                          {Array.isArray(data.tags) ? data.tags.join(', ') : data.tags}
                        </p>
                      )}
                      {isContentGridItemData(data) && data.heading && (
                        <p
                          className="text-body-sm text-text-on-invert uppercase"
                          {...inspectorProps({ fieldId: 'heading' })}
                        >
                          {data.heading}
                        </p>
                      )}
                      {isSectionHeadingData(data) && data.title && (
                        <>
                          <p
                            className="text-text-on-invert uppercase"
                            {...inspectorProps({ fieldId: 'heading.overline' })}
                          >
                            {data.overline}
                          </p>
                          <h2
                            className="text-headline-lg text-text-on-invert mx-auto max-w-xs leading-tight"
                            {...inspectorProps({ fieldId: 'title' })}
                          >
                            {data.title}
                          </h2>
                        </>
                      )}
                    </Box>
                    {data.description && (
                      <p
                        className="text-body-xs letter-spacing-[0.14px] text-text-on-invert leading-normal"
                        {...inspectorProps({ fieldId: 'excerpt' })}
                      >
                        {data.description}
                      </p>
                    )}
                  </Box>

                  {/* Render button for Product, ContentGridItem, or CTA collection for SectionHeading */}
                  {isProductData(data) && (
                    <Button
                      variant="white"
                      {...inspectorProps({ fieldId: 'button' })}
                      className="w-fit"
                      asChild
                    >
                      <Link href={data.slug}>Explore {data.title}</Link>
                    </Button>
                  )}
                  {isContentGridItemData(data) && data.ctaCollection?.items?.[0] && (
                    <ModalCtaButton
                      cta={data.ctaCollection.items[0]}
                      variant="white"
                      modalType="quote"
                      onModalOpen={handleModalOpen}
                      className="w-fit"
                    />
                  )}
                  {isSectionHeadingData(data) && data.ctaCollection?.items?.[0] && (
                    <ModalCtaButton
                      cta={data.ctaCollection.items[0]}
                      variant="white"
                      modalType="quote"
                      onModalOpen={handleModalOpen}
                      className="w-fit"
                    />
                  )}
                </Box>
              </ContentOverlay>
            </div>
          </ContentContainer>
        </>
      );
    }

    if (variant === 'ContentCenter') {
      return (
        <>
          <ContentContainer>
            <AirImage
              link={data.image?.link}
              altText={data.image?.altText ?? data.image?.title}
              className="absolute inset-0 h-full w-full object-cover px-6 md:px-9"
            />
            <Box
              direction="col"
              gap={12}
              className="relative h-full w-full items-center justify-center text-center"
            >
              <Box direction="col" gap={5}>
                <Box direction="col" gap={1.5}>
                  {isProductData(data) && data.tags && (
                    <p
                      className="text-body-sm text-text-on-invert uppercase"
                      {...inspectorProps({ fieldId: 'categories' })}
                    >
                      {Array.isArray(data.tags) ? data.tags.join(', ') : data.tags}
                    </p>
                  )}
                  {!isProductData(data) && 'overline' in data && data.overline && (
                    <p
                      className="text-white uppercase"
                      {...inspectorProps({ fieldId: 'heading.overline' })}
                    >
                      {data.overline}
                    </p>
                  )}
                  <h2
                    className="text-headline-lg text-text-on-invert leading-tight"
                    {...inspectorProps({ fieldId: 'title' })}
                  >
                    {data.title}
                  </h2>
                </Box>
                {data.description && (
                  <p
                    className="text-body-xs letter-spacing-[0.14px] text-text-on-invert mx-auto max-w-lg leading-normal"
                    {...inspectorProps({ fieldId: 'excerpt' })}
                  >
                    {data.description}
                  </p>
                )}
                {/* Render button for Product or CTA collection for SectionHeading */}
                {isProductData(data) ? (
                  <Button
                    variant="white"
                    {...inspectorProps({ fieldId: 'button' })}
                    className="w-fit"
                    asChild
                  >
                    <Link href={data.slug}>Explore {data.title}</Link>
                  </Button>
                ) : (
                  'ctaCollection' in data &&
                  data.ctaCollection?.items?.map((cta, index) => (
                    <ModalCtaButton
                      key={cta.sys?.id || index}
                      cta={cta}
                      variant={
                        (data.ctaCollection?.items?.length ?? 0) === 1
                          ? 'white'
                          : index === 0
                            ? 'primary'
                            : 'white'
                      }
                      modalType="quote"
                      onModalOpen={handleModalOpen}
                    />
                  ))
                )}
              </Box>
            </Box>
          </ContentContainer>
        </>
      );
    }

    return (
      <ContentContainer>
        <AirImage
          link={data.image?.link}
          altText={data.image?.altText ?? data.image?.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex h-full items-center justify-center p-10">
          <SectionHeading
            title={data.title}
            description={data.description}
            ctaCollection={isSectionHeadingCardData(data) ? data.ctaCollection : undefined}
            variant={isSectionHeadingCardData(data) ? getValidVariant(data.variant) : 'Default'}
            componentType={'content'}
            isDarkMode={true}
          />
        </div>
      </ContentContainer>
    );
  };

  // ===== UTILITY FUNCTIONS =====
  const getVariant = (): ContentVariant | null => {
    return content.variant ?? null;
  };

  const renderModal = () => (
    <RequestAQuoteModal
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      title={activeModal?.title ?? 'Request a Quote'}
      description={activeModal?.description ?? 'Please fill out the form below to request a quote.'}
      sys={activeModal?.sys ?? { id: 'content-modal' }}
    />
  );

  // ===== MAIN CONTENT RENDERING =====
  if (content && 'item' in content && content.item) {
    const item = content.item;
    const variant = getVariant();

    // Only render if variant is specified
    if (!variant) {
      return (
        <article className="prose max-w-none">
          <h2 {...inspectorProps({ fieldId: 'title' })}>{content.title}</h2>
          <p className="text-sm text-gray-500">
            No variant specified for content type: {content.__typename}
          </p>
        </article>
      );
    }

    // ===== PRODUCT CONTENT =====
    if ('__typename' in item && item.__typename === 'Product') {
      const product = item as unknown as Product;

      // Select image: Content asset first, then Product image as fallback
      const selectedImage =
        content.asset?.__typename === 'Image' ? (content.asset as Image) : product.image;

      const productData: ProductCardData = {
        title: product.title,
        description: product.description,
        slug: product.slug,
        image: selectedImage,
        tags: product.tags
      };

      return <ContentCard data={productData} inspectorProps={inspectorProps} variant={variant} />;
    }

    // ===== CONTENT GRID ITEM CONTENT =====
    if ('__typename' in item && item.__typename === 'ContentGridItem') {
      const contentGridItem = item as unknown as ContentGridItem;

      // Select image: Content asset first, then ContentGridItem image as fallback
      const selectedImage =
        content.asset?.__typename === 'Image' ? (content.asset as Image) : contentGridItem.image;

      const contentGridItemData: ContentGridItemCardData = {
        title: contentGridItem.title,
        heading: contentGridItem.heading,
        description: contentGridItem.description,
        variant: contentGridItem.variant,
        icon: contentGridItem.icon,
        ctaCollection: contentGridItem.ctaCollection,
        image: selectedImage
          ? {
              link: selectedImage.link ?? '',
              altText: selectedImage.altText ?? selectedImage.title,
              title: selectedImage.title ?? ''
            }
          : {
              link: '',
              altText: '',
              title: ''
            }
      };

      return (
        <>
          <ContentCard
            data={contentGridItemData}
            inspectorProps={inspectorProps}
            variant={variant}
          />
          {renderModal()}
        </>
      );
    }

    // ===== SECTION HEADING CONTENT =====
    if ('__typename' in item && item.__typename === 'SectionHeading') {
      const sectionHeading = item as unknown as SectionHeadingType;

      // If Content has a background image, use ContentCard
      if (content.asset?.__typename === 'Image') {
        const imageAsset = content.asset as Image;

        const sectionHeadingData: SectionHeadingCardData = {
          overline: sectionHeading.overline,
          title: sectionHeading.title,
          description: sectionHeading.description,
          ctaCollection: sectionHeading.ctaCollection,
          variant: sectionHeading.variant,
          image: {
            link: imageAsset.link ?? '',
            altText: imageAsset.altText ?? imageAsset.title,
            title: imageAsset.title ?? ''
          }
        };

        return (
          <>
            <ContentCard
              data={sectionHeadingData}
              inspectorProps={inspectorProps}
              variant={variant}
            />
            {renderModal()}
          </>
        );
      }

      // Fallback to regular SectionHeading component if no background image
      return (
        <>
          <SectionHeading
            overline={sectionHeading.overline}
            title={sectionHeading.title}
            description={sectionHeading.description}
            ctaCollection={sectionHeading.ctaCollection}
          />
          {renderModal()}
        </>
      );
    }
  }

  // ===== GENERIC CONTENT FALLBACK =====
  return (
    <>
      <article className="prose max-w-none">
        <h2 {...inspectorProps({ fieldId: 'title' })}>{content.title}</h2>
        <p className="text-sm text-gray-500">Content type: {content.__typename}</p>
      </article>

      {/* Request a Quote Modal */}
      <RequestAQuoteModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={activeModal?.title ?? 'Request a Quote'}
        description={
          activeModal?.description ?? 'Please fill out the form below to request a quote.'
        }
        sys={activeModal?.sys ?? { id: 'content-modal' }}
      />
    </>
  );
}
