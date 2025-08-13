import { Suspense } from 'react';
import { draftMode } from 'next/headers';
import { ContentfulLivePreview } from '@contentful/live-preview';
import { getFooterById } from '@/lib/contentful-api/footer';
import { Footer } from '@/components/global/Footer';

interface FooterPreviewPageProps {
  searchParams: Promise<{ id?: string }>;
}

async function FooterPreviewContent({ id }: { id: string }) {
  const { isEnabled } = await draftMode();

  try {
    const footer = await getFooterById(id, isEnabled);

    if (!footer) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Footer Not Found</h1>
            <p className="mt-2 text-gray-600">The footer with ID {id} could not be found.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Centered footer display */}
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-6xl">
            <Footer {...footer} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in Footer preview:', error);

    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Preview Error</h1>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
          <p className="text-gray-600">Footer with ID &quot;{id}&quot; not found</p>
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
        <p className="mt-4 text-gray-600">Loading footer preview...</p>
      </div>
    </div>
  );
}

export default async function FooterPreviewPage({ searchParams }: FooterPreviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Missing Footer ID</h1>
          <p className="mt-2 text-gray-600">Please provide a footer ID in the URL parameters.</p>
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
      <FooterPreviewContent id={id} />
    </Suspense>
  );
}
