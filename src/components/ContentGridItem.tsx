'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ContentGridItem as ContentGridItemType } from '@/types/contentful/ContentGridItem';
import { getContentGridItemLink } from '@/lib/contentful-api/content-grid';
import { useState, useEffect } from 'react';

export function ContentGridItem(props: ContentGridItemType) {
  const { sys, heading, description, icon, image } = props;
  const inspectorProps = useContentfulInspectorMode({ entryId: sys?.id });
  const [linkHref, setLinkHref] = useState<string>('#');

  // Render the appropriate icon based on the icon name
  const renderIcon = (isBackgroundImage = false) => {
    // Only render icon if it exists and has a valid URL
    if (!icon?.url) {
      return (
        <div
          className={cn('mb-4 inline-flex h-16 w-16 items-center justify-center bg-black p-2', {
            'group-hover:bg-primary': !isBackgroundImage
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
          'group-hover:bg-primary': !isBackgroundImage
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

  const _ContentItem = () => {
    return (
      <div>
        <div>ContentItem</div>
      </div>
    );
  };

  // Fetch link details on component mount
  useEffect(() => {
    const fetchLinkDetails = async () => {
      if (!sys?.id) {
        return;
      }

      try {
        const linkData = await getContentGridItemLink(sys.id);
        if (linkData?.link?.slug) {
          setLinkHref(`/${linkData.link.slug}`);
        }
      } catch {
        // Silently handle the error - links will remain as '#' if they fail to resolve
        // This prevents console spam while maintaining functionality
      }
    };

    void fetchLinkDetails();
  }, [sys?.id]);

  const getHref = () => {
    return linkHref;
  };

  const LinkItem = () => {
    return (
      <Link href={getHref()} className="group block h-full w-full">
        <Box
          direction="col"
          className="border-border bg-card hover:bg-accent/10 flex h-[500px] w-full flex-col border p-6 transition-all"
        >
          <div>
            {icon && <div className="mb-6">{renderIcon(false)}</div>}

            <Box gap={2} className="mb-4 flex items-start">
              <h2
                className="text-headline-sm line-clamp-2 flex-1 font-medium"
                {...inspectorProps({ fieldId: 'heading' })}
              >
                {heading}
              </h2>
              <span className="text-muted-foreground group-hover:text-primary mt-1 transition-transform group-hover:translate-x-1">
                <ArrowUpRight className="size-5" />
              </span>
            </Box>

            {description && (
              <p
                className="text-muted-foreground group-hover:text-primary/80 line-clamp-3 text-sm"
                {...inspectorProps({ fieldId: 'description' })}
              >
                {description}
              </p>
            )}
          </div>
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
          className="flex h-full w-full max-w-[531px] flex-col bg-black/30 p-6 text-white shadow-xl backdrop-blur-lg md:p-8 lg:p-10"
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
                    className="line-clamp-3 text-white/90"
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
                  className="transition-all hover:bg-white hover:text-black"
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

  return image ? <BackgroundImageItem /> : <LinkItem />;
}
