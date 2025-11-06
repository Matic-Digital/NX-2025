/**
 * Universal Preview Page
 *
 * A single dynamic route that handles previewing all Contentful content types.
 * Displays any component in a centered layout with Contentful Live Preview integration.
 */

 

import { Suspense as _Suspense } from 'react';
import { ContentfulPreviewProvider } from '@/components/global/ContentfulLivePreview';
import { PreviewContentRenderer } from './PreviewContentRenderer';

// API function imports only (no component imports)
import { getAccordionById, getAccordionItemById } from '@/components/Accordion/AccordionApi';
import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { getButtonById } from '@/components/Button/ButtonApi';
import { getCollectionById } from '@/components/Collection/CollectionApi';
import { getContactCardById } from '@/components/ContactCard/ContactCardApi';
import { getContentById } from '@/components/Content/ContentApi';
import { getContentGridById, getContentGridItemById } from '@/components/ContentGrid/ContentGridApi';
import { getCtaBannerById } from '@/components/CtaBanner/CtaBannerApi';
import { getCtaGridById } from '@/components/CtaGrid/CtaGridApi';
import { getEventById } from '@/components/Event/EventApi';
import { getFooterById } from '@/components/Footer/FooterApi';
import { getHubspotFormById } from '@/components/Forms/HubspotForm/HubspotFormApi';
import { getHeaderById } from '@/components/Header/HeaderApi';
import { getImageById } from '@/components/Image/ImageApi';
import { getImageBetweenById } from '@/components/ImageBetween/ImageBetweenApi';
import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';
import { getMenuById } from '@/components/Menu/MenuApi';
import { getMenuItemById } from '@/components/MenuItem/MenuItemApi';
import { getModalById } from '@/components/Modals/ModalApi';
import { getLocationById } from '@/components/OfficeLocation/OfficeLocationApi';
import { getPageListById } from '@/components/PageList/PageListApi';
import { getPageById } from '@/components/Page/PageApi';
import { getPostById } from '@/components/Post/PostApi';
import { getProductById } from '@/components/Product/ProductApi';
import { getRegionsMapById } from '@/components/Region/RegionApi';
import { getRegionStatsById } from '@/components/RegionStats/RegionStatsApi';
import { getRegionStatItemById } from '@/components/RegionStats/RegionStatItem/RegionStatItemApi';
import { getRichContentById } from '@/components/RichContent/RichContentApi';
import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
import { getServiceById } from '@/components/Service/ServiceApi';
import { getSliderById } from '@/components/Slider/SliderApi';
import { getSocialById } from '@/components/Social/SocialApi';
import { getSolutionById } from '@/components/Solution/SolutionApi';
import { getTeamMemberById } from '@/components/TeamMember/TeamMemberApi';
import { getTestimonialsById, getTestimonialItemById } from '@/components/Testimonials/TestimonialsApi';
import { getTimelineSliderItemById } from '@/components/TimelineSlider/TimelineSliderItemApi';
import { getVideoById } from '@/components/Video/VideoApi';
// All component imports removed - components are now handled in PreviewContentRenderer.tsx

interface ContentfulContent {
  sys: { id: string };
  pageLayout?: {
    header?: unknown;
    footer?: unknown;
  };
  [key: string]: unknown;
}

// PreviewContentProps interface removed - no longer needed

// ProductAsPage component moved to PreviewContentRenderer.tsx where Page component is imported

// Helper function to get API component name
function _getApiComponentName(contentType: string): string {
  switch (contentType) {
    case 'page-list':
      return 'PageList';
    case 'hubspot-form':
      return 'HubspotForm';
    default:
      return contentType.charAt(0).toUpperCase() + contentType.slice(1);
  }
}

// Helper function to get fetch function for content type without importing components
function getFetchFunction(contentType: string): ((id: string, preview: boolean) => Promise<unknown>) | null {
  switch (contentType) {
    case 'accordion':
      return getAccordionById;
    case 'accordion-item':
      return getAccordionItemById;
    case 'banner-hero':
      return getBannerHero;
    case 'button':
      return getButtonById;
    case 'collection':
      return getCollectionById;
    case 'contact-card':
      return getContactCardById;
    case 'content':
      return getContentById;
    case 'content-grid':
      return getContentGridById;
    case 'content-grid-item':
      return getContentGridItemById;
    case 'cta-banner':
      return getCtaBannerById;
    case 'cta-grid':
      return getCtaGridById;
    case 'event':
    case 'event-detail':
      return getEventById;
    case 'footer':
      return getFooterById;
    case 'hubspot-form':
      return getHubspotFormById;
    case 'header':
      return getHeaderById;
    case 'image':
      return getImageById;
    case 'image-between':
      return getImageBetweenById;
    case 'mega-menu':
      return getMegaMenuById;
    case 'menu':
      return getMenuById;
    case 'menu-item':
      return getMenuItemById;
    case 'modal':
      return getModalById;
    case 'office-location':
      return getLocationById;
    case 'page':
      return getPageById;
    case 'page-list':
      return getPageListById;
    case 'post':
      return getPostById;
    case 'product':
      return getProductById;
    case 'regions-map':
      return getRegionsMapById;
    case 'region-stats':
      return getRegionStatsById;
    case 'region-stat-item':
      return getRegionStatItemById;
    case 'rich-text':
      return getRichContentById;
    case 'section-heading':
      return getSectionHeadingById;
    case 'service':
      return getServiceById;
    case 'slider':
      return getSliderById;
    case 'social':
      return getSocialById;
    case 'solution':
      return getSolutionById;
    case 'team-member':
      return getTeamMemberById;
    case 'testimonials':
      return getTestimonialsById;
    case 'testimonial-item':
      return getTestimonialItemById;
    case 'timeline-slider-item':
      return getTimelineSliderItemById;
    case 'video':
      return getVideoById;
    default:
      return null;
  }
}

// PreviewContentRenderer moved to separate client component file

// Legacy component removed - now using server-side data fetching with separate client component

function _LoadingFallback() {
  return <div className="min-h-screen">{/* No spinner - just empty space while routing */}</div>;
}

interface PreviewPageProps {
  params: Promise<{ contentType: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { contentType } = resolvedParams;
  const id = Array.isArray(resolvedSearchParams.id) ? resolvedSearchParams.id[0] : resolvedSearchParams.id;

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Missing ID</h1>
          <p className="text-gray-600">No ID provided for {contentType} preview</p>
        </div>
      </div>
    );
  }

  // Get the fetch function for this content type without importing components
  const fetchFn = getFetchFunction(contentType);
  
  if (!fetchFn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unsupported Content Type</h1>
          <p className="text-gray-600">Content type "{contentType}" is not supported for preview</p>
        </div>
      </div>
    );
  }

  // Server-side data fetching using server-side credentials
  let content: ContentfulContent | null = null;
  let error: string | null = null;

  try {
    // Fetch data server-side using the fetchFn with preview=true
    console.warn(`[Preview] Fetching ${contentType} with ID: ${id}`);
    const fetchedContent = await fetchFn(id, true);
    
    // Debug logging for accordion enrichment
    if (contentType === 'accordion' && fetchedContent) {
      const accordion = fetchedContent as any;
      console.warn(`[Preview] Accordion fetched:`, {
        id: accordion.sys?.id,
        title: accordion.title,
        hasItems: !!accordion.itemsCollection?.items,
        itemCount: accordion.itemsCollection?.items?.length || 0,
        firstItemHasData: accordion.itemsCollection?.items?.[0]?.title ? true : false
      });
    }
    
    content = fetchedContent as ContentfulContent;
  } catch (err) {
    // For HubSpot forms, try fallback to published content if preview fails
    if (
      contentType === 'hubspot-form' &&
      err instanceof Error &&
      (err.message.includes('Authentication failed') ||
        err.message.includes('access token') ||
        err.message.includes('invalid token'))
    ) {
      try {
        const fallbackContent = await fetchFn(id, false);
        content = fallbackContent as ContentfulContent;
      } catch {
        error = err.message;
      }
    } else {
      error = err instanceof Error ? err.message : `Failed to fetch ${contentType}`;
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600 mb-4">Error fetching {contentType}: {error}</p>
          <p className="mt-2 text-sm text-gray-500">ID: {id}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{contentType} Not Found</h1>
          <p className="text-gray-600">No {contentType} found with ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <ContentfulPreviewProvider isPreviewMode={true}>
      <PreviewContentRenderer 
        contentType={contentType}
        content={content}
      />
    </ContentfulPreviewProvider>
  );
}
