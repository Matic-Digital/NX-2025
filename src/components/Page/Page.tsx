/**
 * Page Component
 *
 * This component renders a page based on content from Contentful. It displays
 * a page title, description, and dynamically renders page content components based on the content structure defined in Contentful.
 *
 * The component is integrated with Contentful's Live Preview functionality,
 * allowing content editors to see real-time updates in the preview environment.
 * It uses the Contentful Inspector Mode to highlight editable fields directly
 * in the UI for a seamless content editing experience.
 *
 * Features:
 * - Dynamic rendering of page content components
 * - SEO-friendly page structure with semantic HTML
 * - Contentful Live Preview integration
 * - Support for various content types through the pageContentCollection
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

// Import content components for dynamic rendering
import { BannerHero } from '@/components/BannerHero/BannerHero';
import { Content } from '@/components/Content/Content';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { RegionsMap } from '@/components/Region/RegionsMap';
import { RegionStats } from '@/components/RegionStats/RegionStats';
import { Slider } from '@/components/Slider/Slider';

import type { Footer as FooterType } from '@/components/Footer/FooterSchema';
import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Image as ImageType } from '@/components/Image/ImageSchema';

interface PageProps {
  sys: {
    id: string;
  };
  title?: string;
  slug?: string;
  description?: string;
  header?: HeaderType | null;
  footer?: FooterType | null;
  pageContentCollection?: {
    items: Array<{
      sys: {
        id: string;
      };
      title?: string;
      description?: string;
      __typename?: string;
    }>;
  };
  __typename?: string; // Add typename for GraphQL identification
  openGraphImage?: ImageType;
  seoTitle?: string;
  seoDescription?: string;
  // Add optional parentPageList prop to indicate if this page belongs to a PageList
  parentPageList?: {
    slug?: string;
    title?: string;
  };
}

/**
 * Page component that displays a title, description, and optional content
 * Supports Contentful Live Preview for real-time updates
 */
export function Page(props: PageProps) {
  // Always call hooks at the top level, before any conditional returns
  // Use the Contentful Live Updates hook to get real-time updates
  const page = useContentfulLiveUpdates<PageProps>(props);

  // Use the Contentful Inspector Mode hook for field tagging
  // Use optional chaining to safely access nested properties
  const inspectorProps = useContentfulInspectorMode({
    entryId: page?.sys?.id || ''
  });

  // Create a client-side effect to add classes to the body for hiding default header/footer
  // Only run this effect on the client side
  const isClient = typeof window !== 'undefined';

  // Always call hooks unconditionally at the top level
  React.useEffect(() => {
    // Early return if not client-side, but keep the hook call unconditional
    if (!isClient) return;

    // We need to check if page.header and page.footer exist before using them
    // to avoid potential errors if page is invalid
    if (page?.header) {
      document.body.classList.add('page-has-header');
    }
    if (page?.footer) {
      document.body.classList.add('page-has-footer');
    }

    return () => {
      document.body.classList.remove('page-has-header', 'page-has-footer');
    };
  }, [page?.header, page?.footer, isClient]);

  // Add a check to ensure props has the required structure
  // This check comes AFTER all hook calls to comply with the rules of hooks
  if (!page?.sys?.id) {
    return null;
  }

  return (
    <div className="page-component">
      {/* Render Page Content */}
      <div {...inspectorProps({ fieldId: 'pageContentCollection' })}>
        {page.pageContentCollection?.items && page.pageContentCollection.items.length > 0 && (
          <div className="page-content">
            {page.pageContentCollection.items.map((content, index) => {
              const key = content.sys?.id || index;

              try {
                switch (content.__typename) {
                  case 'BannerHero':
                    return <BannerHero key={key} {...(content as any)} />;

                  case 'Content':
                    return <Content key={key} {...(content as any)} />;

                  case 'ContentGrid':
                    return <ContentGrid key={key} {...(content as any)} />;

                  case 'CtaBanner':
                    return <CtaBanner key={key} {...(content as any)} />;

                  case 'CtaGrid':
                    return <CtaGrid key={key} {...(content as any)} />;

                  case 'ImageBetween':
                    return <ImageBetween key={key} {...(content as any)} />;

                  case 'Slider':
                    return <Slider key={key} {...(content as any)} />;

                  case 'RegionsMap':
                    return <RegionsMap key={key} {...(content as any)} />;

                  case 'RegionStats':
                    return <RegionStats key={key} {...(content as any)} />;

                  default:
                    return (
                      <div key={key} className="mb-12">
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Unsupported Content Type:</strong> {content.__typename}
                          </p>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-yellow-600">
                              Debug Info
                            </summary>
                            <pre className="mt-1 text-xs text-yellow-600">
                              {JSON.stringify(content, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    );
                }
              } catch (_error) {
                return (
                  <div key={key} className="mb-12">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-800">
                        <strong>Render Error:</strong> {content.__typename}
                      </p>
                      <p className="mt-1 text-xs text-red-600">
                        {_error instanceof Error ? _error.message : 'Unknown error'}
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
