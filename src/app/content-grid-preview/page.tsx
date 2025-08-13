/**
 * ContentGrid Preview Page
 *
 * This page enables content editors to preview ContentGrid components directly from Contentful's
 * preview environment. It fetches ContentGrid content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of ContentGrid content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid ContentGrid IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Full ContentGrid functionality with all item types and layouts
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getContentGridById } from '@/lib/contentful-api/content-grid';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box, Main } from '@/components/global/matic-ds';
import { ContentGrid } from '@/components/ContentGrid';
import type { ContentGrid as ContentGridType } from '@/types/contentful';

/**
 * ContentGrid Preview Page
 * This page is used for previewing ContentGrid content from Contentful
 * It fetches the ContentGrid by ID from the query parameters
 */

// Loading component for Suspense fallback
function ContentGridPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading ContentGrid preview...</p>
      </Box>
    </Container>
  );
}

// ContentGrid Preview Component that renders the full content grid
interface ContentGridPreviewComponentProps {
  contentGrid: ContentGridType;
}

const ContentGridPreviewComponent = ({ contentGrid }: ContentGridPreviewComponentProps) => {
  const updatedContentGrid = useContentfulLiveUpdates(contentGrid);
  const inspectorProps = useContentfulInspectorMode({ entryId: updatedContentGrid?.sys?.id });

  if (!updatedContentGrid?.itemsCollection?.items?.length) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">No ContentGrid Items</h1>
          <p>This content grid doesnt have any items to display.</p>
        </Box>
      </Container>
    );
  }

  return (
    <div {...inspectorProps({ fieldId: 'contentGrid' })}>
      <ContentGrid {...updatedContentGrid} />
    </div>
  );
};

// Inner component that uses useSearchParams
function ContentGridPreviewContent() {
  const searchParams = useSearchParams();
  const contentGridId = searchParams?.get('id') ?? '';
  const [contentGrid, setContentGrid] = useState<ContentGridType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveContentGrid = useContentfulLiveUpdates(contentGrid);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveContentGrid?.sys?.id });

  useEffect(() => {
    async function fetchContentGrid() {
      if (!contentGridId) {
        setIsLoading(false);
        setError(new Error('No ContentGrid ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedContentGrid = await getContentGridById(contentGridId, true);
        setContentGrid(fetchedContentGrid);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching ContentGrid:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch ContentGrid'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchContentGrid();
  }, [contentGridId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading ContentGrid preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching ContentGrid: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {contentGridId}</p>
        </Box>
      </Container>
    );
  } else if (!contentGrid || !liveContentGrid) {
    return (
      <Container>
        <Box className="py-12">
          <p className="text-gray-600">ContentGrid with ID &apos;{contentGridId}&apos; not found</p>
          <p>No ContentGrid found with ID: {contentGridId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Main>
        <div className="pt-20 pb-20" {...inspectorProps({ fieldId: 'contentGrid' })}>
          <ContentGridPreviewComponent contentGrid={liveContentGrid} />
        </div>
      </Main>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>ContentGrid Preview</p>
        <p className="text-xs opacity-75">ID: {liveContentGrid?.sys.id}</p>
        <p className="text-xs opacity-75">
          Items: {liveContentGrid?.itemsCollection?.items?.length || 0}
        </p>
        <p className="text-xs opacity-75">
          Dark Mode: {liveContentGrid?.isDarkMode ? 'Yes' : 'No'}
        </p>
      </div>
    </>
  );
}

export default function ContentGridPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<ContentGridPreviewLoading />}>
        <ContentGridPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
