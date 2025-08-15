'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import Link from 'next/link';
import { getCtaGridById } from '@/lib/contentful-api/cta-grid';
import { checkPageBelongsToPageList } from '@/lib/contentful-api/page-list';
import type { CtaGrid } from '@/types/contentful/CtaGrid';
import { ErrorBoundary } from './global/ErrorBoundary';
import { AirImage } from '@/components/media/AirImage';
import { Button } from '@/components/ui/button';
import { Box, Container } from '@/components/global/matic-ds';

export function CtaGrid(props: CtaGrid) {
  const [ctaGrid, setCtaGrid] = useState<CtaGrid>(props);
  const [loading, setLoading] = useState(true);
  const [productUrls, setProductUrls] = useState<Record<string, string>>({});
  const liveCtaGrid = useContentfulLiveUpdates(ctaGrid);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveCtaGrid?.sys?.id });

  console.log('🚀 CtaGrid props:', ctaGrid);

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
  useEffect(() => {
    const generateProductUrls = async () => {
      if (!liveCtaGrid.ctaCollection?.items) return;

      const urlMap: Record<string, string> = {};

      for (const cta of liveCtaGrid.ctaCollection.items) {
        if (cta.internalLink?.__typename === 'Product') {
          try {
            // Find the parent PageList for this Product
            const parentPageList = await checkPageBelongsToPageList(cta.internalLink.sys.id, false);
            
            if (parentPageList) {
              // Use the PageList slug + Product slug format
              urlMap[cta.internalLink.sys.id] = `/${parentPageList.slug}/${cta.internalLink.slug}`;
            } else {
              // Fallback to the old format if no parent PageList found
              console.warn(`No parent PageList found for Product: ${cta.internalLink.slug}`);
              urlMap[cta.internalLink.sys.id] = `/products/${cta.internalLink.slug}`;
            }
          } catch (error) {
            console.error(`Error finding parent PageList for Product ${cta.internalLink.slug}:`, error);
            // Fallback to the old format on error
            urlMap[cta.internalLink.sys.id] = `/products/${cta.internalLink.slug}`;
          }
        }
      }

      setProductUrls(urlMap);
    };

    void generateProductUrls();
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
        <Box direction="col" gap={5} cols={{ base: 1, xl: 4 }} className="min-h-[600px]">
          {/* Left side - Background Image */}
          <div className="relative col-span-1 xl:col-span-3">
            <AirImage
              link={liveCtaGrid.asset?.link}
              altText={liveCtaGrid.asset?.altText}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* Right side - Content */}
          <Box direction="col" gap={8} className="bg-subtle col-span-1 h-full p-10 xl:col-span-1">
            {/* Content Grid Items */}
            <Box direction="col" gap={6} className="flex-1">
              {liveCtaGrid.itemsCollection?.items?.map((item, index) => (
                <div key={item.sys?.id || index} className="space-y-3">
                  <h3 className="text-body-sm leading-[160%] tracking-[0.01em]">{item.heading}</h3>
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

                  return (
                    <Button
                      key={cta.sys?.id || index}
                      variant="primary"
                      {...inspectorProps({ fieldId: 'ctaCollection' })}
                      asChild
                    >
                      {cta.internalLink ? (
                        <Link
                          href={
                            isProduct
                              ? productUrls[cta.internalLink.sys.id] ?? `/products/${cta.internalLink.slug}`
                              : `/${cta.internalLink.slug}`
                          }
                        >
                          {cta.text || cta.internalText}
                        </Link>
                      ) : cta.externalLink ? (
                        <a href={cta.externalLink} target="_blank" rel="noopener noreferrer">
                          {cta.text || cta.internalText}
                        </a>
                      ) : (
                        <span>{cta.text || cta.internalText}</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </Box>
        </Box>
      </Container>
    </ErrorBoundary>
  );
}
