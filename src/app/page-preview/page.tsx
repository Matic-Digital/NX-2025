'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { getPageById } from '@/lib/contentful-api/page';
import { PageLayout } from '@/components/layout/PageLayout';
import { BannerHero } from '@/components/BannerHero';
import { CtaBanner } from '@/components/CtaBanner';
import { ContentGrid } from '@/components/ContentGrid';
import { ImageBetween } from '@/components/ImageBetween';
import type { Header as HeaderType } from '@/types/contentful/Header';
import type { Footer as FooterType } from '@/types/contentful/Footer';
import type { PageLayout as PageLayoutType } from '@/types/contentful/PageLayout';
import { useSuspenseQuery } from '@tanstack/react-query';

// Define the component mapping for pageContent items (same as main page.tsx)
const componentMap = {
  BannerHero: BannerHero,
  ContentGrid: ContentGrid,
  CtaBanner: CtaBanner,
  ImageBetween: ImageBetween
  // Add other component types here as they are created
};

function PagePreviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data: page } = useSuspenseQuery({
    queryKey: ['page', id, 'preview'],
    queryFn: () => getPageById(id!, true)
  });

  // Apply live updates and inspector mode
  const livePage = useContentfulLiveUpdates(page ?? null);
  const inspectorProps = useContentfulInspectorMode({ entryId: livePage?.sys?.id });

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">No Page ID provided</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Not Found</h1>
          <p className="text-gray-600">Page with ID &quot;{id}&quot; not found</p>
        </div>
      </div>
    );
  }

  // Render the page exactly like the main page.tsx does
  const pageLayout = page.pageLayout as PageLayoutType | undefined;
  const pageHeader = pageLayout?.header as HeaderType | undefined;
  const pageFooter = pageLayout?.footer as FooterType | undefined;

  return (
    <div className="min-h-screen" {...inspectorProps}>
      <PageLayout header={pageHeader} footer={pageFooter}>
        <h1 className="sr-only">{livePage!.title}</h1>

        {/* Render the page content components */}
        {livePage!.pageContentCollection?.items.map((component) => {
          if (!component) return null;

          // Type guard to check if component has __typename
          if (!('__typename' in component)) {
            console.warn('Component missing __typename:', component);
            return null;
          }

          const typeName = component.__typename!; // Using non-null assertion as we've checked it exists

          // Check if we have a component for this type
          if (typeName && typeName in componentMap) {
            const ComponentType = componentMap[typeName as keyof typeof componentMap];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return <ComponentType key={component.sys.id} {...(component as any)} />;
          }

          // Log a warning if we don't have a component for this type
          console.warn(`No component found for type: ${typeName}`);
          return null;
        })}
      </PageLayout>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading page preview...</p>
      </div>
    </div>
  );
}

export default function PagePreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PagePreviewContent />
    </Suspense>
  );
}
