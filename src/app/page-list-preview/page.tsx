'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { getPageListById } from '@/lib/contentful-api/page-list';
import { PageList } from '@/components/global/PageList';
import { useSuspenseQuery } from '@tanstack/react-query';

function PageListPreviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data: pageList } = useSuspenseQuery({
    queryKey: ['pageList', id, 'preview'],
    queryFn: () => getPageListById(id!, true)
  });

  // Apply live updates and inspector mode
  const livePageList = useContentfulLiveUpdates(pageList ?? null);
  const inspectorProps = useContentfulInspectorMode({ entryId: livePageList?.sys?.id });

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">No PageList ID provided</p>
        </div>
      </div>
    );
  }

  if (!pageList) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Not Found</h1>
          <p className="text-gray-600">PageList with ID &quot;{id}&quot; not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" {...inspectorProps}>
      <PageList {...livePageList!} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading page list preview...</p>
      </div>
    </div>
  );
}

export default function PageListPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageListPreviewContent />
    </Suspense>
  );
}
