'use client';

import { useEffect, useState } from 'react';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import Image from 'next/image';
import Link from 'next/link';

import { staticRoutingService } from '@/lib/static-routing';
import { cn } from '@/lib/utils';

import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';

import { Box } from '@/components/global/matic-ds';

import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import {
  getContentGridItemById,
  getContentGridItemLink
} from '@/components/ContentGrid/ContentGridApi';
import { AirImage } from '@/components/Image/AirImage';
import { ServiceCard } from '@/components/Service/ServiceCard';

import type { ContentGridItem as ContentGridItemType } from '@/components/ContentGrid/ContentGridItemSchema';
import type { Service } from '@/components/Service/ServiceSchema';

interface ContentGridItemProps extends ContentGridItemType {
  parentPageListSlug?: string; // Optional parent PageList slug for nested routing
  currentPath?: string; // Full current path for deeply nested structures
  index?: number; // Index for determining if this is the first item
}

export function ContentGridItem(props: ContentGridItemProps) {
  const inspectorProps = useContentfulInspectorMode({ entryId: props.sys?.id });
  const [linkHref, setLinkHref] = useState<string>('#');
  const [fullContentData, setFullContentData] = useState<ContentGridItemType | null>(null);

  // Use full content data if available, otherwise fall back to props
  const contentData = fullContentData ?? props;
  const { sys, title, heading, subheading, description, variant, icon, image, ctaCollection } =
    contentData;

  // Fetch full content data and link details on component mount
  useEffect(() => {
    const fetchContentData = async () => {
      if (!sys?.id) {
        return;
      }

      try {
        // Fetch full content data using internal API route
        const contentResponse = await fetch(`/api/components/ContentGrid/${sys.id}`);
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setFullContentData(contentData.contentGridItem);
        }

        // Fetch link details for ContentGridItem using internal API route
        const linkResponse = await fetch(`/api/components/ContentGrid/${sys.id}/link`);
        if (linkResponse.ok) {
          const linkResponseData = await linkResponse.json();
          const linkData = linkResponseData.linkData;
          
          if (linkData?.link?.slug) {
            // Default to flat URL structure
            let href = `/${linkData.link.slug}`;

            // PageList Nesting Integration: Check if the linked PageList has a parent
            // This ensures URLs like /products/trackers instead of just /trackers
            if (linkData.link.__typename === 'PageList') {
              // Use static routing service to get route metadata (replaces API call)
              const routeMetadata = staticRoutingService.getRoute(`/${linkData.link.slug}`);
              
              if (routeMetadata && routeMetadata.isNested && routeMetadata.parentPageLists.length > 0) {
                // Use the full nested path from routing metadata
                href = routeMetadata.path;
              }
            } else if (props.parentPageListSlug) {
              // For content items (Pages, Products, etc.) with known parent context
              // Use the parent PageList slug to construct nested URLs
              href = `/${props.parentPageListSlug}/${linkData.link.slug}`;
            }
            setLinkHref(href);
          }
        }
      } catch {
        // Error fetching content data
      }
    };

    void fetchContentData();
  }, [sys?.id, props.parentPageListSlug, props.__typename]);

  // Render the appropriate icon based on the icon name
  const renderIcon = (isBackgroundImage = false) => {
    // Only render icon if it exists and has a valid URL
    if (!icon?.url) {
      return (
        <div
          className={cn('mb-4 inline-flex size-12 items-center justify-center bg-black p-2', {
            'group-hover:bg-primary transition-colors': !isBackgroundImage
          })}
        >
          {/* Placeholder for when no icon is available */}
          <div className="size-12rounded bg-white/20" />
        </div>
      );
    }

    return (
      <div
        className={cn('inline-flex size-12 items-center justify-center bg-black p-1', {
          'group-hover:bg-primary transition-colors': !isBackgroundImage
        })}
      >
        <Image
          src={icon.url}
          alt={`${icon.title ?? 'Icon'}`}
          className="h-full w-full"
          width={icon.width}
          height={icon.height}
          {...inspectorProps({ fieldId: 'icon' })}
        />
      </div>
    );
  };

  const getHref = () => {
    return linkHref;
  };

  const BackgroundItem = () => {
    return (
      <Box direction="col" gap={4} className="group bg-subtle p-8">
        <Box className="group-hover:bg-primary w-fit bg-black p-[0.38rem] transition-colors">
          {icon?.url && (
            <Image src={icon.url} alt={heading} width={60} height={60} loading="lazy" />
          )}
        </Box>
        <Box direction="col" gap={2}>
          <h3 className="text-headline-sm group-hover:text-primary transition-colors">{heading}</h3>
          <p className="text-body-sm group-hover:text-primary transition-colors">{description}</p>
        </Box>
      </Box>
    );
  };

  const BackgroundImageItem = () => (
    <div className="group relative min-h-[37.5rem] w-full overflow-hidden md:min-h-[500px]">
      {/* Background image */}
      <AirImage
        link={image?.link ?? ''}
        altText={image?.altText ?? ''}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay card */}
      <div className="absolute inset-0 flex items-end justify-end p-4 md:p-6 lg:p-8">
        <Box
          direction="col"
          gap={6}
          className="text-background flex h-fit w-full max-w-[531px] flex-col bg-black/30 p-6 shadow-xl backdrop-blur-lg md:h-full md:p-8 lg:p-10"
        >
          <div className="flex h-full flex-col">
            <div>
              <div className="flex flex-row gap-[0.75rem] md:flex-col">
                <div className="md:mb-6">{renderIcon(true)}</div>
                <h3
                  className="text-headline-sm mt-2 line-clamp-2 font-medium md:mb-4"
                  {...inspectorProps({ fieldId: 'heading' })}
                >
                  {heading}
                </h3>
              </div>

              <Box direction="col" gap={4} className="mb-8">
                {description && (
                  <p
                    className="text-background/90 line-clamp-3"
                    {...inspectorProps({ fieldId: 'description' })}
                  >
                    {description}
                  </p>
                )}
              </Box>
            </div>

            {ctaCollection?.items?.[0]?.text && (
              <div className="mt-auto">
                <Link href={getHref()} className="inline-block w-full md:w-auto">
                  <Button
                    variant="outlineTrasparentWhite"
                    className="hover:bg-background hover:text-foreground w-full transition-colors"
                  >
                    {ctaCollection?.items?.[0]?.text}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Box>
      </div>
    </div>
  );

  const BackgroundImageCompactItem = () => (
    <div className="group relative min-h-[37.5rem] w-full overflow-hidden md:min-h-[23.25rem]">
      {/* Background image */}
      <AirImage
        link={image?.link ?? ''}
        altText={image?.altText ?? ''}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay card */}
      <div className="absolute inset-0 flex items-end lg:items-center justify-end p-4 md:p-6 lg:p-8">
        <Box
          direction="col"
          gap={6}
          className="text-background flex h-fit w-full max-w-[531px] flex-col bg-black/30 p-6 shadow-xl backdrop-blur-lg md:p-8 lg:p-10"
        >
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-[0.75rem] items-center">
                <div>{renderIcon(true)}</div>
                <h3
                  className="text-headline-sm line-clamp-2"
                  {...inspectorProps({ fieldId: 'heading' })}
                >
                  {heading}
                </h3>
              </div>

              <Box direction="col" gap={4} className="mb-8">
                {description && (
                  <p
                    className="text-background/90 line-clamp-3"
                    {...inspectorProps({ fieldId: 'description' })}
                  >
                    {description}
                  </p>
                )}
              </Box>
            </div>

            {ctaCollection?.items?.[0]?.text && (
              <div className="mt-auto">
                <Link href={getHref()} className="inline-block w-full md:w-auto">
                  <Button
                    variant="outlineTrasparentWhite"
                    className="hover:bg-background hover:text-foreground w-full transition-colors"
                  >
                    {ctaCollection?.items?.[0]?.text}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Box>
      </div>
    </div>
  );

  const BackgroundPrimaryHoverItem = () => {
    return (
      <div className="group rounded-xxs bg-subtle relative min-h-[24rem] min-w-[24rem] overflow-hidden">
        {/* Card Content */}
        <Box
          direction="col"
          gap={4}
          className="group-hover:bg-primary relative z-20 h-full cursor-pointer p-6 transition-all duration-300"
        >
          {/* Text Content */}
          <Box direction="col" gap={4} className="h-full justify-between">
            <Box direction="col" gap={3}>
              <h3
                className="text-headline-sm line-clamp-2 transition-colors duration-300 group-hover:text-white"
                {...inspectorProps({ fieldId: 'heading' })}
              >
                {heading}
              </h3>
              {description && (
                <p
                  className="text-body-sm text-text-subtle line-clamp-4 opacity-0 transition-all duration-300 group-hover:text-white group-hover:opacity-100"
                  {...inspectorProps({ fieldId: 'description' })}
                >
                  {description}
                </p>
              )}
            </Box>

            {ctaCollection?.items?.[0]?.text && (
              <Link href={ctaCollection?.items?.[0]?.internalLink?.slug ?? ''}>
                <Button
                  variant="whiteOutline"
                  className="group-hover:bg-background group-hover:text-foreground mt-auto transition-colors group-hover:border-transparent"
                >
                  {ctaCollection?.items?.[0]?.text}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </div>
    );
  };

  const BackgroundGradientHoverItem = () => (
    <div className="group rounded-xxs bg-subtle relative overflow-hidden">
      {/* Card Image */}
      {image && (
        <div className="absolute z-10 h-full w-full opacity-0 transition-opacity group-hover:opacity-100">
          <AirImage
            link={image.link ?? ''}
            altText={image.altText ?? ''}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Card Content */}
      <Box direction="col" gap={4} className="relative z-20 h-full p-6">
        {/* Icon */}
        {icon?.url && (
          <div className="w-fit">
            <div className="group-hover:bg-background bg-foreground p-2 transition-colors">
              <SvgIcon
                src={icon.url}
                alt={heading}
                width={40}
                height={40}
                className="group-hover:[&_path]:stroke-foreground transition-colors group-hover:text-transparent"
              />
            </div>
          </div>
        )}

        {/* Text Content */}
        <Box direction="col" gap={2} className="mt-auto">
          <h3
            className="text-headline-sm group-hover:text-background transition-colors"
            {...inspectorProps({ fieldId: 'heading' })}
          >
            {heading}
          </h3>
          {description && (
            <p
              className="text-body-sm group-hover:text-background text-text-subtle transition-colors"
              {...inspectorProps({ fieldId: 'description' })}
            >
              {description}
            </p>
          )}
        </Box>
      </Box>
    </div>
  );

  const BackgroundGradientHoverItemWithLinkItem = () => (
    <div className="group rounded-xxs bg-subtle relative overflow-hidden">
      {/* Card Image */}
      {image && (
        <div className="absolute z-10 h-full w-full md:opacity-0 transition-opacity group-hover:opacity-100">
          <AirImage
            link={image.link ?? ''}
            altText={image.altText ?? ''}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Card Content */}
      <Box direction="col" gap={4} className="relative z-20 h-full p-6">
        {/* Text Content */}
        <Box direction="col" gap={2}>
          <h3
            className="text-headline-sm text-background md:text-black md:group-hover:text-background line-clamp-2 transition-colors"
            {...inspectorProps({ fieldId: 'heading' })}
          >
            {heading}
          </h3>
          {description && (
            <p
              className="text-body-sm text-white group-hover:text-background md:text-text-subtle transition-colors"
              {...inspectorProps({ fieldId: 'description' })}
            >
              {description}
            </p>
          )}
        </Box>
        {/* Arrow Icon in Bottom Right */}
        <Link href={getHref()} className="ml-auto mt-auto">
          <div className="absolute bottom-0 right-0 flex size-10 items-center justify-center bg-background">
            <ArrowUpRight className="size-8 text-text-body" />
          </div>
        </Link>
      </Box>
    </div>
  );

  const PrimaryHoverSlideUp = () => {
    // Extract slug from linkHref more reliably
    const extractedSlug = linkHref.startsWith('/') ? linkHref.slice(1) : linkHref;

    // Map ContentGridItem props to Service props
    const serviceProps: Partial<Service> & { cardId?: string; isFirst?: boolean } = {
      sys: contentData.sys,
      cardTitle: contentData.heading,
      cardTags: contentData.tags,
      cardButtonText: contentData.ctaCollection?.items?.[0]?.text ?? 'Learn More',
      cardImage: contentData.image,
      slug: extractedSlug,
      title: contentData.title,
      // Add cardId for active state management
      cardId: contentData.sys?.id,
      // Set first card as active by default
      isFirst: props.index === 0
    };

    return <ServiceCard {...serviceProps} />;
  };

  const ExpandingHoverCardItem = () => {
    const index = props.index ?? 0;

    return (
      <div className="group relative w-full cursor-pointer overflow-hidden bg-gray-100 p-6 transition-all duration-300 xl:mt-12 xl:h-[531px] xl:w-[243px] xl:p-8 xl:hover:mt-[-23px] xl:hover:h-[602px] dark:bg-[#1D1E1F]">
        {/* Background Image - appears on hover */}
        {image?.link && (
          <div className="absolute inset-0 -left-1 transition-opacity duration-300 group-hover:opacity-100 xl:opacity-0">
            <Image
              src={image.link}
              alt={image.altText ?? ''}
              fill
              className="object-cover"
              priority={false}
            />
          </div>
        )}
        <div className="relative z-10 h-full">
          <Box direction="col" gap={12} className="h-full">
            {/* Top content - appears on hover */}
            <div className="transition-opacity duration-300 xl:opacity-0 xl:group-hover:opacity-100">
              <Box direction="col" gap={{ base: 0, xl: 6 }}>
                <h2
                  className="text-title-lg xl:text-headline-md leading-10 font-medium text-white xl:leading-11"
                  {...inspectorProps({ fieldId: 'heading' })}
                >
                  {heading}
                </h2>
                <p className="text-body-lg leading-snug text-white">{description}</p>
              </Box>
            </div>

            {/* Bottom content - always anchored at bottom */}
            <div className="mt-auto">
              <Box direction="col" gap={{ base: 2, xl: 6 }}>
                <Box direction="col" gap={1}>
                  <span className="text-body-md xl:text-headline-xs group-hover:text-white dark:text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="text-body-md xl:text-headline-xs leading-tight group-hover:text-white dark:text-white"
                    {...inspectorProps({ fieldId: 'heading' })}
                  >
                    {title}
                  </h3>
                </Box>
                <p className="text-body-xs xl:text-body-xxs letter-spacing-[0.12em] leading-relaxed group-hover:text-white dark:text-white">
                  {subheading}
                </p>
              </Box>
            </div>
          </Box>
        </div>
      </div>
    );
  };

  const StackGradientHoverItem = () => {
    return (
      <Box direction="col" className="group">
        {image?.link && (
          <AirImage link={image.link} altText={heading} className="h-full w-full object-cover" />
        )}
        <Box direction="col" gap={2} className="bg-zinc-800 p-6 relative">
          <AirImage
            link="https://air-prod.imgix.net/1cd01021-40e4-4f15-add7-a864a7866f51.jpg?w=4000&h=3078&fm=webp&fit=crop&auto=auto"
            altText={heading}
            className="absolute block md:hidden md:group-hover:block inset-0 z-10 h-full w-full object-cover"
          />
          <div className="z-20">
            <h3 className="text-headline-sm text-white">{heading}</h3>
            <Box direction={{ base: 'col', md: 'row' }} gap={4} className="md:items-end">
              <p className="text-body-xs text-white">{description}</p>
              {ctaCollection?.items?.[0] && (
                <ModalCtaButton
                  cta={ctaCollection.items[0]}
                  variant="outlineWhite"
                  className="hover:bg-white hover:text-black group-hover:bg-white group-hover:text-black transition-colors"
                />
              )}
            </Box>
          </div>
        </Box>
      </Box>
    );
  };

  const LinkItem = () => {
    return (
      <Link href={getHref()} className="group flex flex-col">
        <Box className="flex-row gap-[1.75rem] md:flex-col md:gap-4">
          <Box className="group-hover:bg-primary h-fit min-h-[3.5rem] w-fit min-w-[3.5rem] bg-black p-[0.38rem] transition-colors">
            {icon?.url && (
              <Image src={icon.url} alt={heading} width={60} height={60} loading="lazy" />
            )}
          </Box>
          <Box direction="col" gap={2}>
            <Box direction="row" gap={2} className="items-center">
              <h3 className="text-headline-sm group-hover:text-primary transition-colors">
                {heading}
              </h3>
              <span className="text-muted-foreground group-hover:text-primary mt-1 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                <ArrowUpRight className="size-10 stroke-1" />
              </span>
            </Box>
            <p className="text-body-sm group-hover:text-primary transition-colors">{description}</p>
          </Box>
        </Box>
      </Link>
    );
  };

  const DefaultItem = () => {
    return (
      <Box direction="col" gap={4} className="group">
        <Box className="group-hover:bg-primary w-fit bg-black p-[0.38rem] transition-colors">
          {icon?.url && (
            <Image src={icon.url} alt={heading} width={60} height={60} loading="lazy" />
          )}
        </Box>
        <Box direction="col" gap={2}>
          <h3 className="text-headline-sm group-hover:text-primary transition-colors">{heading}</h3>
          <p className="text-body-sm group-hover:text-primary transition-colors">{description}</p>
        </Box>
      </Box>
    );
  };

  // Determine rendering style based on variant field from Contentful
  switch (variant) {
    case 'Background':
      return <BackgroundItem />;
    case 'BackgroundImage':
      return <BackgroundImageItem />;
    case 'BackgroundImageCompact':
      return <BackgroundImageCompactItem />;
    case 'BackgroundPrimaryHover':
      return <BackgroundPrimaryHoverItem />;
    case 'BackgroundGradientHover':
      return <BackgroundGradientHoverItem />;
    case 'BackgroundGradientHoverWithLink':
      return <BackgroundGradientHoverItemWithLinkItem />;
    case 'PrimaryHoverSlideUp':
      return <PrimaryHoverSlideUp />;
    case 'ExpandingHoverCard':
      return <ExpandingHoverCardItem />;
    case 'StackGradientHover':
      return <StackGradientHoverItem />;
    case 'Link':
      return <LinkItem />;
    default:
      return <DefaultItem />;
  }
}
