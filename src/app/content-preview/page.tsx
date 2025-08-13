'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Content } from '@/components/Content';
import { getContentById } from '@/lib/contentful-api/content';
import { useSuspenseQuery } from '@tanstack/react-query';

function ContentPreviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data: contentData } = useSuspenseQuery({
    queryKey: ['content', id, 'preview'],
    queryFn: () => getContentById(id!, true)
  });

  const content = contentData?.item;

  // Apply live updates and inspector mode
  const liveContent = useContentfulLiveUpdates(content ?? null);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveContent?.sys?.id });

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">No Content ID provided</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Not Found</h1>
          <p className="text-gray-600">Content with ID &quot;{id}&quot; not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" {...inspectorProps}>
      <Content {...liveContent!} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading content preview...</p>
      </div>
    </div>
  );
}

export default function ContentPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContentPreviewContent />
    </Suspense>
  );
}
