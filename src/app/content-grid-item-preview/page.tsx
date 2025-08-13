/**
 * ContentGridItem Preview Page
 *
 * This page enables content editors to preview ContentGridItem components directly from Contentful's
 * preview environment. It fetches ContentGridItem content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of ContentGridItem content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid ContentGridItem IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Support for both link-based and background image ContentGridItem types
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getContentGridItemById } from '@/lib/contentful-api/content-grid';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box, Main } from '@/components/global/matic-ds';
import { ContentGridItem } from '@/components/ContentGridItem';
import type { ContentGridItem as ContentGridItemType } from '@/types/contentful';

/**
 * ContentGridItem Preview Page
 * This page is used for previewing ContentGridItem content from Contentful
 * It fetches the ContentGridItem by ID from the query parameters
 */

// Loading component for Suspense fallback
function ContentGridItemPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading ContentGridItem preview...</p>
      </Box>
    </Container>
  );
}

// ContentGridItem Preview Component that renders the item
interface ContentGridItemPreviewComponentProps {
  contentGridItem: ContentGridItemType;
}

const ContentGridItemPreviewComponent = ({
  contentGridItem
}: ContentGridItemPreviewComponentProps) => {
  const updatedContentGridItem = useContentfulLiveUpdates(contentGridItem);
  const inspectorProps = useContentfulInspectorMode({ entryId: updatedContentGridItem?.sys?.id });

  return (
    <div className="mx-auto max-w-md" {...inspectorProps({ fieldId: 'contentGridItem' })}>
      <ContentGridItem {...updatedContentGridItem} />
    </div>
  );
};

// Inner component that uses useSearchParams
function ContentGridItemPreviewContent() {
  const searchParams = useSearchParams();
  const contentGridItemId = searchParams?.get('id') ?? '';
  const [contentGridItem, setContentGridItem] = useState<ContentGridItemType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveContentGridItem = useContentfulLiveUpdates(contentGridItem);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveContentGridItem?.sys?.id });

  useEffect(() => {
    async function fetchContentGridItem() {
      if (!contentGridItemId) {
        setIsLoading(false);
        setError(new Error('No ContentGridItem ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedContentGridItem = await getContentGridItemById(contentGridItemId, true);
        setContentGridItem(fetchedContentGridItem);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching ContentGridItem:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch ContentGridItem'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchContentGridItem();
  }, [contentGridItemId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading ContentGridItem preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching ContentGridItem: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {contentGridItemId}</p>
        </Box>
      </Container>
    );
  } else if (!contentGridItem || !liveContentGridItem) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">ContentGridItem Not Found</h1>
          <p>No ContentGridItem found with ID: {contentGridItemId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Main>
        <Container>
          <div className="pt-20 pb-20" {...inspectorProps({ fieldId: 'contentGridItem' })}>
            <ContentGridItemPreviewComponent contentGridItem={liveContentGridItem} />
          </div>
        </Container>
      </Main>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>ContentGridItem Preview</p>
        <p className="text-xs opacity-75">ID: {liveContentGridItem?.sys.id}</p>
        <p className="text-xs opacity-75">
          Type: {liveContentGridItem?.image ? 'Background Image' : 'Link Card'}
        </p>
      </div>
    </>
  );
}

export default function ContentGridItemPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<ContentGridItemPreviewLoading />}>
        <ContentGridItemPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
