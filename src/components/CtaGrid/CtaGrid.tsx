'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import Link from 'next/link';
import { getCtaGridById } from '@/components/CtaGrid/CtaGridApi';
import type { CtaGrid } from '@/components/CtaGrid/CtaGridSchema';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { AirImage } from '@/components/media/AirImage';
import { Button } from '@/components/ui/button';
import { Box, Container } from '@/components/global/matic-ds';
import { resolveNestedUrls } from '@/lib/page-link-utils';

export function CtaGrid(props: CtaGrid) {
  const [ctaGrid, setCtaGrid] = useState<CtaGrid>(props);
  const liveCtaGrid = useContentfulLiveUpdates(ctaGrid);
  const [loading, setLoading] = useState(true);
  const [productUrls, setProductUrls] = useState<Record<string, string>>({});
  const inspectorProps = useContentfulInspectorMode({ entryId: liveCtaGrid?.sys?.id });
  const variant = liveCtaGrid.variant || 'ContentRight';

  useEffect(() => {
    const fetchCtaGrid = async () => {
      try {
        const response = await getCtaGridById(props.sys.id);
        if (response.item) {
          setCtaGrid(response.item);
        } else {
        }
      } catch (error) {
        console.error('Error fetching CtaGrid:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCtaGrid();
  }, [props.sys.id]);

  // Generate correct URLs for Products by looking up their parent PageList
  // PageList Nesting Integration: Dynamically resolve all CTA URLs to respect nesting hierarchy
  // This ensures all CTA grid items link to proper nested URLs when parent PageLists exist
  useEffect(() => {
    const fetchNestedUrls = async () => {
      const ctaItems = liveCtaGrid.ctaCollection?.items || [];
      const urlMap = await resolveNestedUrls(ctaItems, (cta) => ({
        sys: cta.sys,
        internalLink: cta.internalLink,
        externalLink: cta.externalLink
      }));
      setProductUrls(urlMap);
      console.log('✅ CtaGrid productUrls:', urlMap);
    };

    void fetchNestedUrls();
  }, [liveCtaGrid.ctaCollection?.items]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Loading CtaGrid...</div>
      </div>
    );
  }

  // If no content, show a message
  if (!liveCtaGrid?.sys) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">No CtaGrid found</div>
        <div className="mt-2 text-sm text-gray-500">
          {ctaGrid
            ? `CtaGrid exists but liveCtaGrid is invalid: ${JSON.stringify(ctaGrid).substring(0, 100)}...`
            : 'No CtaGrid data'}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Container className="!p-0">
        {variant === 'ContentCenter' ? (
          // ContentCenter: Full width image with centered content overlay
          <div className="relative min-h-[600px]">
            <AirImage
              link={liveCtaGrid.asset?.link}
              altText={liveCtaGrid.asset?.altText}
              className="absolute inset-0 h-full w-full object-cover"
              priority
            />
            <div className="relative flex h-full min-h-[600px] items-center justify-center">
              <div className="max-w-2xl p-10 text-center text-white">
                <Box direction="col" gap={6}>
                  {liveCtaGrid.itemsCollection?.items?.map((item, index) => (
                    <div key={item.sys?.id || index} className="space-y-3">
                      <h3 className="text-headline-lg leading-tight">{item.heading}</h3>
                      <p className="text-body-sm leading-relaxed opacity-90">{item.description}</p>
                    </div>
                  ))}
                </Box>
                {/* CTA Button */}
                {liveCtaGrid.ctaCollection?.items?.length > 0 && (
                  <div className="mt-8">
                    {liveCtaGrid.ctaCollection.items.map((cta, index) => {
                      const isProduct = cta.internalLink?.__typename === 'Product';
                      return (
                        <Button
                          key={cta.sys?.id ?? index}
                          variant="white"
                          {...inspectorProps({ fieldId: 'ctaCollection' })}
                          asChild
                        >
                          {cta.internalLink ? (
                            <Link
                              href={
                                isProduct
                                  ? (productUrls[cta.internalLink.sys.id] ??
                                    `/products/${cta.internalLink.slug}`)
                                  : `/${cta.internalLink.slug}`
                              }
                            >
                              {cta.text ?? cta.internalText}
                            </Link>
                          ) : cta.externalLink ? (
                            <a href={cta.externalLink} target="_blank" rel="noopener noreferrer">
                              {cta.text ?? cta.internalText}
                            </a>
                          ) : (
                            <span>{cta.text ?? cta.internalText}</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // ContentLeft or ContentRight: Side-by-side layout using CSS order
          <Box direction="col" gap={5} cols={{ base: 1, xl: 4 }} className="min-h-[600px]">
            {/* Content Section */}
            <Box
              direction="col"
              gap={8}
              className={`bg-subtle order-2 col-span-1 h-full p-10 xl:col-span-1 ${
                variant === 'ContentLeft' ? 'xl:order-1' : 'xl:order-2'
              }`}
            >
              {/* Content Grid Items */}
              <Box direction="col" gap={6} className="flex-1 justify-end">
                {liveCtaGrid.itemsCollection?.items?.map((item, index) => (
                  <div key={item.sys?.id || index} className="space-y-3">
                    <h3 className="text-body-sm leading-[160%] tracking-[0.01em]">
                      {item.heading}
                    </h3>
                    <p className="text-body-xxs text-text-subtle leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </Box>
              {/* CTA Button */}
              {liveCtaGrid.ctaCollection?.items?.length > 0 && (
                <div className="mt-auto">
                  {liveCtaGrid.ctaCollection.items.map((cta, index) => {
                    const isProduct = cta.internalLink?.__typename === 'Product';
                    console.log('✅ Full CTA object:', cta.internalLink);
                    return (
                      <Button
                        key={cta.sys?.id ?? index}
                        variant="primary"
                        {...inspectorProps({ fieldId: 'ctaCollection' })}
                        asChild
                      >
                        {cta.internalLink ? (
                          <Link
                            href={
                              isProduct
                                ? (productUrls[cta.internalLink.sys.id] ??
                                  `/products/${cta.internalLink.slug}`)
                                : `/${cta.internalLink.slug}`
                            }
                          >
                            {cta.text ?? cta.internalText}
                          </Link>
                        ) : cta.externalLink ? (
                          <a href={cta.externalLink} target="_blank" rel="noopener noreferrer">
                            {cta.text ?? cta.internalText}
                          </a>
                        ) : (
                          <span>{cta.text ?? cta.internalText}</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </Box>

            {/* Image Section */}
            <div
              className={`relative order-1 col-span-1 xl:col-span-3 ${
                variant === 'ContentLeft' ? 'xl:order-2' : 'xl:order-1'
              }`}
            >
              <AirImage
                link={liveCtaGrid.asset?.link}
                altText={liveCtaGrid.asset?.altText}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </Box>
        )}
      </Container>
    </ErrorBoundary>
  );
}
