/**
 * Universal Preview Page
 *
 * A single dynamic route that handles previewing all Contentful content types.
 * Displays any component in a centered layout with Contentful Live Preview integration.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

// Import all components
import { BannerHero } from '@/components/BannerHero/BannerHero';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { ContentGridItem } from '@/components/ContentGrid/ContentGridItem';
import { Content } from '@/components/Content/Content';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { Slider } from '@/components/Slider/Slider';
import { PageList } from '@/components/global/PageList/PageList';
import { Page } from '@/components/global/Page/Page';
import { Header } from '@/components/global/Header/Header';
import { Footer } from '@/components/global/Footer/Footer';
import { PageLayout } from '@/components/PageLayout/PageLayout';

// Import all API functions
import {
  getContentGridById,
  getContentGridItemById
} from '@/components/ContentGrid/ContentGridApi';
import { getPageById } from '@/components/global/Page/PageApi';
import { getPageListById } from '@/components/global/PageList/PageListApi';
import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { getContentById } from '@/components/Content/ContentApi';
import { getCtaBannerById } from '@/components/CtaBanner/CtaBannerApi';
import { getFooterById } from '@/components/global/Footer/FooterApi';
import { getHeaderById } from '@/components/global/Header/HeaderApi';
import { getImageBetweenById } from '@/components/ImageBetween/ImageBetweenApi';
import { getSliderById } from '@/components/Slider/SliderApi';
import { getProductById } from '@/components/Product/ProductApi';

// Content type configuration
interface ContentTypeConfig {
  fetchFn: (id: string, preview?: boolean) => Promise<unknown>;
  component: React.ComponentType<any>;
  entityName: string;
  containerClass: string;
  usePageLayout?: boolean;
}

const contentTypeConfig: Record<string, ContentTypeConfig> = {
  'banner-hero': {
    fetchFn: getBannerHero,
    component: BannerHero,
    entityName: 'BannerHero',
    containerClass: 'min-h-screen' // Full height for hero sections
  },
  'content-grid': {
    fetchFn: getContentGridById,
    component: ContentGrid,
    entityName: 'ContentGrid',
    containerClass: 'min-h-screen bg-white'
  },
  'content-grid-item': {
    fetchFn: getContentGridItemById,
    component: ContentGridItem,
    entityName: 'ContentGridItem',
    containerClass: 'flex min-h-screen items-center justify-center bg-gray-50 p-8'
  },
  content: {
    fetchFn: getContentById,
    component: Content,
    entityName: 'Content',
    containerClass: 'min-h-screen bg-white p-8'
  },
  'cta-banner': {
    fetchFn: getCtaBannerById,
    component: CtaBanner,
    entityName: 'CtaBanner',
    containerClass: 'min-h-screen'
  },
  'image-between': {
    fetchFn: getImageBetweenById,
    component: ImageBetween,
    entityName: 'ImageBetween',
    containerClass: 'min-h-screen bg-white'
  },
  slider: {
    fetchFn: getSliderById,
    component: Slider,
    entityName: 'Slider',
    containerClass: 'min-h-screen bg-white'
  },
  'page-list': {
    fetchFn: getPageListById,
    component: PageList,
    entityName: 'PageList',
    containerClass: 'min-h-screen',
    usePageLayout: true
  },
  page: {
    fetchFn: getPageById,
    component: Page,
    entityName: 'Page',
    containerClass: 'min-h-screen',
    usePageLayout: true
  },
  product: {
    fetchFn: getProductById,
    component: ProductAsPage,
    entityName: 'Product',
    containerClass: 'min-h-screen',
    usePageLayout: true
  },
  header: {
    fetchFn: getHeaderById,
    component: Header,
    entityName: 'Header',
    containerClass: 'bg-white shadow-sm'
  },
  footer: {
    fetchFn: getFooterById,
    component: Footer,
    entityName: 'Footer',
    containerClass: 'bg-gray-900 text-white'
  }
} as const;

type _ContentType = keyof typeof contentTypeConfig;

interface PreviewContentProps {
  contentType: string;
}

interface ContentfulContent {
  sys: { id: string };
  pageLayout?: {
    header?: unknown;
    footer?: unknown;
  };
  [key: string]: unknown;
}

// Lightweight wrapper to render a Product using the Page component API
// Maps Product.itemsCollection -> Page.pageContentCollection
interface ProductLikeForPreview {
  itemsCollection?: unknown;
  pageContentCollection?: unknown;
  [key: string]: unknown;
}

function ProductAsPage(props: ProductLikeForPreview) {
  const pageContentCollection = props.itemsCollection ?? props.pageContentCollection;
  const mapped: ProductLikeForPreview = {
    ...props,
    pageContentCollection
  };
  // Page expects specific fields like sys; cast to any to avoid TS prop mismatch in preview adapter
  return <Page {...(mapped as any)} />;
}

function PreviewContent({ contentType }: PreviewContentProps) {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? '';
  const [content, setContent] = useState<ContentfulContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Always call hooks at the top level
  const liveContent = useContentfulLiveUpdates(content);
  const inspectorProps = useContentfulInspectorMode({
    entryId: liveContent?.sys?.id
  });

  // Validate content type after hooks
  const config = contentTypeConfig[contentType];

  useEffect(() => {
    async function fetchContent() {
      if (!id) {
        setIsLoading(false);
        setError(new Error(`No ${config?.entityName ?? 'Content'} ID provided`));
        return;
      }

      if (!config) {
        setIsLoading(false);
        setError(new Error(`Unsupported content type: ${contentType}`));
        return;
      }

      try {
        setIsLoading(true);
        const fetchedContent = await config.fetchFn(id, true);
        setContent(fetchedContent as ContentfulContent);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch ${config.entityName}`));
        setIsLoading(false);
      }
    }

    void fetchContent();
  }, [id, config, contentType]);

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unsupported Content Type</h1>
          <p className="text-gray-600">
            Content type &quot;{contentType}&quot; is not supported for preview
          </p>
        </div>
      </div>
    );
  }

  const { component: Component, entityName, usePageLayout } = config;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading {entityName} preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">
            Error fetching {entityName}: {error.message}
          </p>
          <p className="mt-2 text-sm text-gray-500">ID: {id}</p>
        </div>
      </div>
    );
  }

  if (!content || !liveContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{entityName} Not Found</h1>
          <p className="text-gray-600">
            No {entityName} found with ID: {id}
          </p>
        </div>
      </div>
    );
  }

  // For Page and PageList content types, use PageLayout wrapper like production
  if (usePageLayout && liveContent?.pageLayout) {
    const pageLayout = liveContent.pageLayout;
    const pageHeader = pageLayout?.header as any;
    const pageFooter = pageLayout?.footer as any;

    return (
      <PageLayout header={pageHeader} footer={pageFooter}>
        <div {...inspectorProps}>
          <Component {...(liveContent as any)} />
        </div>
      </PageLayout>
    );
  }

  return (
    <div {...inspectorProps}>
      <Component {...(liveContent as any)} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading preview...</p>
      </div>
    </div>
  );
}

interface PreviewPageProps {
  params: Promise<{ contentType: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const [contentType, setContentType] = useState<string>('');

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setContentType(resolvedParams.contentType);
    }
    void resolveParams();
  }, [params]);

  if (!contentType) {
    return <LoadingFallback />;
  }

  return (
    <ContentfulLivePreviewProvider locale="en-US">
      <Suspense fallback={<LoadingFallback />}>
        <PreviewContent contentType={contentType} />
      </Suspense>
    </ContentfulLivePreviewProvider>
  );
}
