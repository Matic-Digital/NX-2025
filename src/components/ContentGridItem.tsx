'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';
import { cn } from '@/lib/utils';
import type { ContentGridItem as ContentGridItemType } from '@/types/contentful/ContentGridItem';
import { getContentGridItemById, getContentGridItemLink } from '@/lib/contentful-api/content-grid';
import { useState, useEffect } from 'react';

interface ContentGridItemProps extends ContentGridItemType {
  parentPageListSlug?: string; // Optional parent PageList slug for nested routing
  currentPath?: string; // Full current path for deeply nested structures
}

export function ContentGridItem(props: ContentGridItemProps) {
  const inspectorProps = useContentfulInspectorMode({ entryId: props.sys?.id });
  const [linkHref, setLinkHref] = useState<string>('#');
  const [fullContentData, setFullContentData] = useState<ContentGridItemType | null>(null);

  // Use full content data if available, otherwise fall back to props
  const contentData = fullContentData ?? props;
  const { sys, heading, description, variant, icon, image } = contentData;
  console.log('ContentGridItem variant', { variant, heading });

  // Fetch full content data and link details on component mount
  useEffect(() => {
    const fetchContentData = async () => {
      if (!sys?.id) {
        return;
      }

      try {
        // Fetch full content data
        const fullData = await getContentGridItemById(sys.id);
        if (fullData) {
          setFullContentData(fullData);
        }

        // Fetch link details
        const linkData = await getContentGridItemLink(sys.id);
        if (linkData?.link?.slug) {
          // Default to flat URL structure
          let href = `/${linkData.link.slug}`;

          // PageList Nesting Integration: Check if the linked PageList has a parent
          // This ensures URLs like /products/trackers instead of just /trackers
          if (linkData.link.__typename === 'PageList') {
            console.log(`Checking parent for PageList: ${linkData.link.slug}`);
            try {
              // Query the check-page-parent API to detect nesting relationships
              const response = await fetch(`/api/check-page-parent?slug=${linkData.link.slug}`);
              console.log(`API response status: ${response.status}`);

              if (response.ok) {
                const data = (await response.json()) as {
                  parentPageList?: unknown;
                  fullPath?: string;
                };
                console.log('API response data:', JSON.stringify(data, null, 2));

                if (data.parentPageList) {
                  // Construct proper nested URL: /parent-pagelist/child-pagelist
                  href = `/${(data.parentPageList as { slug?: string }).slug}/${linkData.link.slug}`;
                  console.log(
                    `Found parent PageList "${(data.parentPageList as { slug?: string }).slug}" for "${linkData.link.slug}"`
                  );
                } else {
                  console.log(`No parent PageList found for "${linkData.link.slug}"`);
                }
              } else {
                console.warn(`API call failed with status: ${response.status}`);
              }
            } catch (error) {
              console.warn('Failed to check parent PageList:', error);
            }
          } else if (props.parentPageListSlug) {
            // For content items (Pages, Products, etc.) with known parent context
            // Use the parent PageList slug to construct nested URLs
            href = `/${props.parentPageListSlug}/${linkData.link.slug}`;
          }

          console.log(
            `ContentGridItem link constructed: ${href} (type: ${linkData.link.__typename})`
          );
          setLinkHref(href);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void fetchContentData();
  }, [sys?.id, props.parentPageListSlug]);

  // Render the appropriate icon based on the icon name
  const renderIcon = (isBackgroundImage = false) => {
    // Only render icon if it exists and has a valid URL
    if (!icon?.url) {
      return (
        <div
          className={cn('mb-4 inline-flex h-16 w-16 items-center justify-center bg-black p-2', {
            'group-hover:bg-primary transition-colors': !isBackgroundImage
          })}
        >
          {/* Placeholder for when no icon is available */}
          <div className="h-8 w-8 rounded bg-white/20" />
        </div>
      );
    }

    return (
      <div
        className={cn('mb-4 inline-flex h-16 w-16 items-center justify-center bg-black p-2', {
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

  const DefaultItem = () => {
    return (
      <Box direction="col" gap={4} className="group">
        <Box className="group-hover:bg-primary w-fit bg-black p-[0.38rem] transition-colors">
          {icon?.url && <Image src={icon.url} alt={heading} width={60} height={60} />}
        </Box>
        <Box direction="col" gap={2}>
          <h3 className="text-headline-sm group-hover:text-primary transition-colors">{heading}</h3>
          <p className="text-body-sm group-hover:text-primary transition-colors">{description}</p>
        </Box>
      </Box>
    );
  };

  const LinkItem = () => {
    return (
      <Link href={getHref()} className="group flex flex-col">
        <Box direction="col" gap={4}>
          <Box className="group-hover:bg-primary w-fit bg-black p-[0.38rem] transition-colors">
            {icon?.url && <Image src={icon.url} alt={heading} width={60} height={60} />}
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

  const BackgroundImageItem = () => (
    <div className="group relative min-h-[500px] w-full overflow-hidden">
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
          className="text-background flex h-full w-full max-w-[531px] flex-col bg-black/30 p-6 shadow-xl backdrop-blur-lg md:p-8 lg:p-10"
        >
          <div className="flex h-full flex-col">
            <div>
              <div className="mb-6">{renderIcon(true)}</div>

              <Box direction="col" gap={4} className="mb-8">
                <h3
                  className="text-headline-md line-clamp-2 font-medium"
                  {...inspectorProps({ fieldId: 'heading' })}
                >
                  {heading}
                </h3>
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

            <div className="mt-auto">
              <Link href={getHref()} className="inline-block w-auto">
                <Button
                  variant="outlineWhite"
                  className="hover:bg-background hover:text-foreground transition-colors"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </Box>
      </div>
    </div>
  );

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
            className="text-headline-sm group-hover:text-background line-clamp-2 transition-colors"
            {...inspectorProps({ fieldId: 'heading' })}
          >
            {heading}
          </h3>
          {description && (
            <p
              className="text-body-sm group-hover:text-background text-text-subtle line-clamp-3 transition-colors"
              {...inspectorProps({ fieldId: 'description' })}
            >
              {description}
            </p>
          )}
        </Box>
      </Box>
    </div>
  );

  // Determine rendering style based on variant field from Contentful
  switch (variant) {
    case 'BackgroundImage':
      return <BackgroundImageItem />;
    case 'BackgroundGradientHover':
      return <BackgroundGradientHoverItem />;
    case 'Link':
      return <LinkItem />;
    default:
      return <DefaultItem />;
  }
}
