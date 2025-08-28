'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

import { Button } from '@/components/ui/button';
import { Box } from '@/components/global/matic-ds';
import type { SectionHeading } from '@/types/contentful/SectionHeading';
import { cn } from '@/lib/utils';

interface SectionHeadingProps extends SectionHeading {
  componentType?: string;
  isDarkMode?: boolean;
  isProductContext?: boolean;
}

export function SectionHeading(props: SectionHeadingProps) {
  const sectionHeading = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: sectionHeading?.sys?.id });

  // Preserve custom props that aren't part of Contentful data
  const { componentType, isDarkMode, isProductContext } = props;

  if (componentType === 'banner-hero') {
    console.log('SectionHeading props:', { componentType, isDarkMode, isProductContext });
    console.log('SectionHeading received props:', props);
  }

  const isBannerHeroComponent = componentType === 'banner-hero';
  const isContentComponent = componentType === 'content';
  const hasCtaCollection = (props.ctaCollection?.items?.length ?? 0) > 0;

  const gap = hasCtaCollection ? 12 : 0;
  const cols = { base: 1, md: 2, xl: hasCtaCollection ? 3 : 2 };

  const DefaultSectionHeading = (
    <Box cols={cols} gap={gap} {...inspectorProps({ fieldId: 'heading' })}>
      {/* overline and title */}
      <Box
        direction="col"
        gap={{ base: 2, md: 4 }}
        className={cn('col-span-2 max-w-[600px]', !hasCtaCollection && 'max-w-5xl')}
      >
        {sectionHeading.overline && (
          <p
            className="text-foreground uppercase"
            {...inspectorProps({ fieldId: 'heading.overline' })}
          >
            {sectionHeading.overline}
          </p>
        )}
        <h2
          className="text-headline-lg text-foreground leading-tight"
          {...inspectorProps({ fieldId: 'heading.title' })}
        >
          {sectionHeading.title}
        </h2>
        {sectionHeading.description && (
          <p className="text-foreground" {...inspectorProps({ fieldId: 'heading.description' })}>
            {sectionHeading.description}
          </p>
        )}
      </Box>

      {/* cta */}
      <Box
        gap={2}
        {...inspectorProps({ fieldId: 'heading' })}
        className={cn('col-span-1 items-end xl:ml-auto', {
          'items-center': isContentComponent
        })}
      >
        {hasCtaCollection &&
          sectionHeading.ctaCollection?.items?.map((cta, index) => (
            <Link
              key={cta.sys?.id || index}
              href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
              {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Button
                variant={
                  (sectionHeading.ctaCollection?.items?.length ?? 0) === 1
                    ? 'primary'
                    : index === 0
                      ? 'primary'
                      : 'outline'
                }
              >
                {cta.text}
              </Button>
            </Link>
          ))}
      </Box>
    </Box>
  );

  const BannerHeroSectionHeading = (
    <Box
      gap={hasCtaCollection ? { base: 4, md: 12 } : 0}
      direction={{ base: 'col', md: 'row' }}
      cols={{ base: 1, md: 2, xl: 3 }}
      className="items-end"
      {...inspectorProps({ fieldId: 'heading' })}
    >
      {/* title */}
      <h2
        className="text-text-on-invert lg:text-display-lg col-span-2 w-full max-w-sm text-[56px] leading-[100%] tracking-[-1.1px] md:max-w-lg lg:max-w-3xl"
        {...inspectorProps({ fieldId: 'heading.title' })}
      >
        {sectionHeading.title}
      </h2>

      {/* cta */}
      <Box
        direction="col"
        gap={8}
        {...inspectorProps({ fieldId: 'heading' })}
        className="col-span-2 w-full max-w-sm lg:max-w-md xl:col-span-1 xl:ml-auto xl:max-w-lg xl:items-end"
      >
        {sectionHeading.description && (
          <p
            {...inspectorProps({ fieldId: 'heading.description' })}
            className="text-body-md lg:text-body-lg text-text-on-invert w-full xl:text-right"
          >
            {sectionHeading.description}
          </p>
        )}

        <Box
          gap={3}
          {...inspectorProps({ fieldId: 'heading' })}
          className="col-span-1 items-end xl:ml-auto"
        >
          {hasCtaCollection &&
            sectionHeading.ctaCollection?.items?.map((cta, index) => (
              <Link
                key={cta.sys?.id || index}
                href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
                {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Button
                  variant={
                    (sectionHeading.ctaCollection?.items?.length ?? 0) === 1
                      ? 'primary'
                      : index === 0
                        ? 'white'
                        : 'primary'
                  }
                >
                  {cta.text}
                </Button>
              </Link>
            ))}
        </Box>
      </Box>
    </Box>
  );

  const CenteredSectionHeading = (
    <Box
      direction="col"
      gap={6}
      className="items-center text-center"
      {...inspectorProps({ fieldId: 'heading' })}
    >
      {/* title */}
      <h2
        className="text-text-on-invert lg:text-display-md col-span-full w-full max-w-4xl text-center text-[56px] leading-[100%] tracking-[-1.1px]"
        {...inspectorProps({ fieldId: 'heading.title' })}
      >
        {sectionHeading.title}
      </h2>

      {/* cta */}
      <Box
        direction="col"
        gap={8}
        {...inspectorProps({ fieldId: 'heading' })}
        className="col-span-full w-full items-center"
      >
        {sectionHeading.description && (
          <p
            {...inspectorProps({ fieldId: 'heading.description' })}
            className="text-body-md lg:text-body-lg text-text-on-invert w-full max-w-2xl text-center"
          >
            {sectionHeading.description}
          </p>
        )}

        <Box
          gap={3}
          {...inspectorProps({ fieldId: 'heading' })}
          className="items-center justify-center"
        >
          {hasCtaCollection &&
            sectionHeading.ctaCollection?.items?.map((cta, index) => (
              <Link
                key={cta.sys?.id || index}
                href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
                {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Button
                  variant={
                    (sectionHeading.ctaCollection?.items?.length ?? 0) === 1
                      ? 'primary'
                      : index === 0
                        ? 'white'
                        : 'primary'
                  }
                >
                  {cta.text}
                </Button>
              </Link>
            ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <div className={isDarkMode ? 'dark' : undefined}>
      {isBannerHeroComponent && isProductContext
        ? CenteredSectionHeading
        : isBannerHeroComponent
          ? BannerHeroSectionHeading
          : isProductContext
            ? CenteredSectionHeading
            : DefaultSectionHeading}
    </div>
  );
}
