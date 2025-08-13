import { Suspense } from 'react';
import { draftMode } from 'next/headers';
import { ContentfulLivePreview } from '@contentful/live-preview';
import { getHeaderById } from '@/lib/contentful-api/header';
import { Header } from '@/components/global/Header';

interface HeaderPreviewPageProps {
  searchParams: Promise<{ id?: string }>;
}

async function HeaderPreviewContent({ id }: { id: string }) {
  const { isEnabled } = await draftMode();

  try {
    const header = await getHeaderById(id, isEnabled);

    if (!header) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Header Not Found</h1>
            <p className="mt-2 text-gray-600">The header with ID {id} could not be found.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Centered navbar display */}
        <div className="flex min-h-[calc(100vh-60px)] items-center justify-center p-8">
          <div className="w-full max-w-6xl">
            <Header {...header} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in Header preview:', error);

    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Preview Error</h1>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
          <p className="text-gray-600">Header with ID &quot;{id}&quot; not found</p>
        </div>
      </div>
    );
  }
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading header preview...</p>
      </div>
    </div>
  );
}

export default async function HeaderPreviewPage({ searchParams }: HeaderPreviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Missing Header ID</h1>
          <p className="mt-2 text-gray-600">Please provide a header ID in the URL parameters.</p>
        </div>
      </div>
    );
  }

  // Initialize Contentful Live Preview
  if (typeof window !== 'undefined') {
    void ContentfulLivePreview.init({
      locale: 'en-US',
      enableInspectorMode: true,
      enableLiveUpdates: true
    });
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HeaderPreviewContent id={id} />
    </Suspense>
  );
}
