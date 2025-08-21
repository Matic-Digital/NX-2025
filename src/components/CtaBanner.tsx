'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Box, Container, Section } from '@/components/global/matic-ds';
import type { CtaBanner } from '@/types/contentful/CtaBanner';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { RequestAQuoteModal } from '@/components/global/modals/RequestAQuoteModal';
import { AirImage } from '@/components/media/AirImage';

export function CtaBanner(props: CtaBanner) {
  const ctaBanner = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: ctaBanner?.sys?.id });

  console.log('ctaBanner', ctaBanner);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [primaryCtaUrl, setPrimaryCtaUrl] = useState<string>('#');

  // Fetch nested URL for primary CTA if it has an internal link
  useEffect(() => {
    const fetchNestedUrl = async () => {
      if (ctaBanner.primaryCta?.internalLink?.slug) {
        try {
          const response = await fetch(
            `/api/check-page-parent?slug=${ctaBanner.primaryCta.internalLink.slug}`
          );
          if (response.ok) {
            const data = (await response.json()) as { parentPageList?: unknown; fullPath?: string };
            if (data.parentPageList && data.fullPath) {
              setPrimaryCtaUrl(`/${data.fullPath}`);
            } else {
              setPrimaryCtaUrl(`/${ctaBanner.primaryCta.internalLink.slug}`);
            }
          } else {
            setPrimaryCtaUrl(`/${ctaBanner.primaryCta.internalLink.slug}`);
          }
        } catch (error) {
          console.error('Error fetching nested URL for CtaBanner:', error);
          setPrimaryCtaUrl(`/${ctaBanner.primaryCta.internalLink.slug}`);
        }
      } else if (ctaBanner.primaryCta?.externalLink) {
        setPrimaryCtaUrl(ctaBanner.primaryCta.externalLink);
      }
    };

    void fetchNestedUrl();
  }, [ctaBanner.primaryCta]);

  const handleModalTrigger = () => {
    console.log('handleModalTrigger called');
    console.log(isModalOpen);
    setIsModalOpen(true);
  };

  return (
    <ErrorBoundary>
      <Section className="relative w-full overflow-hidden">
        {/* Background gradient image */}
        <AirImage
          link={ctaBanner.backgroundMedia.link}
          altText={ctaBanner.backgroundMedia.altText}
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />

        {/* Background image with fade effect */}
        <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_right,black_20%,transparent_70%)] [-webkit-mask-image:linear-gradient(to_right,black_20%,transparent_70%)]">
          <Image
            src={ctaBanner.backgroundImage.url}
            alt={ctaBanner.backgroundImage.description}
            fill
            className="object-cover"
            priority
          />
        </div>

        <Container className="relative z-20 h-[335px]">
          <Box cols={{ base: 1, md: 4, lg: 5 }} className="h-[335px] items-center">
            <Box
              direction="col"
              gap={6}
              className="text-white max-md:items-center md:col-span-2 md:col-start-3 lg:col-span-2 lg:col-start-4"
              {...inspectorProps({ fieldId: 'title' })}
            >
              <Box direction="col" gap={2} className="max-md:items-center">
                <h2 className="text-headline-lg">{ctaBanner.title}</h2>
                <p className="text-text-on-invert max-w-xs max-md:text-center lg:max-w-sm">
                  {ctaBanner.description}
                </p>
              </Box>

              <Box wrap={true} gap={3} className="max-md:items-center">
                {ctaBanner.primaryCta && (
                  <Link href={primaryCtaUrl}>
                    <Button variant="outlineWhite" {...inspectorProps({ fieldId: 'primaryCta' })}>
                      {ctaBanner.primaryCta.text}
                    </Button>
                  </Link>
                )}
                {ctaBanner.secondaryCta && (
                  <Button
                    variant="secondary"
                    {...inspectorProps({ fieldId: 'secondaryCta' })}
                    onClick={ctaBanner.secondaryCta.modal && handleModalTrigger}
                  >
                    {ctaBanner.secondaryCta.text}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Section>

      {ctaBanner.secondaryCta && (
        <RequestAQuoteModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          title={ctaBanner.secondaryCta.modal?.title ?? 'Request a Quote'}
          description={
            ctaBanner.secondaryCta.modal?.description ??
            'Please fill out the form below to request a quote.'
          }
          sys={ctaBanner.secondaryCta.modal?.sys ?? { id: 'default-modal' }}
        />
      )}
    </ErrorBoundary>
  );
}
