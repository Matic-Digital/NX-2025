'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

// Utils
import { cn } from '@/lib/utils';

// Components
import { Box } from '@/components/global/matic-ds';

import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import { RequestAQuoteModal } from '@/components/Modals/RequestAQuoteModal';
import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
import { SectionHeadingSkeleton } from '@/components/SectionHeading/SectionHeadingSkeleton';
import { SECTION_HEADING_VARIANTS } from '@/components/SectionHeading/SectionHeadingVariants';

// Types
import type { SectionHeading, SectionHeadingVariant } from './SectionHeadingSchema';
import type { Modal } from '@/components/Modals/Modal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModal, setSelectedModal] = useState<Modal | null>(null);

  const handleModalOpen = (modal: Modal, _modalType: 'quote' | 'support') => {
    setSelectedModal(modal);
    setModalOpen(true);
  };

  // Fetch data if sectionHeadingId is provided
  useEffect(() => {
    if (!sectionHeadingId) return;

    async function fetchSectionHeading() {
      try {
        setLoading(true);
        const data = await getSectionHeadingById(sectionHeadingId ?? '', false);
        setFetchedData(data);
      } catch (err) {
        console.error('Failed to fetch section heading:', err);
        setError(err instanceof Error ? err.message : 'Failed to load section heading');
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

  const HorizontalSectionHeading = () => (
    <Box
      gap={hasCtaCollection ? { base: 4, md: 12 } : 6}
      direction={{ base: 'col', md: 'row' }}
      cols={{ base: 1, md: 2, xl: 3 }}
      className="items-end"
      {...inspectorProps({ fieldId: 'heading' })}
    >
      {/* title */}
      <h2
        className="text-foreground lg:text-display-lg col-span-2 w-full max-w-sm text-[56px] leading-[100%] tracking-[-1.1px] md:max-w-lg lg:max-w-3xl"
        {...inspectorProps({ fieldId: 'heading.title' })}
      >
        {sectionHeading.title}
      </h2>

      {/* cta */}
      <Box
        direction={hasCtaCollection ? 'col' : 'row'}
        gap={8}
        {...inspectorProps({ fieldId: 'heading' })}
        className="col-span-2 w-full max-w-sm lg:max-w-md xl:col-span-1 xl:ml-auto xl:max-w-lg xl:items-end"
      >
        {sectionHeading.description && (
          <p
            {...inspectorProps({ fieldId: 'heading.description' })}
            className="text-body-md lg:text-body-lg text-foreground w-full xl:text-right"
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
            sectionHeading.ctaCollection?.items?.map((cta, index) => {
              const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
              const defaultVariant =
                totalButtons === 1 ? 'primary' : index === 0 ? 'white' : 'primary';

              return (
                <ModalCtaButton
                  key={cta.sys?.id || index}
                  cta={cta}
                  variant={getButtonVariant(index, totalButtons, defaultVariant)}
                  onModalOpen={handleModalOpen}
                />
              );
            })}
        </Box>
      </Box>
    </Box>
  );

  const StackedSectionHeading = () => (
    <Box direction="col" gap={12} {...inspectorProps({ fieldId: 'heading' })}>
      {/* title */}
      <h2
        className="text-foreground lg:text-display-lg w-full text-[56px] leading-[100%] tracking-[-1.1px]"
        {...inspectorProps({ fieldId: 'heading.title' })}
      >
        {sectionHeading.title}
      </h2>

      {/* cta */}
      <Box
        direction={{ base: 'col', md: 'row' }}
        gap={8}
        {...inspectorProps({ fieldId: 'heading' })}
        className="w-full"
      >
        {sectionHeading.description && (
          <p
            {...inspectorProps({ fieldId: 'heading.description' })}
            className="text-body-md lg:text-body-lg text-foreground w-full max-w-2xl"
          >
            {sectionHeading.description}
          </p>
        )}

        <Box gap={3} {...inspectorProps({ fieldId: 'heading' })} className="items-end lg:ml-auto">
          {hasCtaCollection &&
            sectionHeading.ctaCollection?.items?.map((cta, index) => {
              const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
              const defaultVariant =
                totalButtons === 1 ? 'primary' : index === 0 ? 'white' : 'primary';

              return (
                <ModalCtaButton
                  key={cta.sys?.id || index}
                  cta={cta}
                  variant={getButtonVariant(index, totalButtons, defaultVariant)}
                  onModalOpen={handleModalOpen}
                />
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
      {/* title */}
      <h2
        className="text-foreground lg:text-display-md col-span-full w-full max-w-4xl text-center text-[56px] leading-[100%] tracking-[-1.1px]"
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
            className="text-body-md lg:text-body-lg text-foreground w-full max-w-2xl text-center"
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
            sectionHeading.ctaCollection?.items?.map((cta, index) => {
              const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
              const defaultVariant =
                totalButtons === 1 ? 'primary' : index === 0 ? 'white' : 'primary';

              return (
                <ModalCtaButton
                  key={cta.sys?.id || index}
                  cta={cta}
                  variant={getButtonVariant(index, totalButtons, defaultVariant)}
                  onModalOpen={handleModalOpen}
                />
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
          <p
            className="text-foreground uppercase"
            {...inspectorProps({ fieldId: 'heading.overline' })}
          >
            {sectionHeading.overline}
          </p>
        )}
        <h2
          className="text-headline-md text-foreground leading-tight"
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
          'items-center': componentType === 'content'
        })}
      >
        {hasCtaCollection &&
          sectionHeading.ctaCollection?.items?.map((cta, index) => {
            const totalButtons = sectionHeading.ctaCollection?.items?.length ?? 0;
            const defaultVariant =
              totalButtons === 1 ? 'primary' : index === 0 ? 'primary' : 'outline';

            return (
              <ModalCtaButton
                key={cta.sys?.id || index}
                cta={cta}
                variant={getButtonVariant(index, totalButtons, defaultVariant)}
                onModalOpen={handleModalOpen}
              />
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

      {selectedModal && (
        <RequestAQuoteModal
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          title={selectedModal.title ?? 'Request a Quote'}
          description={
            selectedModal.description ??
            'Please fill out the form below and we will get back to you shortly.'
          }
        />
      )}
    </>
  );
}
