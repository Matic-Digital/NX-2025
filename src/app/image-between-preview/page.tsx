'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { ImageBetween } from '@/components/ImageBetween';
import { getImageBetweenById } from '@/lib/contentful-api/image-between';
import { useSuspenseQuery } from '@tanstack/react-query';

function ImageBetweenPreviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data: imageBetween } = useSuspenseQuery({
    queryKey: ['imageBetween', id, 'preview'],
    queryFn: () => getImageBetweenById(id!, true)
  });

  // Apply live updates and inspector mode
  const liveImageBetween = useContentfulLiveUpdates(imageBetween ?? null);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveImageBetween?.sys?.id });

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">No ImageBetween ID provided</p>
        </div>
      </div>
    );
  }

  if (!imageBetween) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Not Found</h1>
          <p className="text-gray-600">ImageBetween with ID &quot;{id}&quot; not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" {...inspectorProps}>
      <ImageBetween {...liveImageBetween!} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading ImageBetween preview...</p>
      </div>
    </div>
  );
}

export default function ImageBetweenPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ImageBetweenPreviewContent />
    </Suspense>
  );
}
