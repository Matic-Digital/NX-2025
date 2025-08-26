'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import Link from 'next/link';
import { getContentById } from '@/lib/contentful-api/content';
import { AirImage } from '@/components/media/AirImage';
import type { Content } from '@/types/contentful/Content';
import type { Product } from '@/types/contentful/Product';
import type { SectionHeading as SectionHeadingType } from '@/types/contentful/SectionHeading';
import type { Image } from '@/types/contentful/Image';
import { Box, Container } from '@/components/global/matic-ds';
import { Button } from './ui/button';
import { SectionHeading } from './SectionHeading';
import { cn } from '@/lib/utils';

interface ContentOverlayProps {
  children: React.ReactNode;
}

type ProductCardData = Pick<Product, 'title' | 'description' | 'slug' | 'image' | 'tags'>;

type SectionHeadingCardData = Pick<
  SectionHeadingType,
  'title' | 'description' | 'ctaCollection'
> & {
  image: {
    link?: string;
    altText?: string;
    title?: string;
  };
};

interface ContentCardProps {
  data: ProductCardData | SectionHeadingCardData;
  inspectorProps: (options: { fieldId: string }) => Record<string, unknown> | null;
  variant: 'ContentLeft' | 'FullWidth';
}

interface ContentContainerProps {
  children: React.ReactNode;
}

export function Content(props: Content) {
  const [content, setContent] = useState<Content>(props);
  const [loading, setLoading] = useState(false);
  const liveContent = useContentfulLiveUpdates(content);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveContent?.sys?.id });

  useEffect(() => {
    console.log('🎉 Content useEffect running with ID:', props.sys.id);

    const fetchContent = async () => {
      try {
        setLoading(true);
        console.log('🎉 Starting fetch for content ID:', props.sys.id);
        const data = await getContentById(props.sys.id);
        if (data?.item) {
          console.log('🎉 Data received, setting content to:', data.item);
          setContent(data.item);
        } else {
          console.error('No content data returned for ID:', props.sys.id);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        console.log('🎉 Content fetching complete for ID:', props.sys.id);
        setLoading(false);
      }
    };

    void fetchContent();
  }, [props.sys.id]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Loading content...</div>
      </div>
    );
  }

  // If no content, show a message
  if (!liveContent?.sys) {
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

  // Shared Components
  const ContentContainer = ({ children }: ContentContainerProps) => (
    <Container className={cn('relative mt-10 mb-20 h-[502px]')}>{children}</Container>
  );

  const ContentOverlay = ({ children }: ContentOverlayProps) => (
    <div
      className="flex h-full w-full max-w-[558px] p-10 backdrop-blur-[14px]"
      style={{
        background:
          'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
      }}
    >
      {children}
    </div>
  );

  const ContentCard = ({ data, inspectorProps, variant }: ContentCardProps) => {
    // Type guard to check if data is ProductCardData
    const isProductData = (
      data: ProductCardData | SectionHeadingCardData
    ): data is ProductCardData => {
      return 'slug' in data;
    };

    if (variant === 'ContentLeft') {
      return (
        <ContentContainer>
          <AirImage
            link={data.image?.link}
            altText={data.image?.altText ?? data.image?.title}
            className="absolute h-full object-cover"
          />
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
                  <h2
                    className="text-headline-lg text-text-on-invert mx-auto max-w-xs leading-tight"
                    {...inspectorProps({ fieldId: 'title' })}
                  >
                    {data.title}
                  </h2>
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
                data.ctaCollection?.items?.map((cta, index) => (
                  <Link
                    key={cta.sys?.id || index}
                    href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
                    {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <Button
                      variant={
                        (data.ctaCollection?.items?.length ?? 0) === 1
                          ? 'white'
                          : index === 0
                            ? 'primary'
                            : 'white'
                      }
                    >
                      {cta.text}
                    </Button>
                  </Link>
                ))
              )}
            </Box>
          </ContentOverlay>
        </ContentContainer>
      );
    }

    return (
      <ContentContainer>
        <AirImage
          link={data.image?.link}
          altText={data.image?.altText ?? data.image?.title}
          className="absolute inset-0 h-full w-full object-cover p-9"
        />
        <div className="relative flex h-full items-center justify-center p-10">
          <SectionHeading
            sys={{ id: '' }}
            title={data.title}
            description={data.description}
            ctaCollection={!isProductData(data) ? data.ctaCollection : undefined}
            componentType={'content'}
            isDarkMode={true}
          />
        </div>
      </ContentContainer>
    );
  };

  // Get variant from content
  const getVariant = (): 'FullWidth' | 'ContentLeft' | null => {
    return liveContent.variant ?? null;
  };

  if (liveContent && 'item' in liveContent && liveContent.item) {
    const item = liveContent.item;
    const variant = getVariant();

    // Only render if variant is specified
    if (!variant) {
      return (
        <article className="prose max-w-none">
          <h2 {...inspectorProps({ fieldId: 'title' })}>{liveContent.title}</h2>
          <p className="text-sm text-gray-500">
            No variant specified for content type: {liveContent.__typename}
          </p>
        </article>
      );
    }

    // Handle Product content
    if ('__typename' in item && item.__typename === 'Product') {
      const product = item as unknown as Product;

      // Select image: Content asset first, then Product image as fallback
      const selectedImage =
        liveContent.asset?.__typename === 'Image' ? (liveContent.asset as Image) : product.image;

      const productData: ProductCardData = {
        title: product.title,
        description: product.description,
        slug: product.slug,
        image: selectedImage,
        tags: product.tags
      };

      return <ContentCard data={productData} inspectorProps={inspectorProps} variant={variant} />;
    }

    // Handle SectionHeading content
    if ('__typename' in item && item.__typename === 'SectionHeading') {
      const sectionHeading = item as unknown as SectionHeadingType;

      // If Content has a background image, use ContentCard
      if (liveContent.asset?.__typename === 'Image') {
        const imageAsset = liveContent.asset as Image;

        const sectionHeadingData: SectionHeadingCardData = {
          title: sectionHeading.title,
          description: sectionHeading.description,
          ctaCollection: sectionHeading.ctaCollection,
          image: {
            link: imageAsset.link ?? '',
            altText: imageAsset.altText ?? imageAsset.title,
            title: imageAsset.title ?? ''
          }
        };

        return (
          <ContentCard
            data={sectionHeadingData}
            inspectorProps={inspectorProps}
            variant={variant}
          />
        );
      }

      // Fallback to regular SectionHeading component if no background image
      return (
        <SectionHeading
          sys={{ id: sectionHeading.sys.id }}
          title={sectionHeading.title}
          description={sectionHeading.description}
          ctaCollection={sectionHeading.ctaCollection}
        />
      );
    }
  }

  // Generic Content
  return (
    <article className="prose max-w-none">
      <h2 {...inspectorProps({ fieldId: 'title' })}>{liveContent.title}</h2>
      <p className="text-sm text-gray-500">Content type: {liveContent.__typename}</p>
    </article>
  );
}
