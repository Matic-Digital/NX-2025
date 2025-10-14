/**
 * Universal Preview Page
 *
 * A single dynamic route that handles previewing all Contentful content types.
 * Displays any component in a centered layout with Contentful Live Preview integration.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */

'use client';

import { Suspense, useEffect, useState } from 'react';
import {
  ContentfulLivePreviewProvider,
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { useSearchParams } from 'next/navigation';

import { getAccordionById, getAccordionItemById } from '@/components/Accordion/AccordionApi';
import { AccordionItemPreview } from '@/components/Accordion/preview/AccordionItemPreview';
import { AccordionPreview } from '@/components/Accordion/preview/AccordionPreview';
import { BannerHero } from '@/components/BannerHero/BannerHero';
import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { BannerHeroPreview } from '@/components/BannerHero/preview/BannerHeroPreview';
import { getButtonById } from '@/components/Button/ButtonApi';
import { ButtonPreview } from '@/components/Button/preview/ButtonPreview';
import { getCollectionById } from '@/components/Collection/CollectionApi';
import { CollectionPreview } from '@/components/Collection/preview/CollectionPreview';
import { getContactCardById } from '@/components/ContactCard/ContactCardApi';
import { ContactCardPreview } from '@/components/ContactCard/preview/ContactCardPreview';
import { Content } from '@/components/Content/Content';
import { getContentById } from '@/components/Content/ContentApi';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import {
  getContentGridById,
  getContentGridItemById
} from '@/components/ContentGrid/ContentGridApi';
import { ContentGridItem } from '@/components/ContentGrid/ContentGridItem';
import { Footer } from '@/components/Footer/Footer';
import { getFooterById } from '@/components/Footer/FooterApi';
import { Header } from '@/components/Header/Header';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { getImageBetweenById } from '@/components/ImageBetween/ImageBetweenApi';
import { Menu } from '@/components/Menu/Menu';
import { getMenuById } from '@/components/Menu/MenuApi';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import { getMenuItemById } from '@/components/MenuItem/MenuItemApi';
import { Page } from '@/components/Page/Page';
import { getPageById } from '@/components/Page/PageApi';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { PageList } from '@/components/PageList/PageList';
import { getPageListById } from '@/components/PageList/PageListApi';
import { getProductById } from '@/components/Product/ProductApi';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';
import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
// Import Preview components (when they exist)
import { SectionHeadingPreview } from '@/components/SectionHeading/SectionHeadingPreview';
import { Slider } from '@/components/Slider/Slider';
import { getSliderById } from '@/components/Slider/SliderApi';

// Content type configuration
interface ContentTypeConfig {
  fetchFn: (id: string, preview: boolean) => Promise<unknown>;
  component: React.ComponentType<any>;
  previewComponent?: React.ComponentType<any>; // Optional dedicated preview component
  entityName: string;
  containerClass: string;
  usePageLayout?: boolean;
}

const contentTypeConfig: Record<string, ContentTypeConfig> = {
  button: {
    fetchFn: getButtonById,
    component: ButtonPreview, // Button only has preview component
    previewComponent: ButtonPreview,
    entityName: 'Button',
    containerClass: 'min-h-screen bg-gray-50'
  },
  collection: {
    fetchFn: getCollectionById,
    component: CollectionPreview, // Collection only has preview component
    previewComponent: CollectionPreview,
    entityName: 'Collection',
    containerClass: 'min-h-screen bg-gray-50'
  },
  content: {
    fetchFn: getContentById,
    component: Content,
    entityName: 'Content',
    containerClass: 'min-h-screen bg-white'
  },
  'content-block': {
    fetchFn: getContentById,
    component: Content,
    entityName: 'Content',
    containerClass: 'min-h-screen bg-white'
  },
  'section-heading': {
    fetchFn: getSectionHeadingById,
    component: SectionHeading,
    previewComponent: SectionHeadingPreview,
    entityName: 'SectionHeading',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'banner-hero': {
    fetchFn: getBannerHero,
    component: BannerHero,
    previewComponent: BannerHeroPreview,
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
    containerClass: 'bg-white text-white'
  },
  menu: {
    fetchFn: getMenuById,
    component: Menu,
    entityName: 'Menu',
    containerClass: 'min-h-screen bg-gray-50 p-8'
  },
  'menu-item': {
    fetchFn: getMenuItemById,
    component: MenuItem,
    entityName: 'MenuItem',
    containerClass: 'flex min-h-screen items-center justify-center bg-gray-50 p-8'
  },
  accordion: {
    fetchFn: getAccordionById,
    component: AccordionPreview, // Accordion only has preview component
    previewComponent: AccordionPreview,
    entityName: 'Accordion',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'accordion-item': {
    fetchFn: getAccordionItemById,
    component: AccordionItemPreview, // AccordionItem only has preview component
    previewComponent: AccordionItemPreview,
    entityName: 'AccordionItem',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'contact-card': {
    fetchFn: getContactCardById,
    component: ContactCardPreview, // ContactCard only has preview component
    previewComponent: ContactCardPreview,
    entityName: 'ContactCard',
    containerClass: 'min-h-screen bg-gray-50'
  }
};

interface ContentfulContent {
  sys: { id: string };
  pageLayout?: {
    header?: unknown;
    footer?: unknown;
  };
  [key: string]: unknown;
}

interface PreviewContentProps {
  contentType: string;
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

  const {
    component: Component,
    previewComponent: PreviewComponent,
    entityName,
    usePageLayout
  } = config;

  // Use PreviewComponent if available, otherwise fall back to regular Component
  const ComponentToRender = PreviewComponent ?? Component;

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
          <ComponentToRender {...(liveContent as any)} />
        </div>
      </PageLayout>
    );
  }

  return (
    <div {...inspectorProps}>
      <ComponentToRender {...(liveContent as any)} />
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
