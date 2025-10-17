'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container, Section } from '@/components/global/matic-ds';

import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import { CtaBannerSkeleton } from '@/components/CtaBanner/CtaBannerSkeleton';
import { AirImage } from '@/components/Image/AirImage';

import type { CtaBanner } from '@/components/CtaBanner/CtaBannerSchema';

export function CtaBanner(props: CtaBanner) {
  const ctaBanner = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: ctaBanner?.sys?.id });

  const [primaryCtaUrl, setPrimaryCtaUrl] = useState<string>('#');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch nested URL for primary CTA if it has an internal link
  // PageList Nesting Integration: Dynamically resolve CTA URLs to respect nesting hierarchy
  // This ensures CTA buttons link to proper nested URLs (e.g., /products/trackers instead of /trackers)
  useEffect(() => {
    const fetchNestedUrl = async () => {
      const primaryCta = ctaBanner.primaryCta;
      if (primaryCta?.internalLink?.slug) {
        try {
          setLoading(true);
          // Query the check-page-parent API to detect if the linked content has parent PageLists
          const response = await fetch(
            `/api/check-page-parent?slug=${primaryCta.internalLink.slug}`
          );
          if (response.ok) {
            const data = (await response.json()) as { parentPageList?: unknown; fullPath?: string };
            if (data.parentPageList && data.fullPath) {
              // Use the full nested path when parent PageLists are detected
              setPrimaryCtaUrl(`/${data.fullPath}`);
            } else {
              // Fallback to flat URL structure when no nesting is detected
              setPrimaryCtaUrl(`/${primaryCta.internalLink.slug}`);
            }
          } else {
            // Fallback to flat URL on API failure
            setPrimaryCtaUrl(`/${primaryCta.internalLink.slug}`);
          }
        } catch (error) {
          setError(error as string);
          console.error('Error fetching nested URL for primary CTA:', error);
          // Fallback to flat URL on error
          setPrimaryCtaUrl(`/${primaryCta.internalLink.slug}`);
        } finally {
          setLoading(false);
        }
      } else if (primaryCta?.externalLink) {
        setPrimaryCtaUrl(primaryCta.externalLink);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    void fetchNestedUrl();
  }, [ctaBanner.primaryCta]);

  if (loading) {
    return <CtaBannerSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Section className="relative w-full overflow-hidden">
        {/* Background gradient image */}
        <AirImage
          link={ctaBanner.backgroundMedia?.link}
          altText={ctaBanner.backgroundMedia?.altText}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Background image with fade effect */}
        <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_right,black_20%,transparent_70%)] [-webkit-mask-image:linear-gradient(to_right,black_20%,transparent_70%)]">
          <Image
            src={ctaBanner.backgroundImage.url}
            alt={ctaBanner.backgroundImage.description}
            fill
            className="object-cover"
            loading="lazy"
          />
        </div>

        <Container className="relative z-20 h-[335px]">
          <Box cols={{ base: 1, md: 4, lg: 5 }} className="h-[335px] items-center">
            <Box
              direction="col"
              gap={6}
              className="text-white max-md:items-center md:col-span-2 md:col-start-3 lg:col-span-2 lg:col-start-4"
            >
              <Box direction="col" gap={2} className="max-md:items-center">
                <h2 className="text-headline-lg" {...inspectorProps({ fieldId: 'title' })}>
                  {ctaBanner.title}
                </h2>
                <p
                  className="text-text-on-invert max-w-xs max-md:text-center lg:max-w-sm"
                  {...inspectorProps({ fieldId: 'description' })}
                >
                  {ctaBanner.description}
                </p>
              </Box>

              <Box wrap={true} gap={3} className="max-md:items-center">
                {ctaBanner.primaryCta && (
                  <Link href={primaryCtaUrl}>
                    <Button
                      variant="outlineTrasparentWhite"
                      {...inspectorProps({ fieldId: 'primaryCta' })}
                    >
                      {ctaBanner.primaryCta.text}
                    </Button>
                  </Link>
                )}
                {ctaBanner.secondaryCta && (
                  <ModalCtaButton cta={ctaBanner.secondaryCta} variant="secondary" />
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Section>
    </ErrorBoundary>
  );
}
