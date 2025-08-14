import { notFound } from 'next/navigation';
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
    </PageLayout>
  );
}
