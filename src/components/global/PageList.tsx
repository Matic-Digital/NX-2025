/**
 * PageList Component
 *
 * This component renders a collection of pages from Contentful. It displays
 * a list of pages with their titles, descriptions, and links, organized under
 * a common section heading. PageList is a key component for creating structured
 * content hierarchies like blogs, article collections, or product categories.
 *
 * The component is integrated with Contentful's Live Preview functionality,
 * allowing content editors to see real-time updates in the preview environment.
 * It uses the Contentful Inspector Mode to highlight editable fields directly
 * in the UI for a seamless content editing experience.
 *
 * Features:
 * - Displays a collection of related pages from Contentful
 * - Renders each page with its title, description, and link
 * - Supports nested content structures through the pagesCollection
 * - Contentful Live Preview integration for real-time updates
 */

'use client';

import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

// Import content components for dynamic rendering
import { BannerHero } from '../BannerHero';
import { Content } from '../Content';
import { ContentGrid } from '../ContentGrid';
import { CtaBanner } from '../CtaBanner';
import { CtaGrid } from '../CtaGrid';
import { ImageBetween } from '../ImageBetween';
import { Slider } from '../Slider';

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
 * Dynamic content renderer that maps Contentful content types to React components
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
function renderContentItem(content: any, index: number) {
  const key = content.sys?.id ?? index;

  // Add error boundary and validation for each content type
  try {
    console.log(`Rendering content item ${index}:`, content);

    switch (content.__typename) {
      case 'BannerHero':
        // Validate required fields for BannerHero
        if (!content.backgroundImage?.link) {
          console.warn('BannerHero missing backgroundImage.link:', content);
          return (
            <div key={key} className="mb-12">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  <strong>BannerHero Error:</strong> Missing background image data
                </p>
                <p className="mt-1 text-xs text-red-600">Content ID: {content.sys?.id}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Debug Info</summary>
                  <pre className="mt-1 overflow-auto text-xs">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          );
        }
        return <BannerHero key={key} {...content} />;

      case 'Content':
        return <Content key={key} {...content} />;

      case 'ContentGrid':
        return <ContentGrid key={key} {...content} />;

      case 'CtaBanner':
        // Validate required fields for CtaBanner
        if (!content.backgroundMedia?.link && !content.backgroundImage?.url) {
          console.warn('CtaBanner missing background media:', content);
          return (
            <div key={key} className="mb-12">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  <strong>CtaBanner Error:</strong> Missing background media
                </p>
                <p className="mt-1 text-xs text-red-600">Content ID: {content.sys?.id}</p>
              </div>
            </div>
          );
        }
        return <CtaBanner key={key} {...content} />;

      case 'CtaGrid':
        return <CtaGrid key={key} {...content} />;

      case 'ImageBetween':
        return <ImageBetween key={key} {...content} />;

      case 'Slider':
        // Validate required fields for Slider
        if (!content.sys?.id) {
          console.warn('Slider missing sys.id:', content);
          return (
            <div key={key} className="mb-12">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  <strong>Slider Error:</strong> Missing required data
                </p>
                <p className="mt-1 text-xs text-red-600">
                  The Slider component needs to be added back to the GraphQL query
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Debug Info</summary>
                  <pre className="mt-1 overflow-auto text-xs">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          );
        }
        return <Slider key={key} {...content} />;

      default:
        return (
          <div key={key} className="mb-12">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Unknown content type:</strong> {content.__typename}
              </p>
              <p className="mt-1 text-xs text-yellow-600">Content ID: {content.sys?.id}</p>
              {content.title && <p className="text-xs text-yellow-600">Title: {content.title}</p>}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs">Debug Info</summary>
                <pre className="mt-1 overflow-auto text-xs">{JSON.stringify(content, null, 2)}</pre>
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
          <p className="text-xs text-red-600">Content ID: {content.sys?.id}</p>
        </div>
      </div>
    );
  }
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

  console.log('PageList props:', props);
  console.log('Live updated pageList:', pageList);

  return (
    <div className="page-component">
      {/* Render Page Content */}
      <div {...inspectorProps({ fieldId: 'pageContentCollection' })}>
        {pageList.pageContentCollection?.items &&
          pageList.pageContentCollection.items.length > 0 && (
            <div className="page-content">
              {pageList.pageContentCollection.items.map((content, index) =>
                renderContentItem(content, index)
              )}
            </div>
          )}
      </div>
    </div>
  );
}
