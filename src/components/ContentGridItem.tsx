'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import { Button } from '@/components/ui/button';
import type { ContentGridItem as ContentGridItemType } from '@/types/contentful/ContentGrid';

export function ContentGridItem(props: ContentGridItemType) {
  const { icon, title, description, link, image, sys } = props;
  const inspectorProps = useContentfulInspectorMode({ entryId: sys?.id });

  // Render the appropriate icon based on the icon name
  const renderIcon = () => {
    return (
      <div className="group-hover:bg-primary mb-4 inline-flex h-16 w-16 items-center justify-center bg-black p-2">
        <Image
          src={icon?.url ?? ''}
          alt={`${icon?.title} icon`}
          className="h-full w-full"
          width={icon?.width}
          height={icon?.height}
          {...inspectorProps({ fieldId: 'icon' })}
        />
      </div>
    );
  };

  const LinkItem = () => {
    return (
      <Link href={`/${link.slug}`} className="block">
        <Box direction="col" className="hover:bg-muted/50 group h-full p-4 transition-all">
          {renderIcon()}

          <Box
            gap={0}
            className="group-hover:text-primary text-headline-xs mb-2 flex items-center transition-all"
          >
            <h2
              className="text-headline-xs transition-all"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {title}
            </h2>
            <span className="text-primary hidden transition-all group-hover:block">
              <ArrowUpRight className="size-12 stroke-1" />
            </span>
          </Box>

          <p
            className="group-hover:text-primary text-muted-foreground text-sm"
            {...inspectorProps({ fieldId: 'description' })}
          >
            {description}
          </p>
        </Box>
      </Link>
    );
  };

  const BackgroundImageItem = () => (
    <Box>
      <div className="relative w-full">
        {/* Background image */}
        <AirImage
          link={image?.link ?? ''}
          altText={image?.altText ?? ''}
          className="h-[502px] w-full object-cover"
        />
        {/* Overlay card */}
        <div className="absolute top-8 right-8 bottom-8 left-8 flex w-auto items-center justify-end px-0 md:left-auto">
          <Box
            direction="col"
            gap={12}
            className="h-[439px] max-w-[531px] bg-black/30 p-10 px-12 py-16 text-white shadow-xl backdrop-blur-lg"
          >
            <Box direction="col" gap={6}>
              <div className="size-16 items-center">{renderIcon()}</div>

              <Box direction="col" gap={2}>
                <h3 className="text-headline-md" {...inspectorProps({ fieldId: 'title' })}>
                  {title}
                </h3>
                <p className="text-white" {...inspectorProps({ fieldId: 'description' })}>
                  {description}
                </p>
              </Box>
            </Box>

            <Link href={`/${link.slug}`}>
              <Button variant="outlineWhite">Learn More</Button>
            </Link>
          </Box>
        </div>
      </div>
    </Box>
  );

  return image ? <BackgroundImageItem /> : <LinkItem />;
}
