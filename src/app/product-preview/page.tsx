'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { getProductById } from '@/lib/contentful-api/product';
import { ProductCard } from '@/components/global/ProductCard';
import { Container, Box, Main } from '@/components/global/matic-ds';
import Image from 'next/image';
import AirImage from '@/components/media/AirImage';
import type { Product } from '@/types/contentful/Product';

/**
 * Product Preview Page
 * This page is used for previewing Product content from Contentful
 * It fetches the Product by ID from the query parameters
 */

// Loading component for Suspense fallback
function ProductPreviewLoading() {
  return (
    <Container>
      <Box className="py-12">
        <p>Loading Product preview...</p>
      </Box>
    </Container>
  );
}

// Inner component that uses useSearchParams
function ProductPreviewContent() {
  const searchParams = useSearchParams();
  const productId = searchParams?.get('id') ?? '';
  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enable live updates and inspector mode
  const liveProductData = useContentfulLiveUpdates(productData);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveProductData?.sys?.id });

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setIsLoading(false);
        setError(new Error('No Product ID provided'));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedProduct = await getProductById(productId, true);
        console.log('Fetched Product:', fetchedProduct);
        setProductData(fetchedProduct);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Product:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Product'));
        setIsLoading(false);
      }
    }

    void fetchProduct();
  }, [productId]);

  // Content to render based on state
  if (isLoading) {
    return (
      <Container>
        <Box className="py-12">
          <p>Loading Product preview...</p>
        </Box>
      </Container>
    );
  } else if (error) {
    return (
      <Container>
        <Box className="py-12">
          <p className="text-red-500">Error: {error.message}</p>
        </Box>
      </Container>
    );
  } else if (!liveProductData) {
    return (
      <Container>
        <Box className="py-12">
          <p>Product not found</p>
        </Box>
      </Container>
    );
  }

  return (
    <Main>
      <Container>
        <Box direction="col" gap={12} className="py-12">
          {/* Page Header */}
          <div {...inspectorProps({ fieldId: 'title' })}>
            <h1 className="text-headline-lg mb-4 text-center font-bold">
              Product Preview: {liveProductData.title}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Live preview of Product content with Contentful integration
            </p>
          </div>

          {/* ProductCard Component Display */}
          <div>
            <h2 className="text-headline-sm mb-6 text-center font-semibold">
              ProductCard Component States
            </h2>

            <Box cols={{ base: 1, md: 2, lg: 3 }} gap={12} className="mx-auto max-w-6xl">
              {/* Normal State */}
              <div>
                <h3 className="text-md mb-3 text-center font-medium">Normal State</h3>
                <ProductCard {...liveProductData} />
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Card in normal state - shows icon, title, and description
                </p>
              </div>

              {/* Hover State Preview */}
              <div>
                <h3 className="text-md mb-3 text-center font-medium">Hover State Preview</h3>
                <div className="group">
                  <ProductCard {...liveProductData} />
                </div>
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Card on hover - shows orange accent colors and arrow icon
                </p>
              </div>
            </Box>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              This shows how ProductCard components appear on the frontend in different states
            </p>
          </div>

          {/* Individual Field Displays */}
          <div>
            <h2 className="text-headline-sm mb-6 text-center font-semibold">
              Individual Components
            </h2>

            {/* Icon Display */}
            <div className="mb-8">
              <h3 className="text-md mb-3 font-medium">Product Icon</h3>
              <div className="flex justify-center">
                <div className="rounded bg-black p-4">
                  <Image
                    src={liveProductData.icon?.url ?? ''}
                    alt={liveProductData.title}
                    width={60}
                    height={60}
                    {...inspectorProps({ fieldId: 'icon' })}
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Title</h3>
              <p
                className="text-headline-sm text-center font-semibold"
                {...inspectorProps({ fieldId: 'title' })}
              >
                {liveProductData.title}
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Description</h3>
              <p
                className="text-body-sm text-center"
                {...inspectorProps({ fieldId: 'description' })}
              >
                {liveProductData.description}
              </p>
            </div>

            {/* Slug */}
            <div className="mb-6">
              <h3 className="text-md mb-2 font-medium">Slug</h3>
              <p
                className="text-body-sm rounded bg-gray-100 p-2 text-center font-mono dark:bg-gray-800"
                {...inspectorProps({ fieldId: 'slug' })}
              >
                {liveProductData.slug}
              </p>
            </div>

            {/* Tags */}
            {liveProductData.tags && liveProductData.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md mb-2 font-medium">Tags</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {liveProductData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700"
                      {...inspectorProps({ fieldId: 'tags' })}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Image Display (if exists) */}
            {liveProductData.image && (
              <div className="mb-8">
                <h3 className="text-md mb-3 font-medium">Product Image</h3>
                <div className="mx-auto max-w-md">
                  <AirImage
                    {...liveProductData.image}
                    {...inspectorProps({ fieldId: 'image' })}
                    className="h-64 w-full rounded-lg object-cover"
                  />
                </div>
              </div>
            )}

            {/* Icon Details */}
            {liveProductData.icon && (
              <div className="mb-6">
                <h3 className="text-md mb-2 font-medium">Icon Details</h3>
                <div className="space-y-1 rounded bg-gray-50 p-4 text-sm dark:bg-gray-900">
                  <p>
                    <strong>URL:</strong> {liveProductData.icon.url}
                  </p>
                  <p>
                    <strong>Width:</strong> {liveProductData.icon.width}px
                  </p>
                  <p>
                    <strong>Height:</strong> {liveProductData.icon.height}px
                  </p>
                  <p>
                    <strong>Title:</strong> {liveProductData.icon.title ?? 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Debug Information */}
          <div className="mt-12 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h3 className="text-md mb-3 font-medium">Debug Information</h3>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Product ID:</strong> {liveProductData.sys.id}
              </p>
              <p>
                <strong>Content Type:</strong> {liveProductData.sys.contentType?.sys?.id}
              </p>
              <p>
                <strong>Last Updated:</strong> {liveProductData.sys.updatedAt}
              </p>
              <p>
                <strong>Live Updates:</strong>{' '}
                {liveProductData === productData ? 'No changes detected' : 'Live changes detected'}
              </p>
            </div>
          </div>
        </Box>
      </Container>
    </Main>
  );
}

// Main component with Suspense wrapper
export default function ProductPreviewPage() {
  return (
    <Suspense fallback={<ProductPreviewLoading />}>
      <ProductPreviewContent />
    </Suspense>
  );
}
