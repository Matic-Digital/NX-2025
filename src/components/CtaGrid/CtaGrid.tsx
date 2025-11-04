'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { resolveNestedUrls } from '@/lib/page-link-utils';

import { Button } from '@/components/ui/button';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Box, Container } from '@/components/global/matic-ds';

import { getCtaGridById } from '@/components/CtaGrid/CtaGridApi';
import { AirImage } from '@/components/Image/AirImage';

import type { CtaGrid } from '@/components/CtaGrid/CtaGridSchema';

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
        }
      } catch (error) {
        console.warn('Error in catch block:', error);
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
      const ctaItems = liveCtaGrid.ctaCollection?.items ?? [];
      const urlMap = await resolveNestedUrls(ctaItems, (cta) => ({
        sys: cta.sys,
        internalLink: cta.internalLink,
        externalLink: cta.externalLink
      }));
      setProductUrls(urlMap);
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
                      <h3
                        className="leading-[130%]"
                        style={{ fontSize: '1.75rem', fontStyle: 'normal', fontWeight: 400 }}
                      >
                        {item.heading}
                      </h3>
                      <p className="text-body-sm leading-relaxed opacity-90">{item.description}</p>
                    </div>
                  ))}
                </Box>
                {/* CTA Button */}
                {(liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0 && (
                  <div className="mt-8">
                    {liveCtaGrid.ctaCollection?.items?.map((cta, index) => {
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
          // Mobile: Overlay style, Desktop: Side-by-side layout using CSS Grid
          <>
            {/* CTA Button - Mobile only: above image */}
            {(liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0 && (
              <div className="mb-6 flex justify-center px-6 sm:px-6 md:px-9 xl:hidden">
                {liveCtaGrid.ctaCollection?.items?.map((cta, index) => {
                  const isProduct = cta.internalLink?.__typename === 'Product';
                  return (
                    <Button
                      key={cta.sys?.id ?? index}
                      variant="outline"
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

            {/* Mobile: Image overlay layout, Desktop: CSS Grid layout */}
            <div className="xl:hidden">
              {/* Mobile Image and Content Container */}
              <div className="relative min-h-[43.6rem]">
                {/* Background Image - Full container on mobile */}
                <div className="absolute inset-0 overflow-hidden">
                  <AirImage
                    link={liveCtaGrid.asset?.link}
                    altText={liveCtaGrid.asset?.altText}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>

                {/* Content Overlay - Mobile: conditional styling based on CTA presence */}
                <div
                  className={`absolute inset-0 flex ${
                    (liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0
                      ? 'items-end px-6 sm:px-6 md:px-9'
                      : 'items-end'
                  }`}
                >
                  <div
                    className={`w-full ${(liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0 ? 'pb-4' : ''}`}
                  >
                    <Box
                      direction="col"
                      gap={(liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0 ? 4 : 6}
                      className="w-full"
                    >
                      {/* Content Grid Items */}
                      {liveCtaGrid.itemsCollection?.items?.map((item, index) => (
                        <div
                          key={item.sys?.id || index}
                          className={`space-y-3 ${
                            (liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0
                              ? 'p-6 backdrop-blur-[14px]'
                              : 'bg-subtle p-10'
                          }`}
                          style={
                            (liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0
                              ? {
                                  background:
                                    'linear-gradient(198deg, rgba(8, 8, 15, 0.16) -1.13%, rgba(8, 8, 15, 0.52) 99.2%), linear-gradient(198deg, rgba(8, 8, 15, 0.06) -1.13%, rgba(8, 8, 15, 0.20) 99.2%)'
                                }
                              : {}
                          }
                        >
                          <h3
                            className={`leading-[130%] ${
                              (liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0
                                ? 'text-text-on-invert'
                                : ''
                            }`}
                            style={{ fontSize: '1.75rem', fontStyle: 'normal', fontWeight: 400 }}
                          >
                            {item.heading}
                          </h3>
                          <div
                            className={`h-px w-full ${
                              (liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0
                                ? 'bg-white/30'
                                : 'bg-border'
                            }`}
                          ></div>
                          <p
                            className={`leading-relaxed ${
                              (liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0
                                ? 'text-body-xxs text-text-on-invert'
                                : 'text-body-sm text-text-subtle'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </Box>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Original CSS Grid Layout */}
            <div className="hidden min-h-[600px] xl:flex xl:gap-[1.25rem]">
              {/* Content Section */}
              <Box
                direction="col"
                gap={8}
                className={`bg-subtle flex-1 p-10 ${
                  variant === 'ContentLeft' ? 'order-1' : 'order-2'
                }`}
              >
                {/* Content Grid Items */}
                <Box direction="col" gap={6} className="flex-1">
                  {liveCtaGrid.itemsCollection?.items?.map((item, index) => (
                    <div key={item.sys?.id || index} className="space-y-3">
                      <h3
                        className="leading-[130%]"
                        style={{ fontSize: '1.75rem', fontStyle: 'normal', fontWeight: 400 }}
                      >
                        {item.heading}
                      </h3>
                      <div className="bg-border h-px w-full"></div>
                      <p className="text-body-sm text-text-subtle leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </Box>
                {/* CTA Button */}
                {(liveCtaGrid.ctaCollection?.items?.length ?? 0) > 0 && (
                  <div className="mt-auto">
                    {liveCtaGrid.ctaCollection?.items?.map((cta, index) => {
                      const isProduct = cta.internalLink?.__typename === 'Product';
                      return (
                        <Button
                          key={cta.sys?.id ?? index}
                          variant="outline"
                          {...inspectorProps({ fieldId: 'ctaCollection' })}
                          className="hover:bg-primary hover:text-white hover:border-primary"
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
                className={`relative max-w-[56.75rem] flex-shrink-0 ${variant === 'ContentLeft' ? 'order-2' : 'order-1'}`}
              >
                <AirImage
                  link={liveCtaGrid.asset?.link}
                  altText={liveCtaGrid.asset?.altText}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </>
        )}
      </Container>
    </ErrorBoundary>
  );
}
