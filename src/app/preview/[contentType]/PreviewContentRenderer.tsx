'use client';

import { useContentfulLiveUpdates, useContentfulInspectorMode } from '@contentful/live-preview/react';
import { PageLayout } from '@/components/PageLayout/PageLayout';

// Dynamic component imports to avoid server/client component conflicts
import { Accordion } from '@/components/Accordion/Accordion';
import { AccordionItem } from '@/components/Accordion/components/AccordionItem';
import { AccordionSkeleton } from '@/components/Accordion/components/AccordionSkeleton';
import { AccordionItemPreview } from '@/components/Accordion/preview/AccordionItemPreview';
import { AccordionPreview } from '@/components/Accordion/preview/AccordionPreview';
import { BannerHero } from '@/components/BannerHero/BannerHero';
import { BannerHeroSkeleton } from '@/components/BannerHero/components/BannerHeroSkeleton';
import { BannerHeroPreview } from '@/components/BannerHero/preview/BannerHeroPreview';
import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import { ButtonPreview } from '@/components/Button/preview/ButtonPreview';
import { Collection } from '@/components/Collection/Collection';
import { CollectionPreview } from '@/components/Collection/preview/CollectionPreview';
import { ContactCardSkeleton } from '@/components/ContactCard/components/ContactCardSkeleton';
import { ContactCard } from '@/components/ContactCard/ContactCard';
import { ContactCardPreview } from '@/components/ContactCard/preview/ContactCardPreview';
import { Content } from '@/components/Content/Content';
import { ContentSkeleton } from '@/components/Content/ContentSkeleton';
import { ContentPreview } from '@/components/Content/preview/ContentPreview';
import { ContentGrid } from '@/components/ContentGrid/ContentGrid';
import { ContentGridItem } from '@/components/ContentGrid/ContentGridItem';
import { ContentGridItemPreview } from '@/components/ContentGrid/preview/ContentGridItemPreview';
import { ContentGridPreview } from '@/components/ContentGrid/preview/ContentGridPreview';
import { CtaBanner } from '@/components/CtaBanner/CtaBanner';
import { CtaBannerSkeleton } from '@/components/CtaBanner/CtaBannerSkeleton';
import { CtaBannerPreview } from '@/components/CtaBanner/preview/CtaBannerPreview';
import { CtaGrid } from '@/components/CtaGrid/CtaGrid';
import { CtaGridPreview } from '@/components/CtaGrid/preview/CtaGridPreview';
import { EventSkeleton } from '@/components/Event/components/EventSkeleton';
import { EventDetail } from '@/components/Event/EventDetail';
import { EventDetailPreview } from '@/components/Event/preview';
import { EventPreview } from '@/components/Event/preview/EventPreview';
import { Footer } from '@/components/Footer/Footer';
import { FooterPreview } from '@/components/Footer/preview/FooterPreview';
import { HubspotForm } from '@/components/Forms/HubspotForm/HubspotForm';
import { HubspotFormPreview } from '@/components/Forms/HubspotForm/preview/HubspotFormPreview';
import { Header } from '@/components/Header/Header';
import { HeaderSkeleton } from '@/components/Header/HeaderSkeleton';
import { HeaderPreview } from '@/components/Header/preview/HeaderPreview';
import { AirImage } from '@/components/Image/AirImage';
import { ImagePreview } from '@/components/Image/preview/ImagePreview';
import { ImageBetween } from '@/components/ImageBetween/ImageBetween';
import { ImageBetweenPreview } from '@/components/ImageBetween/preview/ImageBetweenPreview';
import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { MegaMenuPreview } from '@/components/MegaMenu/preview/MegaMenuPreview';
import { Menu } from '@/components/Menu/Menu';
import { MenuPreview } from '@/components/Menu/preview/MenuPreview';
import { MenuItem } from '@/components/MenuItem/MenuItem';
import { MenuItemPreview } from '@/components/MenuItem/preview/MenuItemPreview';
import { ModalPreview } from '@/components/Modals/preview/ModalPreview';
import { RequestAQuoteModal } from '@/components/Modals/RequestAQuoteModal';
import { Location } from '@/components/OfficeLocation/OfficeLocation';
import { OfficeLocationPreview } from '@/components/OfficeLocation/preview/OfficeLocationPreview';
import { Page } from '@/components/Page/Page';
import { PageList } from '@/components/PageList/PageList';
import { PostCard } from '@/components/Post/PostCard';
import { PostCardSkeleton } from '@/components/Post/PostCardSkeleton';
import { PostPreview } from '@/components/Post/preview/PostPreview';
import { ProductPreview } from '@/components/Product/preview/ProductPreview';
import { RegionsMapPreview } from '@/components/Region/preview/RegionsMapPreview';
import { RegionsMap } from '@/components/Region/RegionsMap';
import { RegionStatItemPreview } from '@/components/RegionStats/preview/RegionStatItemPreview';
import { RegionStatsPreview } from '@/components/RegionStats/preview/RegionStatsPreview';
import { RegionStatItem } from '@/components/RegionStats/RegionStatItem/RegionStatItem';
import { RegionStats } from '@/components/RegionStats/RegionStats';
import { RichContentPreview } from '@/components/RichContent/preview/RichContentPreview';
import { RichContent } from '@/components/RichContent/RichContent';
import { SectionHeadingPreview } from '@/components/SectionHeading/preview/SectionHeadingPreview';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';
import { SectionHeadingSkeleton } from '@/components/SectionHeading/SectionHeadingSkeleton';
import { ServicePreview } from '@/components/Service/preview/ServicePreview';
import { Slider } from '@/components/Slider/Slider';
import { SocialPreview } from '@/components/Social/preview/SocialPreview';
import { Social } from '@/components/Social/Social';
import { SolutionPreview } from '@/components/Solution/preview/SolutionPreview';
import { SolutionCard } from '@/components/Solution/SolutionCard';
import { TeamMemberPreview } from '@/components/TeamMember/preview/TeamMemberPreview';
import { TeamMemberModal } from '@/components/TeamMember/TeamMemberModal';
import { TestimonialItem } from '@/components/Testimonials/components/TestimonialItem';
import { TestimonialItemPreview } from '@/components/Testimonials/preview/TestimonialItemPreview';
import { TestimonialsPreview } from '@/components/Testimonials/preview/TestimonialsPreview';
import { Testimonials } from '@/components/Testimonials/Testimonials';
import { TimelineSliderItemPreview } from '@/components/TimelineSlider/preview/TimelineSliderItemPreview';
import { TimelineSliderItem } from '@/components/TimelineSlider/TimelineSliderItem';
import { MuxVideoPlayer } from '@/components/Video/MuxVideo';
import { VideoPreview } from '@/components/Video/preview/VideoPreview';

interface ContentfulContent {
  sys: { id: string };
  pageLayout?: {
    header?: unknown;
    footer?: unknown;
  };
  [key: string]: unknown;
}

interface ContentTypeConfig {
  fetchFn: (id: string, preview: boolean) => Promise<unknown>;
  component: React.ComponentType<any>;
  previewComponent?: React.ComponentType<any>;
  skeletonComponent?: React.ComponentType<any>;
  entityName: string;
  containerClass: string;
  usePageLayout?: boolean;
}

// Lightweight wrapper to render a Product using the Page component API
function ProductAsPage(props: any) {
  const pageContentCollection = props.itemsCollection ?? props.pageContentCollection;
  const mapped = {
    ...props,
    pageContentCollection
  };
  return <Page {...mapped} />;
}

// Component mapping for client-side rendering
const componentMap: Record<string, { 
  component: React.ComponentType<any>;
  previewComponent?: React.ComponentType<any>;
  skeletonComponent?: React.ComponentType<any>;
  usePageLayout?: boolean;
}> = {
  accordion: { component: Accordion, previewComponent: AccordionPreview, skeletonComponent: AccordionSkeleton },
  'accordion-item': { component: AccordionItem, previewComponent: AccordionItemPreview },
  'banner-hero': { component: BannerHero, previewComponent: BannerHeroPreview, skeletonComponent: BannerHeroSkeleton },
  button: { component: ModalCtaButton, previewComponent: ButtonPreview },
  collection: { component: Collection, previewComponent: CollectionPreview },
  'contact-card': { component: ContactCard, previewComponent: ContactCardPreview, skeletonComponent: ContactCardSkeleton },
  content: { component: Content, previewComponent: ContentPreview, skeletonComponent: ContentSkeleton },
  'content-grid': { component: ContentGrid, previewComponent: ContentGridPreview },
  'content-grid-item': { component: ContentGridItem, previewComponent: ContentGridItemPreview },
  'cta-banner': { component: CtaBanner, previewComponent: CtaBannerPreview, skeletonComponent: CtaBannerSkeleton },
  'cta-grid': { component: CtaGrid, previewComponent: CtaGridPreview },
  event: { component: EventDetail, previewComponent: EventPreview, skeletonComponent: EventSkeleton },
  'event-detail': { component: EventDetail, previewComponent: EventDetailPreview },
  footer: { component: Footer, previewComponent: FooterPreview },
  'hubspot-form': { component: HubspotForm, previewComponent: HubspotFormPreview },
  header: { component: Header, previewComponent: HeaderPreview, skeletonComponent: HeaderSkeleton },
  image: { component: AirImage, previewComponent: ImagePreview },
  'image-between': { component: ImageBetween, previewComponent: ImageBetweenPreview },
  'mega-menu': { component: MegaMenu, previewComponent: MegaMenuPreview },
  menu: { component: Menu, previewComponent: MenuPreview },
  'menu-item': { component: MenuItem, previewComponent: MenuItemPreview },
  modal: { component: RequestAQuoteModal, previewComponent: ModalPreview },
  'office-location': { component: Location, previewComponent: OfficeLocationPreview },
  page: { component: Page, usePageLayout: true },
  'page-list': { component: PageList, usePageLayout: true },
  post: { component: PostCard, previewComponent: PostPreview, skeletonComponent: PostCardSkeleton },
  product: { component: ProductAsPage, previewComponent: ProductPreview, usePageLayout: true },
  'regions-map': { component: RegionsMap, previewComponent: RegionsMapPreview },
  'region-stats': { component: RegionStats, previewComponent: RegionStatsPreview },
  'region-stat-item': { component: RegionStatItem, previewComponent: RegionStatItemPreview },
  'rich-text': { component: RichContent, previewComponent: RichContentPreview },
  'section-heading': { component: SectionHeading, previewComponent: SectionHeadingPreview, skeletonComponent: SectionHeadingSkeleton },
  service: { component: ServicePreview, previewComponent: ServicePreview },
  slider: { component: Slider },
  social: { component: Social, previewComponent: SocialPreview },
  solution: { component: SolutionCard, previewComponent: SolutionPreview },
  'team-member': { component: TeamMemberModal, previewComponent: TeamMemberPreview },
  testimonials: { component: Testimonials, previewComponent: TestimonialsPreview },
  'testimonial-item': { component: TestimonialItem, previewComponent: TestimonialItemPreview },
  'timeline-slider-item': { component: TimelineSliderItem, previewComponent: TimelineSliderItemPreview },
  video: { component: MuxVideoPlayer, previewComponent: VideoPreview }
};

interface PreviewContentRendererProps {
  contentType: string;
  content: ContentfulContent;
}

export function PreviewContentRenderer({ contentType, content }: PreviewContentRendererProps) {
  // Use Live Preview for real-time updates of the server-provided data
  // This does NOT fetch new data, it just updates the existing data when changes occur in Contentful
  const liveContent = useContentfulLiveUpdates(content);
  const inspectorProps = useContentfulInspectorMode({
    entryId: liveContent?.sys?.id
  });

  // Get component configuration from client-side map
  const clientConfig = componentMap[contentType];
  if (!clientConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unsupported Content Type</h1>
          <p className="text-gray-600">Content type "{contentType}" is not supported for preview</p>
        </div>
      </div>
    );
  }

  const {
    component: Component,
    previewComponent: PreviewComponent,
    skeletonComponent: SkeletonComponent,
    usePageLayout
  } = clientConfig;

  // Use PreviewComponent if available, otherwise fall back to regular Component
  const ComponentToRender = PreviewComponent ?? Component;

  // For Page and PageList content types, use PageLayout wrapper like production
  if (usePageLayout && liveContent?.pageLayout) {
    const pageLayout = liveContent.pageLayout;
    const pageHeader = pageLayout?.header as any;
    const pageFooter = pageLayout?.footer as any;

    return (
      <div className="animate-in fade-in duration-500">
        <PageLayout header={pageHeader} footer={pageFooter}>
          <div {...inspectorProps}>
            <ComponentToRender {...(liveContent as any)} />
          </div>
        </PageLayout>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500" {...inspectorProps}>
      <ComponentToRender {...(liveContent as any)} />
    </div>
  );
}
