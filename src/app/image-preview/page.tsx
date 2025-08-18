/**
 * Image Preview Page
 *
 * This page enables content editors to preview Image components directly from Contentful's
 * preview environment. It fetches Image content by ID from the query parameters and
 * renders it within the Contentful Live Preview context, allowing real-time updates as
 * content is edited in Contentful.
 *
 * Key features:
 * - Dynamic fetching of Image content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Image IDs
 * - Loading states with Suspense for improved user experience
 * - Automatic re-fetching when content changes in Contentful
 * - Clean image display with metadata information
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getImageById } from '@/lib/contentful-api/image';
import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import { AirImage } from '@/components/media/AirImage';
import type { Image as ImageType } from '@/types/contentful';

/**
 * Image Preview Page
 * This page is used for previewing Image content from Contentful
 * It fetches the Image by ID from the query parameters
 */

// Loading component for Suspense fallback
function ImagePreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Image preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function ImagePreviewContent() {
  const searchParams = useSearchParams();
  const imageId = searchParams?.get('id') ?? '';
  const [image, setImage] = useState<ImageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchImage() {
      if (!imageId) {
        setIsLoading(false);
        setError(new Error('No Image ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedImage = await getImageById(imageId, true);
        console.log('Fetched Image:', fetchedImage);
        setImage(fetchedImage);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Image:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Image'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchImage();
  }, [imageId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Image preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Image: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {imageId}</p>
        </Box>
      </Container>
    );
  } else if (!image) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Image Not Found</h1>
          <p>No Image found with ID: {imageId}</p>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Image Display */}
      <Container>
        <Box className="py-12" direction="col" gap={6}>
          {/* Image Title */}
          {image.title && <h1 className="text-headline-lg text-center font-bold">{image.title}</h1>}

          {/* Main Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <AirImage
                link={image.link}
                altText={image.altText ?? image.title ?? 'Preview image'}
                className="h-auto w-full rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Image Metadata */}
          <div className="mx-auto max-w-2xl rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Image Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Title:</span> {image.title ?? 'No title'}
              </div>
              <div>
                <span className="font-medium">Alt Text:</span> {image.altText ?? 'No alt text'}
              </div>
              <div>
                <span className="font-medium">URL:</span>
                <a
                  href={image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 break-all text-blue-600 hover:text-blue-800"
                >
                  {image.link}
                </a>
              </div>
            </div>
          </div>
        </Box>
      </Container>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 z-20 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Image Preview</p>
        <p className="text-xs opacity-75">ID: {image.sys.id}</p>
        <p className="text-xs opacity-75">Title: {image.title || 'No title'}</p>
      </div>
    </>
  );
}

export default function ImagePreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<ImagePreviewLoading />}>
        <ImagePreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
