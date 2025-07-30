'use client';

import React from 'react';
import { Box } from '@/components/global/matic-ds';
import { Page } from '@/components/global/Page';
import type { Page as PageType } from '@/types/contentful';

interface PagePreviewContentProps {
  pageData: PageType | null;
  pageSlug: string;
  error: string | null;
  isDraftMode: boolean;
}

/**
 * Client component for rendering page preview content
 * This component handles the styling and rendering of the page preview
 */
export function PagePreviewContent({
  pageData,
  pageSlug,
  error,
  isDraftMode
}: PagePreviewContentProps) {
  return (
    <Box direction="col" gap={8} className="min-h-screen">
      {/* Small indicator that this is a preview - positioned to not interfere with the page content */}
      <div className="fixed right-4 bottom-4 z-50 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Page Preview: {pageSlug}</p>
        <p>{isDraftMode ? 'Draft mode enabled' : 'Draft mode disabled'}</p>
      </div>

      {/* Error Message */}
      {error && (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-body-xs font-medium text-red-800">Error Loading Page</h3>
                <div className="text-body-xs mt-2 text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* No Page Slug Provided */}
      {!pageSlug && !error && (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-body-xs font-medium text-yellow-800">No Page Slug Provided</h3>
                <div className="text-body-xs mt-2 text-yellow-700">
                  <p>
                    Please provide a page slug in the URL query parameters (e.g.,
                    ?slug=your-page-slug).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* Page Component */}
      {pageData ? (
        <div className="page-preview-container rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="mb-2 text-center text-xs text-gray-500">Page Preview</div>
          <style jsx>{`
            /* Override layout styles for preview */
            .page-preview-container {
              position: relative;
              z-index: 50;
            }

            /* Hide default header and footer in preview mode */
            :global(body.page-has-header #default-navbar),
            :global(body.page-has-footer #default-footer) {
              display: none !important;
            }

            /* Style the page-specific header and footer in preview */
            :global(.page-specific-header),
            :global(.page-specific-footer) {
              border: 1px dashed #cbd5e1;
              margin: 8px 0;
              padding: 8px;
              position: relative;
            }

            :global(.page-specific-header::before),
            :global(.page-specific-footer::before) {
              content: attr(data-component-type);
              position: absolute;
              top: -10px;
              left: 10px;
              background: #f1f5f9;
              padding: 0 5px;
              font-size: 10px;
              color: #64748b;
            }
          `}</style>
          <Page {...pageData} />
        </div>
      ) : (
        <Box className="mx-auto max-w-7xl px-4">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-body-xs font-medium text-yellow-800">No Page Data Found</h3>
                <div className="text-body-xs mt-2 text-yellow-700">
                  <p>
                    No page data was found for slug: {pageSlug}. Make sure the slug exists in
                    Contentful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}
    </Box>
  );
}
