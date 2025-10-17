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

import { Accordion } from '@/components/Accordion/Accordion';
// Component imports
import { getAccordionById, getAccordionItemById } from '@/components/Accordion/AccordionApi';
import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import { AccordionItemPreview } from '@/components/Accordion/preview/AccordionItemPreview';
import { AccordionPreview } from '@/components/Accordion/preview/AccordionPreview';
import { BannerHero } from '@/components/BannerHero/BannerHero';
import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { BannerHeroPreview } from '@/components/BannerHero/preview/BannerHeroPreview';
import { getButtonById } from '@/components/Button/ButtonApi';
import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import { ButtonPreview } from '@/components/Button/preview/ButtonPreview';
import { Collection } from '@/components/Collection/Collection';
import { getCollectionById } from '@/components/Collection/CollectionApi';
import { CollectionPreview } from '@/components/Collection/preview/CollectionPreview';
import { ContactCard } from '@/components/ContactCard/ContactCard';
import { getContactCardById } from '@/components/ContactCard/ContactCardApi';
import { ContactCardPreview } from '@/components/ContactCard/preview/ContactCardPreview';
import { Content } from '@/components/Content/Content';
import { getContentById } from '@/components/Content/ContentApi';
import { ContentPreview } from '@/components/Content/preview/ContentPreview';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import {
  getContentGridById,
  getContentGridItemById
} from '@/components/ContentGrid/ContentGridApi';
import { ContentGridItem } from '@/components/ContentGrid/ContentGridItem';
import { ContentGridItemPreview } from '@/components/ContentGrid/preview/ContentGridItemPreview';
import { ContentGridPreview } from '@/components/ContentGrid/preview/ContentGridPreview';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { getCtaBannerById } from '@/components/CtaBanner/CtaBannerApi';
import { CtaBannerPreview } from '@/components/CtaBanner/preview/CtaBannerPreview';
import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { getCtaGridById } from '@/components/CtaGrid/CtaGridApi';
import { CtaGridPreview } from '@/components/CtaGrid/preview/CtaGridPreview';
import { Event } from '@/components/Event/Event';
import { getEventById } from '@/components/Event/EventApi';
import { EventPreview } from '@/components/Event/preview/EventPreview';
import { Footer } from '@/components/Footer/Footer';
import { getFooterById } from '@/components/Footer/FooterApi';
import { FooterPreview } from '@/components/Footer/preview/FooterPreview';
import { HubspotForm } from '@/components/Forms/HubspotForm/HubspotForm';
import { getHubspotFormById } from '@/components/Forms/HubspotForm/HubspotFormApi';
import { HubspotFormPreview } from '@/components/Forms/HubspotForm/preview/HubspotFormPreview';
import { Header } from '@/components/Header/Header';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { HeaderPreview } from '@/components/Header/preview/HeaderPreview';
import { AirImage } from '@/components/Image/AirImage';
import { getImageById } from '@/components/Image/ImageApi';
import { ImagePreview } from '@/components/Image/preview/ImagePreview';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { getImageBetweenById } from '@/components/ImageBetween/ImageBetweenApi';
import { ImageBetweenPreview } from '@/components/ImageBetween/preview/ImageBetweenPreview';
import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';
import { MegaMenuPreview } from '@/components/MegaMenu/preview/MegaMenuPreview';
import { Menu } from '@/components/Menu/Menu';
import { getMenuById } from '@/components/Menu/MenuApi';
import { MenuPreview } from '@/components/Menu/preview/MenuPreview';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import { getMenuItemById } from '@/components/MenuItem/MenuItemApi';
import { MenuItemPreview } from '@/components/MenuItem/preview/MenuItemPreview';
import { getModalById } from '@/components/Modals/ModalApi';
import { ModalPreview } from '@/components/Modals/preview/ModalPreview';
import { RequestAQuoteModal } from '@/components/Modals/RequestAQuoteModal';
import { getLocationById } from '@/components/OfficeLocation/OfficeLocationApi';
import { OfficeLocationPreview } from '@/components/OfficeLocation/preview/OfficeLocationPreview';
import { Page } from '@/components/Page/Page';
import { getPageById } from '@/components/Page/PageApi';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { PageList } from '@/components/PageList/PageList';
import { getPageListById } from '@/components/PageList/PageListApi';
import { getPostById } from '@/components/Post/PostApi';
import { PostCard } from '@/components/Post/PostCard';
import { PostPreview } from '@/components/Post/preview/PostPreview';
import { ProductPreview } from '@/components/Product/preview/ProductPreview';
import { getProductById } from '@/components/Product/ProductApi';
import { RegionsMapPreview } from '@/components/Region/preview/RegionsMapPreview';
import { getRegionsMapById } from '@/components/Region/RegionApi';
import { RegionsMap } from '@/components/Region/RegionsMap';
import { RegionStatItemPreview } from '@/components/RegionStats/preview/RegionStatItemPreview';
import { RegionStatsPreview } from '@/components/RegionStats/preview/RegionStatsPreview';
import { RegionStatItem } from '@/components/RegionStats/RegionStatItem/RegionStatItem';
import { getRegionStatItemById } from '@/components/RegionStats/RegionStatItem/RegionStatItemApi';
import { RegionStats } from '@/components/RegionStats/RegionStats';
import { getRegionStatsById } from '@/components/RegionStats/RegionStatsApi';
import { RichContentPreview } from '@/components/RichContent/preview/RichContentPreview';
import { RichContent } from '@/components/RichContent/RichContent';
import { getRichContentById } from '@/components/RichContent/RichContentApi';
import { SectionHeadingPreview } from '@/components/SectionHeading/preview/SectionHeadingPreview';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';
import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
import { ServicePreview } from '@/components/Service/preview/ServicePreview';
import { getServiceById } from '@/components/Service/ServiceApi';
import { Slider } from '@/components/Slider/Slider';
import { getSliderById } from '@/components/Slider/SliderApi';
import { SocialPreview } from '@/components/Social/preview/SocialPreview';
import { Social } from '@/components/Social/Social';
import { getSocialById } from '@/components/Social/SocialApi';
import { SolutionPreview } from '@/components/Solution/preview/SolutionPreview';
import { getSolutionById } from '@/components/Solution/SolutionApi';
import { SolutionCard } from '@/components/Solution/SolutionCard';
import { TeamMemberPreview } from '@/components/TeamMember/preview/TeamMemberPreview';
import { getTeamMemberById } from '@/components/TeamMember/TeamMemberApi';
import { TeamMemberModal } from '@/components/TeamMember/TeamMemberModal';
import { TestimonialItem } from '@/components/Testimonials/components/TestimonialItem';
import { TestimonialItemPreview } from '@/components/Testimonials/preview/TestimonialItemPreview';
import { TestimonialsPreview } from '@/components/Testimonials/preview/TestimonialsPreview';
import { Testimonials } from '@/components/Testimonials/Testimonials';
import {
  getTestimonialItemById,
  getTestimonialsById
} from '@/components/Testimonials/TestimonialsApi';
import { TimelineSliderItemPreview } from '@/components/TimelineSlider/preview/TimelineSliderItemPreview';
import { TimelineSliderItem } from '@/components/TimelineSlider/TimelineSliderItem';
import { getTimelineSliderItemById } from '@/components/TimelineSlider/TimelineSliderItemApi';
import { MuxVideoPlayer } from '@/components/Video/MuxVideo';
import { VideoPreview } from '@/components/Video/preview/VideoPreview';
import { getVideoById } from '@/components/Video/VideoApi';

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
  accordion: {
    fetchFn: getAccordionById,
    component: Accordion,
    previewComponent: AccordionPreview,
    entityName: 'Accordion',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'accordion-item': {
    fetchFn: getAccordionItemById,
    component: AccordionItem,
    previewComponent: AccordionItemPreview,
    entityName: 'AccordionItem',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'banner-hero': {
    fetchFn: getBannerHero,
    component: BannerHero,
    previewComponent: BannerHeroPreview,
    entityName: 'BannerHero',
    containerClass: 'min-h-screen' // Full height for hero sections
  },
  button: {
    fetchFn: getButtonById,
    component: ModalCtaButton,
    previewComponent: ButtonPreview,
    entityName: 'Button',
    containerClass: 'min-h-screen bg-gray-50'
  },
  collection: {
    fetchFn: getCollectionById,
    component: Collection,
    previewComponent: CollectionPreview,
    entityName: 'Collection',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'contact-card': {
    fetchFn: getContactCardById,
    component: ContactCard,
    previewComponent: ContactCardPreview,
    entityName: 'ContactCard',
    containerClass: 'min-h-screen bg-gray-50'
  },
  content: {
    fetchFn: getContentById,
    component: Content,
    previewComponent: ContentPreview,
    entityName: 'Content',
    containerClass: 'min-h-screen bg-white'
  },
  'content-grid': {
    fetchFn: getContentGridById,
    component: ContentGrid,
    previewComponent: ContentGridPreview,
    entityName: 'ContentGrid',
    containerClass: 'min-h-screen bg-white'
  },
  'content-grid-item': {
    fetchFn: getContentGridItemById,
    component: ContentGridItem,
    previewComponent: ContentGridItemPreview,
    entityName: 'ContentGridItem',
    containerClass: 'flex min-h-screen items-center justify-center bg-gray-50 p-8'
  },
  'cta-banner': {
    fetchFn: getCtaBannerById,
    component: CtaBanner,
    previewComponent: CtaBannerPreview,
    entityName: 'CtaBanner',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'cta-grid': {
    fetchFn: getCtaGridById,
    component: CtaGrid,
    previewComponent: CtaGridPreview,
    entityName: 'CtaGrid',
    containerClass: 'min-h-screen bg-white'
  },
  event: {
    fetchFn: getEventById,
    component: Event,
    previewComponent: EventPreview,
    entityName: 'Event',
    containerClass: 'min-h-screen bg-white'
  },
  footer: {
    fetchFn: getFooterById,
    component: Footer,
    previewComponent: FooterPreview,
    entityName: 'Footer',
    containerClass: 'bg-white text-white'
  },
  header: {
    fetchFn: getHeaderById,
    component: Header,
    previewComponent: HeaderPreview,
    entityName: 'Header',
    containerClass: 'bg-white shadow-sm'
  },
  'hubspot-form': {
    fetchFn: getHubspotFormById,
    component: HubspotForm,
    previewComponent: HubspotFormPreview,
    entityName: 'HubspotForm',
    containerClass: 'min-h-screen bg-gray-50'
  },
  image: {
    fetchFn: getImageById,
    component: AirImage,
    previewComponent: ImagePreview,
    entityName: 'Image',
    containerClass: 'flex min-h-screen items-center justify-center bg-gray-50 p-8'
  },
  'image-between': {
    fetchFn: getImageBetweenById,
    component: ImageBetween,
    previewComponent: ImageBetweenPreview,
    entityName: 'ImageBetween',
    containerClass: 'min-h-screen bg-white'
  },
  'mega-menu': {
    fetchFn: getMegaMenuById,
    component: MegaMenu,
    previewComponent: MegaMenuPreview,
    entityName: 'MegaMenu',
    containerClass: 'min-h-screen bg-white'
  },
  menu: {
    fetchFn: getMenuById,
    component: Menu,
    previewComponent: MenuPreview,
    entityName: 'Menu',
    containerClass: 'min-h-screen bg-gray-50 p-8'
  },
  'menu-item': {
    fetchFn: getMenuItemById,
    component: MenuItem,
    previewComponent: MenuItemPreview,
    entityName: 'MenuItem',
    containerClass: 'flex min-h-screen items-center justify-center bg-gray-50 p-8'
  },
  modal: {
    fetchFn: getModalById,
    component: RequestAQuoteModal,
    previewComponent: ModalPreview,
    entityName: 'Modal',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'office-location': {
    fetchFn: getLocationById,
    component: OfficeLocationPreview,
    previewComponent: OfficeLocationPreview,
    entityName: 'OfficeLocation',
    containerClass: 'min-h-screen bg-gray-50'
  },
  page: {
    fetchFn: getPageById,
    component: Page,
    entityName: 'Page',
    containerClass: 'min-h-screen',
    usePageLayout: true
  },
  'page-list': {
    fetchFn: getPageListById,
    component: PageList,
    entityName: 'PageList',
    containerClass: 'min-h-screen',
    usePageLayout: true
  },
  post: {
    fetchFn: getPostById,
    component: PostCard,
    previewComponent: PostPreview,
    entityName: 'Post',
    containerClass: 'min-h-screen bg-white'
  },
  product: {
    fetchFn: getProductById,
    component: ProductAsPage,
    previewComponent: ProductPreview,
    entityName: 'Product',
    containerClass: 'min-h-screen',
    usePageLayout: true
  },
  'regions-map': {
    fetchFn: getRegionsMapById,
    component: RegionsMap,
    previewComponent: RegionsMapPreview,
    entityName: 'Region',
    containerClass: 'min-h-screen bg-white'
  },
  'region-stats': {
    fetchFn: getRegionStatsById,
    component: RegionStats,
    previewComponent: RegionStatsPreview,
    entityName: 'RegionStats',
    containerClass: 'min-h-screen bg-white'
  },
  'region-stat-item': {
    fetchFn: getRegionStatItemById,
    component: RegionStatItem,
    previewComponent: RegionStatItemPreview,
    entityName: 'RegionStatItem',
    containerClass: 'min-h-screen bg-white'
  },
  'rich-text': {
    fetchFn: getRichContentById,
    component: RichContent,
    previewComponent: RichContentPreview,
    entityName: 'RichText',
    containerClass: 'min-h-screen bg-white'
  },
  'section-heading': {
    fetchFn: getSectionHeadingById,
    component: SectionHeading,
    previewComponent: SectionHeadingPreview,
    entityName: 'SectionHeading',
    containerClass: 'min-h-screen bg-gray-50'
  },
  service: {
    fetchFn: getServiceById,
    component: ServicePreview,
    previewComponent: ServicePreview,
    entityName: 'Service',
    containerClass: 'min-h-screen bg-gray-50'
  },
  slider: {
    fetchFn: getSliderById,
    component: Slider,
    entityName: 'Slider',
    containerClass: 'min-h-screen bg-white'
  },
  social: {
    fetchFn: getSocialById,
    component: Social,
    previewComponent: SocialPreview,
    entityName: 'Social',
    containerClass: 'min-h-screen bg-gray-50'
  },
  solution: {
    fetchFn: getSolutionById,
    component: SolutionCard,
    previewComponent: SolutionPreview,
    entityName: 'Solution',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'team-member': {
    fetchFn: getTeamMemberById,
    component: TeamMemberModal,
    previewComponent: TeamMemberPreview,
    entityName: 'TeamMember',
    containerClass: 'min-h-screen bg-gray-50'
  },
  testimonials: {
    fetchFn: getTestimonialsById,
    component: Testimonials,
    previewComponent: TestimonialsPreview,
    entityName: 'Testimonials',
    containerClass: 'min-h-screen bg-white'
  },
  'testimonial-item': {
    fetchFn: getTestimonialItemById,
    component: TestimonialItem,
    previewComponent: TestimonialItemPreview,
    entityName: 'TestimonialItem',
    containerClass: 'min-h-screen bg-gray-50'
  },
  'timeline-slider-item': {
    fetchFn: getTimelineSliderItemById,
    component: TimelineSliderItem,
    previewComponent: TimelineSliderItemPreview,
    entityName: 'TimelineSliderItem',
    containerClass: 'min-h-screen bg-white'
  },
  video: {
    fetchFn: getVideoById,
    component: MuxVideoPlayer,
    previewComponent: VideoPreview,
    entityName: 'Video',
    containerClass: 'min-h-screen bg-white'
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
