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

'use client';

import React from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import { Header } from './Header';
import { Footer } from './Footer';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Footer as FooterType } from '@/types/contentful/Footer';

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
    console.error('Page component received invalid props:', props);
    return null;
  }

  console.log('Page props:', props);
  console.log('Live updated page:', page);

  return (
    <div className="page-component">
      {/* Render the page-specific header if available */}
      {page.header && (
        <div
          {...inspectorProps({ fieldId: 'header' })}
          className="page-specific-header"
          data-component-type="Page Header"
        >
          <Header {...page.header} />
        </div>
      )}

      <Container className="py-16 md:py-24">
        <Box className="flex-col items-start">
          {page.title && (
            <h1
              className="text-headline-md sm:text-headline-lg mb-6 max-w-4xl font-bold tracking-tight"
              {...inspectorProps({ fieldId: 'title' })}
            >
              {page.title}
            </h1>
          )}

          {page.description && (
            <p
              className="text-muted-foreground mb-8 max-w-2xl text-lg md:text-xl"
              {...inspectorProps({ fieldId: 'description' })}
            >
              {page.description}
            </p>
          )}

          {page.slug && (
            <div className="text-muted-foreground mb-8 text-sm">
              <span className="font-medium">Slug: </span>
              <span {...inspectorProps({ fieldId: 'slug' })}>
                {page.parentPageList?.slug ? `${page.parentPageList.slug}/${page.slug}` : page.slug}
              </span>
            </div>
          )}

          {/* Add a link to the page */}
          {page.slug && (
            <div className="mt-4">
              <a
                href={
                  page.parentPageList?.slug
                    ? `/${page.parentPageList.slug}/${page.slug}`
                    : `/${page.slug}`
                }
                className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                View Page
              </a>
            </div>
          )}
        </Box>
      </Container>

      {/* Render Page Content */}
      <div {...inspectorProps({ fieldId: 'pageContentCollection' })}>
        {page.pageContentCollection?.items && page.pageContentCollection.items.length > 0 && (
          <div className="page-content">
            {page.pageContentCollection.items.map((content, index) => {
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

      {/* Render the page-specific footer if available */}
      {page.footer && (
        <div
          {...inspectorProps({ fieldId: 'footer' })}
          className="page-specific-footer"
          data-component-type="Page Footer"
        >
          <Footer {...page.footer} />
        </div>
      )}
    </div>
  );
}
