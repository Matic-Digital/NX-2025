'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import { getContentById } from '@/components/Content/ContentApi';
import { ContentSkeleton } from '@/components/Content/ContentSkeleton';
import { NewsletterSignupForm } from '@/components/Forms/NewsletterSignup/NewsletterSignupForm';
import { AirImage } from '@/components/Image/AirImage';
import { RequestAQuoteModal } from '@/components/Modals/RequestAQuoteModal';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';
import { SECTION_HEADING_VARIANTS } from '@/components/SectionHeading/SectionHeadingVariants';

import type { ModalType } from '../Button/ModalCtaButton';
import type { Modal } from '../Modals/Modal';
import type {
  SectionHeading as SectionHeadingType,
  SectionHeadingVariant
} from '../SectionHeading/SectionHeadingSchema';
// Types
import type { Content, ContentOverlay } from '@/components/Content/ContentSchema';
import type { ContentVariant } from '@/components/Content/ContentVariant';
import type { ContentGridItem } from '@/components/ContentGrid/ContentGridItemSchema';
import type { NewsletterSignup } from '@/components/Forms/NewsletterSignup/NewsletterSignupSchema';
import type { Image } from '@/components/Image/ImageSchema';
import type { Product } from '@/components/Product/ProductSchema';

// ===== TYPES & INTERFACES =====

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

type NewsletterSignupCardData = NewsletterSignup;

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

  console.log('⭐ Content', content);

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
  if (loading) {
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
        'relative container mx-auto mt-12 mb-20 min-h-[43.6rem] overflow-hidden px-6 sm:px-6 md:h-[502px] md:px-9'
      )}
    >
      {children}
    </div>
  );

  const ContentOverlay = ({ children }: ContentOverlay) => (
    <div
      className="flex h-auto w-full max-w-[558px] p-6 backdrop-blur-[14px] sm:p-8 md:h-full md:p-10"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  );

  // ===== HELPER FUNCTIONS =====
  const isContentGridItemData = (
    data: ProductCardData | SectionHeadingCardData | ContentGridItemCardData
  ): data is ContentGridItemCardData => {
    return 'heading' in data && 'variant' in data && 'ctaCollection' in data;
  };

  const isNewsletterSignupData = (
    data:
      | ProductCardData
      | SectionHeadingCardData
      | ContentGridItemCardData
      | NewsletterSignupCardData
  ): data is NewsletterSignupCardData => {
    return 'title' in data && 'description' in data && 'formId' in data;
  };

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
            {/* Image container - ensure it fills the container properly */}
            <div className="absolute inset-0 overflow-hidden px-6 sm:px-6 md:px-9">
              <AirImage
                link={data.image?.link}
                altText={data.image?.altText ?? data.image?.title}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Mobile: Content at bottom, Desktop: Content on left */}
            <div className="absolute inset-0 flex items-end px-6 sm:px-6 md:items-center md:px-9">
              <div className="w-full md:h-full md:w-auto">
                <ContentOverlay>
                  <Box
                    direction="col"
                    gap={12}
                    className="w-full items-center justify-center text-center"
                  >
                    <Box direction="col" gap={5}>
                      <Box direction="col" gap={1.5}>
                        {isContentGridItemData(data) && data.heading && (
                          <p
                            className="text-body-sm text-text-on-invert uppercase"
                            {...inspectorProps({ fieldId: 'heading' })}
                          >
                            {data.heading}
                          </p>
                        )}

                        {isNewsletterSignupData(data) && data.title && (
                          <p
                            className="text-body-sm text-text-on-invert uppercase"
                            {...inspectorProps({ fieldId: 'title' })}
                          >
                            {data.title}
                          </p>
                        )}

                        {isProductData(data) && data.tags && (
                          <p
                            className="text-body-sm text-text-on-invert uppercase"
                            {...inspectorProps({ fieldId: 'categories' })}
                          >
                            {Array.isArray(data.tags) ? data.tags.join(', ') : data.tags}
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
                              className="text-headline-sm md:text-headline-lg text-text-on-invert mx-auto max-w-xs leading-tight"
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
                    {isContentGridItemData(data) && data.ctaCollection?.items?.[0] && (
                      <ModalCtaButton
                        cta={data.ctaCollection.items[0]}
                        variant="white"
                        modalType="quote"
                        onModalOpen={handleModalOpen}
                        className="w-fit"
                      />
                    )}

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
      formId={activeModal?.sys?.id ?? 'default-form-id'}
    />
  );

  // ===== MAIN CONTENT RENDERING =====
  if (content && 'item' in content && content.item) {
    const item = content.item;
    const variant = getVariant();
    console.log('⭐ Content item:', item);
    console.log('⭐ Content item __typename:', item.__typename);
    console.log('⭐ Content variant:', variant);

    // Only render if variant is specified
    if (!variant) {
      console.log('⭐ No variant specified for content type:', content.__typename);
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

    // ===== NEWSLETTER SIGNUP CONTENT =====
    if ('__typename' in item && item.__typename === 'NewsletterSignup') {
      const newsletterSignup = item as unknown as NewsletterSignup;

      // Get image from Content asset if available
      const image = content.asset?.__typename === 'Image'
        ? {
            link: (content.asset as Image).link ?? '',
            altText: (content.asset as Image).altText ?? (content.asset as Image).title,
            title: (content.asset as Image).title ?? ''
          }
        : {};

      return <NewsletterSignupForm data={newsletterSignup} image={image} />;
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
        formId={activeModal?.sys?.id ?? 'default-form-id'}
      />
    </>
  );
}
