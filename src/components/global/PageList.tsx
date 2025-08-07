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
import { Container, Box } from '@/components/global/matic-ds';
import { Page } from './Page';

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

  // Add a check to ensure props has the required structure
  if (!pageList?.sys?.id) {
    console.error('PageList component received invalid props:', props);
    return null;
  }

  console.log('PageList props:', props);
  console.log('Live updated pageList:', pageList);

  return (
    <div className="page-list-component">
      <Container className="py-16 md:py-24">
        <Box className="flex-col items-start">
          {pageList.title && (
            <h1
              className="text-headline-md sm:text-headline-lg mb-6 max-w-4xl font-bold tracking-tight"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {pageList.title}
            </h1>
          )}

          {pageList.slug && (
            <div className="text-muted-foreground mb-8 text-sm">
              <span className="font-medium">Slug: </span>
              <span {...inspectorProps({ fieldId: 'slug' })}>{pageList.slug}</span>
            </div>
          )}
        </Box>
      </Container>

      {/* Render Pages */}
      <div {...inspectorProps({ fieldId: 'pagesCollection' })}>
        {pageList.pagesCollection?.items && pageList.pagesCollection.items.length > 0 && (
          <div className="page-list-content">
            {pageList.pagesCollection.items.map((content, index) => {
              if (content.__typename === 'Page') {
                // Pass the parent PageList slug to the Page component
                return (
                  <div key={content.sys.id || index} className="mb-12">
                    <Page
                      {...content}
                      // Add a custom prop to indicate this page belongs to a PageList
                      parentPageList={{
                        slug: pageList.slug,
                        title: pageList.title
                      }}
                    />
                  </div>
                );
              }

              // Default case if content type is not recognized
              return (
                <div key={content.sys.id || index} className="mb-12">
                  <p className="text-sm text-gray-500">
                    Unknown content type: {content.__typename}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
