/**
 * Button Preview Page
 *
 * This page enables content editors to preview Button components directly from Contentful's
 * preview environment. It fetches Button content by ID from the query parameters and
 * renders all button variants simultaneously for visual comparison and testing.
 *
 * Key features:
 * - Dynamic fetching of Button content based on ID query parameter
 * - Integration with Contentful's Live Preview for real-time content updates
 * - Error handling for missing or invalid Button IDs
 * - Loading states with Suspense for improved user experience
 * - Displays all button variants (primary, secondary, white, destructive, outline, etc.)
 * - Shows all button sizes (default, sm, lg, xl, icon)
 * - Interactive buttons that respect the original link/modal functionality
 *
 * This page is typically accessed from Contentful's entry editor via the preview URL
 * configuration, allowing editors to see their changes immediately without publishing.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getButtonById } from '@/lib/contentful-api/button';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Container, Box } from '@/components/global/matic-ds';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Button as ButtonType } from '@/types/contentful';

/**
 * Button Preview Page
 * This page is used for previewing Button content from Contentful
 * It fetches the Button by ID from the query parameters and displays all variants
 */

// Loading component for Suspense fallback
function ButtonPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Button preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function ButtonPreviewContent() {
  const searchParams = useSearchParams();
  const buttonId = searchParams?.get('id') ?? '';
  const [buttonData, setButtonData] = useState<ButtonType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveButtonData = useContentfulLiveUpdates(buttonData);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveButtonData?.sys?.id });

  useEffect(() => {
    async function fetchButton() {
      if (!buttonId) {
        setIsLoading(false);
        setError(new Error('No Button ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedButton = await getButtonById(buttonId, true);
        console.log('Fetched Button:', fetchedButton);
        setButtonData(fetchedButton);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Button:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Button'));
        setIsLoading(false);
      }
    }

    // Use void operator to explicitly ignore the Promise
    void fetchButton();
  }, [buttonId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Button preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold text-red-600">Error</h1>
          <p>Error fetching Button: {error.message}</p>
          <p className="mt-2 text-sm text-gray-600">ID: {buttonId}</p>
        </Box>
      </Container>
    );
  } else if (!buttonData) {
    return (
      <Container>
        <Box className="py-12">
          <h1 className="text-headline-xs font-bold">Button Not Found</h1>
          <p>No Button found with ID: {buttonId}</p>
        </Box>
      </Container>
    );
  }

  // Button variants to display
  const variants = [
    'primary',
    'secondary',
    'white',
    'destructive',
    'outline',
    'outlineWhite',
    'ghost',
    'link'
  ] as const;
  const sizes = ['sm', 'default', 'lg', 'xl'] as const;

  // Helper function to render a button with the correct link/modal behavior
  const renderButton = (
    variant: (typeof variants)[number],
    size: (typeof sizes)[number],
    label?: string
  ) => {
    const buttonElement = (
      <Button variant={variant} size={size} {...inspectorProps({ fieldId: 'text' })}>
        {label ?? liveButtonData?.text}
      </Button>
    );

    // If there's an internal link, wrap with Link component
    if (liveButtonData?.internalLink?.slug) {
      return (
        <Link
          key={`${variant}-${size}`}
          href={liveButtonData.internalLink.slug}
          {...inspectorProps({ fieldId: 'internalLink' })}
        >
          {buttonElement}
        </Link>
      );
    }

    // If there's an external link, wrap with Link component
    if (liveButtonData?.externalLink) {
      return (
        <Link
          key={`${variant}-${size}`}
          href={liveButtonData.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          {...inspectorProps({ fieldId: 'externalLink' })}
        >
          {buttonElement}
        </Link>
      );
    }

    // If there's a modal, add onClick handler (simplified for preview)
    if (liveButtonData?.modal) {
      return (
        <button
          key={`${variant}-${size}`}
          onClick={() => alert(`Modal would open: ${liveButtonData.modal?.title ?? 'Modal'}`)}
          className="inline-block"
          {...inspectorProps({ fieldId: 'modal' })}
        >
          {buttonElement}
        </button>
      );
    }

    // Default button without functionality
    return <div key={`${variant}-${size}`}>{buttonElement}</div>;
  };

  return (
    <>
      <Container>
        <Box className="py-12" direction="col" gap={8}>
          {/* Button Variants Grid */}
          <div className="space-y-8">
            <div>
              <h2 className="text-headline-sm mb-4 font-semibold">All Variants (Default Size)</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {variants.map((variant) =>
                  renderButton(variant, 'default', `${variant} - ${liveButtonData?.text}`)
                )}
              </div>
            </div>

            <div>
              <h2 className="text-headline-sm mb-4 font-semibold">All Sizes (Primary Variant)</h2>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {sizes.map((size) =>
                  renderButton('primary', size, `${size} - ${liveButtonData?.text}`)
                )}
              </div>
            </div>
          </div>

          {/* Button Metadata */}
          <div className="mx-auto max-w-2xl rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Button Details</h3>
            <div className="space-y-2 text-sm">
              <div {...inspectorProps({ fieldId: 'internalText' })}>
                <span className="font-medium">Internal Text:</span> {liveButtonData?.internalText}
              </div>
              <div {...inspectorProps({ fieldId: 'text' })}>
                <span className="font-medium">Display Text:</span> {liveButtonData?.text}
              </div>
              {liveButtonData?.internalLink && (
                <div {...inspectorProps({ fieldId: 'internalLink' })}>
                  <span className="font-medium">Internal Link:</span>{' '}
                  {liveButtonData.internalLink.slug}
                </div>
              )}
              {liveButtonData?.externalLink && (
                <div {...inspectorProps({ fieldId: 'externalLink' })}>
                  <span className="font-medium">External Link:</span>
                  <a
                    href={liveButtonData.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    {liveButtonData.externalLink}
                  </a>
                </div>
              )}
              {liveButtonData?.modal && (
                <div {...inspectorProps({ fieldId: 'modal' })}>
                  <span className="font-medium">Modal:</span>{' '}
                  {liveButtonData.modal.title ?? 'Modal configured'}
                </div>
              )}
            </div>
          </div>
        </Box>
      </Container>

      {/* Small indicator that this is a preview */}
      <div className="fixed right-4 bottom-4 z-20 rounded bg-blue-100 p-2 text-xs text-blue-800 shadow-md">
        <p>Button Preview</p>
        <p className="text-xs opacity-75">ID: {liveButtonData?.sys.id}</p>
        <p className="text-xs opacity-75">Text: {liveButtonData?.text}</p>
      </div>
    </>
  );
}

export default function ButtonPreviewPage() {
  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<ButtonPreviewLoading />}>
        <ButtonPreviewContent />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
