'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { hasMarkdown, MarkdownRenderer } from './utils/MarkdownRenderer';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

// Utils
import { cn } from '@/lib/utils';

import { SvgIcon } from '@/components/ui/svg-icon';

// Components
import { Box } from '@/components/global/matic-ds';

import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
import { SectionHeadingSkeleton } from '@/components/SectionHeading/SectionHeadingSkeleton';
import { SECTION_HEADING_VARIANTS } from '@/components/SectionHeading/SectionHeadingVariants';

// Types
import type { SectionHeading, SectionHeadingVariant } from './SectionHeadingSchema';

interface SectionHeadingProps extends Partial<SectionHeading> {
  sectionHeadingId?: string;
  componentType?: string;
  isDarkMode?: boolean;
  hasSolutionItems?: boolean;
}
const getValidVariant = (variant: string | undefined): SectionHeadingVariant => {
  if (variant && SECTION_HEADING_VARIANTS.includes(variant as SectionHeadingVariant)) {
    return variant as SectionHeadingVariant;
  }
  return 'Default';
};

export function SectionHeading(props: SectionHeadingProps) {
  const { sectionHeadingId, componentType, hasSolutionItems, isDarkMode, ...restProps } = props;
  const [fetchedData, setFetchedData] = useState<SectionHeading | null>(null);
  const [loading, setLoading] = useState(!!sectionHeadingId);
  const [error, setError] = useState<string | null>(null);

  // Fetch data if sectionHeadingId is provided
  useEffect(() => {
    if (!sectionHeadingId) return;

    async function fetchSectionHeading() {
      try {
        setLoading(true);
        const data = await getSectionHeadingById(sectionHeadingId ?? '', false);
        setFetchedData(data);
      } catch (_err) {
        setError(_err instanceof Error ? _err.message : 'Failed to load section heading');
      } finally {
        setLoading(false);
      }
    }

    void fetchSectionHeading();
  }, [sectionHeadingId]);

  // Use fetched data if available, otherwise use props data
  const sectionHeading = useContentfulLiveUpdates(fetchedData ?? restProps);
  const inspectorProps = useContentfulInspectorMode({ entryId: sectionHeading?.sys?.id });

  const hasCtaCollection = (sectionHeading?.ctaCollection?.items?.length ?? 0) > 0;

  // Helper function to determine button variant based on context
  const getButtonVariant = (
    index: number,
    totalButtons: number,
    defaultVariant: string
  ): 'primary' | 'outline' | 'white' | 'outlineWhite' => {
    // Use outlineWhite for primary buttons when in dark mode within ImageBetween
    if (isDarkMode && componentType === 'ImageBetween' && defaultVariant === 'primary') {
      return 'outlineWhite';
    }
    return defaultVariant as 'primary' | 'outline' | 'white' | 'outlineWhite';
  };

  if (loading) {
    return (
      <SectionHeadingSkeleton
        variant={getValidVariant(props.variant)}
        componentType={componentType}
        hasSolutionItems={hasSolutionItems}
        hasCtaCollection={hasCtaCollection}
        hasDescription={sectionHeading?.description !== null}
        hasOverline={sectionHeading?.overline !== null}
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!sectionHeading) {
    return null;
  }

  const gap = hasCtaCollection ? 12 : 0;
  const cols = { base: 1, md: 2, xl: hasCtaCollection ? 3 : 2 };

  const HorizontalSectionHeading = () => {
    // Check if description contains markdown to adjust alignment
    const hasMarkdownContent =
      sectionHeading.description && hasMarkdown(sectionHeading.description);

    return (
      <Box
        gap={hasCtaCollection ? { base: 4, md: 12 } : 6}
        direction={{ base: 'col', md: 'row' }}
        cols={{ base: 1, md: 2, xl: 3 }}
        className={hasMarkdownContent ? 'items-start' : 'items-end'}
        {...inspectorProps({ fieldId: 'heading' })}
      >
        {/* overline and title */}
        <Box
          direction="col"
          gap={{ base: 2, md: 4 }}
          className="col-span-2 w-full max-w-sm md:max-w-lg lg:max-w-3xl"
        >
          {sectionHeading.overline && (
            <p className="text-foreground uppercase" {...inspectorProps({ fieldId: 'overline' })}>
              {sectionHeading.overline}
            </p>
          )}
          {/* title */}
          {componentType === 'banner-hero' ? (
            <h1
              className="text-foreground lg:text-display-lg text-[56px] leading-[100%] tracking-[-1.1px]"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {sectionHeading.title}
            </h1>
          ) : (
            <h2
              className="text-foreground text-headline-md text-[56px] leading-[100%] tracking-[-1.1px]"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {sectionHeading.title}
            </h2>
          )}
        </Box>

        {/* cta */}
        <Box
          direction={hasCtaCollection ? 'col' : 'row'}
          gap={8}
          {...inspectorProps({ fieldId: 'heading' })}
          className="col-span-2 w-full max-w-sm lg:max-w-md xl:col-span-1 xl:ml-auto xl:max-w-lg xl:items-end"
        >
          {sectionHeading.description &&
            (hasMarkdown(sectionHeading.description) ? (
              <MarkdownRenderer
                content={sectionHeading.description}
                className="text-body-md lg:text-body-lg text-foreground w-full xl:text-right"
                forceLeftAlign={true}
                {...inspectorProps({ fieldId: 'description' })}
              />
            ) : (
              <p
                {...inspectorProps({ fieldId: 'description' })}
                className="text-body-md lg:text-body-lg text-foreground w-full xl:text-right"
              >
                {sectionHeading.description}
              </p>
            ))}

          <Box
            gap={3}
            {...inspectorProps({ fieldId: 'heading' })}
            className="col-span-1 items-end xl:ml-auto"
          >
            {hasCtaCollection &&
              sectionHeading.ctaCollection?.items?.map((cta, index) => {
                const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
                const defaultVariant =
                  totalButtons === 1 ? 'primary' : index === 0 ? 'white' : 'primary';

                return (
                  <div
                    key={cta.sys?.id || index}
                    {...inspectorProps({ fieldId: `ctaCollection.${index}` })}
                  >
                    <ModalCtaButton
                      cta={cta}
                      variant={getButtonVariant(index, totalButtons, defaultVariant)}
                    />
                  </div>
                );
              })}
          </Box>
        </Box>
      </Box>
    );
  };

  const StackedSectionHeading = () => (
    <Box direction="col" gap={12} {...inspectorProps({ fieldId: 'heading' })}>
      {/* title */}
      {componentType === 'banner-hero' ? (
        <h1
          className="text-foreground lg:text-display-lg w-full text-[56px] leading-[100%] tracking-[-1.1px]"
          {...inspectorProps({ fieldId: 'heading.title' })}
        >
          {sectionHeading.title}
        </h1>
      ) : (
        <h2
          className="text-foreground lg:text-display-lg w-full text-[56px] leading-[100%] tracking-[-1.1px]"
          {...inspectorProps({ fieldId: 'heading.title' })}
        >
          {sectionHeading.title}
        </h2>
      )}

      {/* cta */}
      <Box
        direction={{ base: 'col', md: 'row' }}
        gap={8}
        {...inspectorProps({ fieldId: 'heading' })}
        className="w-full"
      >
        {sectionHeading.description &&
          (hasMarkdown(sectionHeading.description) ? (
            <MarkdownRenderer
              content={sectionHeading.description}
              className="text-body-md lg:text-body-lg text-foreground w-full max-w-2xl"
              forceLeftAlign={true}
              {...inspectorProps({ fieldId: 'description' })}
            />
          ) : (
            <p
              {...inspectorProps({ fieldId: 'description' })}
              className="text-body-md lg:text-body-lg text-foreground w-full max-w-2xl"
            >
              {sectionHeading.description}
            </p>
          ))}

        <Box gap={3} {...inspectorProps({ fieldId: 'heading' })} className="items-end lg:ml-auto">
          {hasCtaCollection &&
            sectionHeading.ctaCollection?.items?.map((cta, index) => {
              const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
              const defaultVariant =
                totalButtons === 1 ? 'primary' : index === 0 ? 'white' : 'primary';

              return (
                <div
                  key={cta.sys?.id || index}
                  {...inspectorProps({ fieldId: `ctaCollection.${index}` })}
                >
                  <ModalCtaButton
                    cta={cta}
                    variant={getButtonVariant(index, totalButtons, defaultVariant)}
                  />
                </div>
              );
            })}
        </Box>
      </Box>
    </Box>
  );

  const CenteredSectionHeading = () => (
    <Box
      direction="col"
      gap={6}
      className="items-center text-center"
      {...inspectorProps({ fieldId: 'heading' })}
    >
      {sectionHeading.icon && (
        <div
          className="bg-black p-2 w-[6rem] aspect-square items-center flex justify-center"
          {...inspectorProps({ fieldId: 'icon' })}
        >
          <SvgIcon
            src={sectionHeading.icon.url}
            alt={sectionHeading.title}
            width={64}
            height={64}
            className="group-hover:[&_path]:stroke-foreground transition-colors group-hover:text-transparent"
          />
        </div>
      )}
      {/* title */}
      {componentType === 'banner-hero' ? (
        <h1
          className="text-foreground lg:text-display-md col-span-full w-full max-w-4xl text-center text-[56px] leading-[100%] tracking-[-1.1px]"
          {...inspectorProps({ fieldId: 'heading.title' })}
        >
          {sectionHeading.title}
        </h1>
      ) : (
        <h2
          className="text-foreground lg:text-display-md col-span-full w-full max-w-4xl text-center text-[56px] leading-[100%] tracking-[-1.1px]"
          {...inspectorProps({ fieldId: 'heading.title' })}
        >
          {sectionHeading.title}
        </h2>
      )}

      {/* cta */}
      <Box
        direction="col"
        gap={8}
        {...inspectorProps({ fieldId: 'heading' })}
        className="col-span-full w-full items-center"
      >
        {sectionHeading.description &&
          (hasMarkdown(sectionHeading.description) ? (
            <MarkdownRenderer
              content={sectionHeading.description}
              className="text-body-md lg:text-body-lg text-foreground w-full max-w-2xl text-center"
              forceLeftAlign={true}
              {...inspectorProps({ fieldId: 'description' })}
            />
          ) : (
            <p
              {...inspectorProps({ fieldId: 'description' })}
              className="text-body-md lg:text-body-lg text-foreground w-full max-w-2xl text-center"
            >
              {sectionHeading.description}
            </p>
          ))}

        <Box
          gap={3}
          {...inspectorProps({ fieldId: 'heading' })}
          className="items-center justify-center"
        >
          {hasCtaCollection &&
            sectionHeading.ctaCollection?.items?.map((cta, index) => {
              const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
              const defaultVariant =
                totalButtons === 1 ? 'primary' : index === 0 ? 'white' : 'primary';

              return (
                <div
                  key={cta.sys?.id || index}
                  {...inspectorProps({ fieldId: `ctaCollection.${index}` })}
                >
                  <ModalCtaButton
                    cta={cta}
                    variant={getButtonVariant(index, totalButtons, defaultVariant)}
                  />
                </div>
              );
            })}
        </Box>
      </Box>
    </Box>
  );

  const DefaultSectionHeading = () => (
    <Box
      cols={cols}
      gap={gap}
      {...inspectorProps({ fieldId: 'heading' })}
      className={isDarkMode ? 'dark' : ''}
    >
      {/* overline and title */}
      <Box
        direction="col"
        gap={{ base: 2, md: 4 }}
        className={cn(
          'col-span-2 max-w-[600px]',
          !hasCtaCollection && 'max-w-5xl',
          hasSolutionItems && 'max-w-[32.3rem]'
        )}
      >
        {sectionHeading.overline && (
          <p className="text-foreground uppercase" {...inspectorProps({ fieldId: 'overline' })}>
            {sectionHeading.overline}
          </p>
        )}
        {componentType === 'banner-hero' ? (
          <h1
            className="text-display-lg text-foreground leading-tight"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {sectionHeading.title}
          </h1>
        ) : (
          <h2
            className="text-headline-md text-foreground leading-tight"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {sectionHeading.title}
          </h2>
        )}
        {sectionHeading.description &&
          (hasMarkdown(sectionHeading.description) ? (
            <MarkdownRenderer
              content={sectionHeading.description}
              className="text-foreground"
              forceLeftAlign={true}
              {...inspectorProps({ fieldId: 'description' })}
            />
          ) : (
            <p className="text-foreground" {...inspectorProps({ fieldId: 'description' })}>
              {sectionHeading.description}
            </p>
          ))}
      </Box>

      {/* cta */}
      <Box
        gap={2}
        {...inspectorProps({ fieldId: 'heading' })}
        className={cn('col-span-1 items-end xl:ml-auto', {
          'items-center': componentType === 'content'
        })}
      >
        {hasCtaCollection &&
          sectionHeading.ctaCollection?.items?.map((cta, index) => {
            const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
            const defaultVariant =
              totalButtons === 1 ? 'primary' : index === 0 ? 'primary' : 'outline';

            return (
              <div
                key={cta.sys?.id || index}
                {...inspectorProps({ fieldId: `ctaCollection.${index}` })}
              >
                <ModalCtaButton
                  cta={cta}
                  variant={getButtonVariant(index, totalButtons, defaultVariant)}
                />
              </div>
            );
          })}
      </Box>
    </Box>
  );

  return (
    <>
      {(() => {
        switch (sectionHeading?.variant) {
          case 'Horizontal':
            return <HorizontalSectionHeading />;
          case 'Stacked':
            return <StackedSectionHeading />;
          case 'Centered':
            return <CenteredSectionHeading />;
          default:
            return <DefaultSectionHeading />;
        }
      })()}
    </>
  );
}
