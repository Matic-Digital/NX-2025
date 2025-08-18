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
import type { PostSliderItem } from '@/types/contentful/Post';
import type { Product } from '@/types/contentful/Product';
import type { PageList } from '@/types/contentful/PageList';
import type { SectionHeading as SectionHeadingType } from '@/types/contentful/SectionHeading';
import type { Image } from '@/types/contentful/Image';
import { ProductCard } from '@/components/global/ProductCard';
import { Box, Container } from '@/components/global/matic-ds';
import { Button } from './ui/button';
import { SectionHeading } from './SectionHeading';
import { cn } from '@/lib/utils';

interface ContentOverlayProps {
  children: React.ReactNode;
}

interface ContentCardProps {
  image: {
    link?: string;
    altText?: string;
    title?: string;
  };
  category?: string;
  title: string;
  description?: string;
  slug: string;
  inspectorProps: (options: { fieldId: string }) => Record<string, unknown> | null;
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

  const ContentCard = ({
    image,
    category,
    title,
    description,
    slug,
    inspectorProps
  }: ContentCardProps) => (
    <ContentContainer>
      <AirImage
        link={image.link}
        altText={image.altText ?? image.title}
        className="absolute h-full object-cover"
      />
      <ContentOverlay>
        <Box direction="col" gap={12} className="w-full items-center justify-center text-center">
          <Box direction="col" gap={5}>
            <Box direction="col" gap={1.5}>
              {category && (
                <p
                  className="text-body-sm text-text-on-invert uppercase"
                  {...inspectorProps({ fieldId: 'categories' })}
                >
                  {category}
                </p>
              )}
              <h2
                className="text-headline-lg text-text-on-invert leading-tight"
                {...inspectorProps({ fieldId: 'title' })}
              >
                {title}
              </h2>
            </Box>
            {description && (
              <p
                className="text-body-xs letter-spacing-[0.14px] text-text-on-invert leading-normal"
                {...inspectorProps({ fieldId: 'excerpt' })}
              >
                {description}
              </p>
            )}
          </Box>

          <Button
            variant="white"
            {...inspectorProps({ fieldId: 'button' })}
            className="w-fit"
            asChild
          >
            <Link href={slug}>Explore {title}</Link>
          </Button>
        </Box>
      </ContentOverlay>
    </ContentContainer>
  );

  const SectionHeadingCard = ({
    imageAsset,
    sectionHeading
  }: {
    imageAsset: Image;
    sectionHeading: SectionHeadingType;
  }) => {
    return (
      <ContentContainer>
        <AirImage
          link={imageAsset.link}
          altText={imageAsset.altText ?? imageAsset.title}
          className="absolute h-full object-cover"
        />
        <div className="relative flex h-full items-center justify-center p-10">
          <SectionHeading
            sys={{ id: sectionHeading.sys.id }}
            title={sectionHeading.title}
            description={sectionHeading.description}
            ctaCollection={sectionHeading.ctaCollection}
            componentType={'content'}
            isDarkMode={true}
          />
        </div>
      </ContentContainer>
    );
  };

  if (liveContent && 'item' in liveContent && liveContent.item) {
    const item = liveContent.item;

    // Post Content
    if ('__typename' in item && item.__typename === 'Post') {
      const postItem = item as unknown as PostSliderItem;

      return (
        <ContentCard
          image={{
            link: postItem.mainImage?.link,
            altText: postItem.mainImage?.altText
          }}
          category={
            Array.isArray(postItem.categories)
              ? postItem.categories.join(', ')
              : postItem.categories
          }
          title={postItem.title}
          description={postItem.excerpt}
          slug={postItem.slug}
          inspectorProps={inspectorProps}
        />
      );
    }

    // Product Content
    if ('__typename' in item && item.__typename === 'Product') {
      const product = item as unknown as Product;

      return (
        <ContentCard
          image={{
            link: product.image?.link ?? '',
            altText: product.image?.title ?? ''
          }}
          category={Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}
          title={product.title}
          description={product.description}
          slug={product.slug}
          inspectorProps={inspectorProps}
        />
      );
    }

    // PageList Content
    if ('__typename' in item && item.__typename === 'PageList') {
      const pageList = item as unknown as PageList;

      // Check if the PageList contains only Products
      const allItemsAreProducts = pageList.pagesCollection?.items?.every(
        (pageItem) => pageItem.__typename === 'Product'
      );

      if (allItemsAreProducts && pageList.pagesCollection?.items?.length) {
        // Render as a grid of ProductCards
        return (
          <Container className="py-16">
            <Box direction="col" gap={8}>
              {/* PageList title and description */}
              <Box direction="col" gap={4} className="text-center">
                <h2 className="text-headline-lg" {...inspectorProps({ fieldId: 'title' })}>
                  {pageList.title}
                </h2>
              </Box>

              {/* Product grid */}
              <Box
                direction="row"
                gap={6}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {pageList.pagesCollection.items.map((productItem, index) => (
                  <ProductCard
                    key={productItem.sys?.id || index}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...(productItem as unknown as any)}
                  />
                ))}
              </Box>
            </Box>
          </Container>
        );
      } else {
        // Fallback: render as a regular ContentCard if not all Products
        return (
          <ContentCard
            image={{
              link: '',
              altText: pageList.title ?? 'PageList'
            }}
            category="Page List"
            title={pageList.title ?? 'Untitled PageList'}
            description=""
            slug={pageList.slug ?? '#'}
            inspectorProps={inspectorProps}
          />
        );
      }
    }

    if ('__typename' in item && item.__typename === 'SectionHeading') {
      const sectionHeading = item as unknown as SectionHeadingType;

      // If Content has a background image, render with ContentCard layout
      if (liveContent.asset?.__typename === 'Image') {
        const imageAsset = liveContent.asset as Image;
        return <SectionHeadingCard imageAsset={imageAsset} sectionHeading={sectionHeading} />;
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
