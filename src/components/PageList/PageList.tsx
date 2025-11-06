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
import { RegionsMap } from '@/components/Region/RegionsMap';
import { RegionStats } from '@/components/RegionStats/RegionStats';
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
                  // Handle nested Content structure
                  let actualContent = content;
                  let actualTypename = content.__typename;
                  
                  // If __typename is undefined but we have an 'item' key, check if it's a Content block
                  if (!actualTypename && (content as any).item && (content as any).item.__typename === 'Content') {
                    actualContent = (content as any).item;
                    actualTypename = 'Content';
                  }

                  switch (actualTypename) {
                    case 'BannerHero':
                      return <BannerHero key={key} {...(actualContent as any)} />;

                    case 'Content':
                      return <Content key={key} {...(actualContent as any)} />;

                    case 'ContentGrid':
                      return <ContentGrid key={key} {...(actualContent as any)} />;

                    case 'CtaBanner':
                      return <CtaBanner key={key} {...(actualContent as any)} />;

                    case 'CtaGrid':
                      return <CtaGrid key={key} {...(actualContent as any)} />;

                    case 'ImageBetween':
                      return <ImageBetween key={key} {...(actualContent as any)} />;

                    case 'Slider':
                      return <Slider key={key} {...(actualContent as any)} />;

                    case 'RegionsMap':
                      return <RegionsMap key={key} />;

                    case 'RegionStats':
                      return <RegionStats key={key} {...(actualContent as any)} />;

                    default:
                      return (
                        <div key={key} className="mb-12">
                          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Unsupported Content Type:</strong> {actualTypename || 'undefined'}
                            </p>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-yellow-600">
                                Debug Info
                              </summary>
                              <pre className="mt-1 text-xs text-yellow-600">
                                {JSON.stringify({ originalContent: content, actualContent, actualTypename }, null, 2)}
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
        
        {/* Debug message when no content is found */}
        {(!pageList.pageContentCollection?.items || pageList.pageContentCollection.items.length === 0) && (
          <div className="p-8 text-center">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Debug:</strong> No pageContentCollection items found for PageList
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-blue-600">
                  PageList Data
                </summary>
                <pre className="mt-1 text-xs text-blue-600">
                  {JSON.stringify(pageList, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
