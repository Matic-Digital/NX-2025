/**
 * PageList Component
 *
 * This component renders a list of pages based on content from Contentful.
 * It displays a page list title and dynamically renders nested page content
 * components based on the content structure defined in Contentful.
 *
 * The component is integrated with Contentful's Live Preview functionality,
 * allowing content editors to see real-time updates in the preview environment.
 * It uses the Contentful Inspector Mode to highlight editable fields directly
 * in the UI for a seamless content editing experience.
 *
 * Features:
 * - Dynamic rendering of nested page content components
 * - SEO-friendly page structure with semantic HTML
 * - Contentful Live Preview integration
 * - Support for various content types through nested page content collections
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

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
import { Slider } from '@/components/Slider/Slider';

interface PageListProps {
  sys: {
    id: string;
  };
  title?: string;
  slug?: string;
  pagesCollection?: {
    items: Array<{
      sys: {
        id: string;
      };
      title?: string;
      slug?: string;
      description?: string;
      __typename?: string;
    }>;
  };
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
  __typename?: string;
}

/**
 * PageList component that displays a list of pages
 * Supports Contentful Live Preview for real-time updates
 */
export function PageList(props: PageListProps) {
  // Use the Contentful Live Updates hook to get real-time updates
  const pageList = useContentfulLiveUpdates<PageListProps>(props);

  // Use the Contentful Inspector Mode hook for field tagging
  const inspectorProps = useContentfulInspectorMode({
    entryId: pageList?.sys?.id || ''
  });

  return (
    <div className="page-component">
      {/* Render Page Content */}
      <div {...inspectorProps({ fieldId: 'pageContentCollection' })}>
        {pageList.pageContentCollection?.items &&
          pageList.pageContentCollection.items.length > 0 && (
            <div className="page-content">
              {pageList.pageContentCollection.items.map((content, index) => {
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
                } catch (error) {
                  console.error(`Error rendering content item ${index}:`, error, content);
                  return (
                    <div key={key} className="mb-12">
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800">
                          <strong>Render Error:</strong> {content.__typename}
                        </p>
                        <p className="mt-1 text-xs text-red-600">
                          {error instanceof Error ? error.message : 'Unknown error'}
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
