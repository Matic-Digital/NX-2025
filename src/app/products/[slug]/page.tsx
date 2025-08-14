import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug } from '@/lib/contentful-api/product';
import { BannerHero } from '@/components/BannerHero';
import { CtaBanner } from '@/components/CtaBanner';
import { Content } from '@/components/Content';
import { ContentGrid } from '@/components/ContentGrid';
import { ImageBetween } from '@/components/ImageBetween';
import { PageLayout } from '@/components/layout/PageLayout';
import type { PageLayout as PageLayoutType } from '@/types/contentful/PageLayout';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Footer as FooterType } from '@/types/contentful/Footer';

import type { Metadata } from 'next';
import {
  extractOpenGraphImage,
  extractSEOTitle,
  extractSEODescription
} from '@/lib/metadata-utils';

// Define the component mapping for product items (same as Page components)
const componentMap = {
  BannerHero,
  Content,
  ContentGrid,
  CtaBanner,
  ImageBetween
};

// Define the params type for generateMetadata and page (Next.js 15+)
interface ProductPageParams {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata based on the product
export async function generateMetadata({ params }: ProductPageParams): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
  }

  // Construct the base URL for absolute image URLs
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextracker.com';

  // Extract SEO data from Product component using utility functions
  const title = extractSEOTitle(product, 'Nextracker');
  const description = extractSEODescription(product, 'Nextracker Product');

  // Handle OG image from Product component
  const openGraphImage = extractOpenGraphImage(product, baseUrl, title);

  const ogImages = openGraphImage
    ? [
        {
          url: openGraphImage.url,
          width: openGraphImage.width,
          height: openGraphImage.height,
          alt: openGraphImage.title ?? title
        }
      ]
    : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImages,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.length > 0 ? [ogImages[0]!.url] : []
    }
  };
}

// Product detail page component - works identically to Page component
export default async function ProductPage({ params }: ProductPageParams) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Handle case where product is not found
  if (!product) {
    notFound();
  }

  // Extract pageLayout data (same as Page component)
  const pageLayout = product.pageLayout as PageLayoutType | undefined;
  const pageHeader = pageLayout?.header as HeaderType | undefined;
  const pageFooter = pageLayout?.footer as FooterType | undefined;

  return (
    <PageLayout header={pageHeader} footer={pageFooter}>
      <h1 className="sr-only">{product.title}</h1>
      {/* Render the product content components - itemsCollection maps to pageContentCollection */}
      {product.itemsCollection?.items.map((component, index) => {
        if (!component) return null;

        // Type guard to check if component has __typename
        if (!('__typename' in component)) {
          console.warn('Component missing __typename:', component);
          return null;
        }

        const typeName = component.__typename!; // Using non-null assertion as we've checked it exists

        // Now render the actual components with full data (thanks to two-step fetching)
        if (typeName && typeName in componentMap) {
          const ComponentType = componentMap[typeName as keyof typeof componentMap];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (
            <ComponentType
              key={component.sys?.id || `component-${index}`}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(component as any)}
            />
          );
        }

        // Fallback: render placeholder if component type not found
        return (
          <div
            key={component.sys?.id || `component-${index}`}
            className="mb-4 rounded-lg border border-gray-200 p-4"
          >
            <h3 className="text-lg font-semibold text-gray-700">{typeName} Component</h3>
            <p className="text-sm text-gray-500">ID: {component.sys?.id || 'Unknown'}</p>
            <p className="mt-2 text-xs text-gray-400">
              Component type not found in componentMap. Available types:{' '}
              {Object.keys(componentMap).join(', ')}
            </p>
          </div>
        );
      })}

      {/* Product Card Preview Section - Shows fields relevant for product cards and other displays */}
      <div className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Product Card Preview
          </h2>
          <p className="mb-8 text-center text-gray-600">
            Below is how this product appears in cards, lists, and other displays
          </p>

          {/* Product Card Display */}
          <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white shadow-md">
            {/* Product Image */}
            {(() => {
              const image = product.image as { url?: string; title?: string } | null | undefined;
              if (!image?.url) return null;

              return (
                <div className="relative aspect-video bg-gray-100">
                  <Image
                    src={image.url}
                    alt={image.title ?? product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              );
            })()}

            {/* Product Card Content */}
            <div className="p-6">
              {/* Icon and Title */}
              <div className="mb-3 flex items-center gap-3">
                {(() => {
                  const icon = product.icon as { url?: string; title?: string } | null | undefined;
                  if (!icon?.url) return null;

                  return (
                    <Image
                      src={icon.url}
                      alt={icon.title ?? `${product.title} icon`}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  );
                })()}
                <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
              </div>

              {/* Description */}
              {product.description && (
                <p className="mb-4 line-clamp-3 text-gray-600">{product.description}</p>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Slug/URL */}
              <div className="mb-4 text-sm text-gray-500">
                <strong>URL:</strong> /products/{product.slug}
              </div>

              {/* CTA Button */}
              <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Learn More
              </button>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mx-auto mt-8 max-w-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Technical Details</h3>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="font-medium text-gray-900">Content ID:</dt>
                  <dd className="font-mono text-gray-600">{product.sys.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Slug:</dt>
                  <dd className="font-mono text-gray-600">{product.slug}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Components:</dt>
                  <dd className="text-gray-600">
                    {product.itemsCollection?.items?.length ?? 0} content components
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Has Layout:</dt>
                  <dd className="text-gray-600">
                    {product.pageLayout ? 'Yes (with header/footer)' : 'No'}
                  </dd>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <dt className="font-medium text-gray-900">Tags:</dt>
                    <dd className="text-gray-600">{product.tags.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
