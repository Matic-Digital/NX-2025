import { cookies, draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { constantTimeCompare } from '@/lib/security-utils';

// Import all the API functions
import { getAccordionById, getAccordionItemById } from '@/components/Accordion/AccordionApi';
import { getAgendaItemById } from '@/components/AgendaItem/AgendaItemApi';
import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { getButtonById } from '@/components/Button/ButtonApi';
import { getCollectionById } from '@/components/Collection/CollectionApi';
import { getContactCardById } from '@/components/ContactCard/ContactCardApi';
import { getContentById } from '@/components/Content/ContentApi';
import {
  getContentGridById,
  getContentGridItemById
} from '@/components/ContentGrid/ContentGridApi';
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
import { getPageById } from '@/components/Page/PageApi';
import { getPageListById } from '@/components/PageList/PageListApi';
import { getPostById } from '@/components/Post/PostApi';
import { getProductById } from '@/components/Product/ProductApi';
import { getRegionsMapById } from '@/components/Region/RegionApi';
import { getRegionStatItemById } from '@/components/RegionStats/RegionStatItem/RegionStatItemApi';
import { getRegionStatsById } from '@/components/RegionStats/RegionStatsApi';
import { getRichContentById } from '@/components/RichContent/RichContentApi';
import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
import { getServiceById } from '@/components/Service/ServiceApi';
import { getSliderById } from '@/components/Slider/SliderApi';
import { getSliderItemById } from '@/components/Slider/SliderItemApi';
import { getSocialById } from '@/components/Social/SocialApi';
import { getSolutionById } from '@/components/Solution/SolutionApi';
import { getTeamMemberById } from '@/components/TeamMember/TeamMemberApi';
import {
  getTestimonialItemById,
  getTestimonialsById
} from '@/components/Testimonials/TestimonialsApi';
import { getTimelineSliderItemById } from '@/components/TimelineSlider/TimelineSliderItemApi';
import { getVideoById } from '@/components/Video/VideoApi';

// Content type to API function mapping
const contentTypeMap = {
  accordion: {
    fetchFn: getAccordionById,
    previewPath: '/preview/accordion',
    entityName: 'Accordion'
  },
  'accordion-item': {
    fetchFn: getAccordionItemById,
    previewPath: '/preview/accordion-item',
    entityName: 'AccordionItem'
  },
  'agenda-item': {
    fetchFn: getAgendaItemById,
    previewPath: '/preview/agenda-item',
    entityName: 'AgendaItem'
  },
  'banner-hero': {
    fetchFn: getBannerHero,
    previewPath: '/preview/banner-hero',
    entityName: 'BannerHero'
  },
  button: {
    fetchFn: getButtonById,
    previewPath: '/preview/button',
    entityName: 'Button'
  },
  collection: {
    fetchFn: getCollectionById,
    previewPath: '/preview/collection',
    entityName: 'Collection'
  },
  'contact-card': {
    fetchFn: getContactCardById,
    previewPath: '/preview/contact-card',
    entityName: 'ContactCard'
  },
  content: {
    fetchFn: getContentById,
    previewPath: '/preview/content',
    entityName: 'Content'
  },
  'content-grid': {
    fetchFn: getContentGridById,
    previewPath: '/preview/content-grid',
    entityName: 'ContentGrid'
  },
  'content-grid-item': {
    fetchFn: getContentGridItemById,
    previewPath: '/preview/content-grid-item',
    entityName: 'ContentGridItem'
  },
  'cta-banner': {
    fetchFn: getCtaBannerById,
    previewPath: '/preview/cta-banner',
    entityName: 'CtaBanner'
  },
  'cta-grid': {
    fetchFn: getCtaGridById,
    previewPath: '/preview/cta-grid',
    entityName: 'CtaGrid'
  },
  event: {
    fetchFn: getEventById,
    previewPath: '/preview/event',
    entityName: 'Event'
  },
  'event-detail': {
    fetchFn: getEventById,
    previewPath: '/preview/event-detail',
    entityName: 'Event Detail'
  },
  footer: {
    fetchFn: getFooterById,
    previewPath: '/preview/footer',
    entityName: 'Footer'
  },
  header: {
    fetchFn: getHeaderById,
    previewPath: '/preview/header',
    entityName: 'Header'
  },
  'hubspot-form': {
    fetchFn: getHubspotFormById,
    previewPath: '/preview/hubspot-form',
    entityName: 'HubspotForm'
  },
  image: {
    fetchFn: getImageById,
    previewPath: '/preview/image',
    entityName: 'Image'
  },
  'image-between': {
    fetchFn: getImageBetweenById,
    previewPath: '/preview/image-between',
    entityName: 'ImageBetween'
  },
  'mega-menu': {
    fetchFn: getMegaMenuById,
    previewPath: '/preview/mega-menu',
    entityName: 'MegaMenu'
  },
  menu: {
    fetchFn: getMenuById,
    previewPath: '/preview/menu',
    entityName: 'Menu'
  },
  'menu-item': {
    fetchFn: getMenuItemById,
    previewPath: '/preview/menu-item',
    entityName: 'MenuItem'
  },
  modal: {
    fetchFn: getModalById,
    previewPath: '/preview/modal',
    entityName: 'Modal'
  },
  'office-location': {
    fetchFn: getLocationById,
    previewPath: '/preview/office-location',
    entityName: 'OfficeLocation'
  },
  page: {
    fetchFn: getPageById,
    previewPath: '/preview/page',
    entityName: 'Page'
  },
  'page-list': {
    fetchFn: getPageListById,
    previewPath: '/preview/page-list',
    entityName: 'PageList'
  },
  post: {
    fetchFn: getPostById,
    previewPath: '/preview/post',
    entityName: 'Post'
  },
  product: {
    fetchFn: getProductById,
    previewPath: '/preview/product',
    entityName: 'Product'
  },
  'regions-map': {
    fetchFn: getRegionsMapById,
    previewPath: '/preview/regions-map',
    entityName: 'RegionsMap'
  },
  'region-stats': {
    fetchFn: getRegionStatsById,
    previewPath: '/preview/region-stats',
    entityName: 'RegionStats'
  },
  'region-stat-item': {
    fetchFn: getRegionStatItemById,
    previewPath: '/preview/region-stat-item',
    entityName: 'RegionStatItem'
  },
  'rich-text': {
    fetchFn: getRichContentById,
    previewPath: '/preview/rich-text',
    entityName: 'RichText'
  },
  'section-heading': {
    fetchFn: getSectionHeadingById,
    previewPath: '/preview/section-heading',
    entityName: 'SectionHeading'
  },
  service: {
    fetchFn: getServiceById,
    previewPath: '/preview/service',
    entityName: 'Service'
  },
  slider: {
    fetchFn: getSliderById,
    previewPath: '/preview/slider',
    entityName: 'Slider'
  },
  'slider-item': {
    fetchFn: getSliderItemById,
    previewPath: '/preview/slider-item',
    entityName: 'SliderItem'
  },
  social: {
    fetchFn: getSocialById,
    previewPath: '/preview/social',
    entityName: 'Social'
  },
  solution: {
    fetchFn: getSolutionById,
    previewPath: '/preview/solution',
    entityName: 'Solution'
  },
  'team-member': {
    fetchFn: getTeamMemberById,
    previewPath: '/preview/team-member',
    entityName: 'TeamMember'
  },
  testimonials: {
    fetchFn: getTestimonialsById,
    previewPath: '/preview/testimonials',
    entityName: 'Testimonials'
  },
  'testimonial-item': {
    fetchFn: getTestimonialItemById,
    previewPath: '/preview/testimonial-item',
    entityName: 'TestimonialItem'
  },
  'timeline-slider-item': {
    fetchFn: getTimelineSliderItemById,
    previewPath: '/preview/timeline-slider-item',
    entityName: 'TimelineSliderItem'
  },
  video: {
    fetchFn: getVideoById,
    previewPath: '/preview/video',
    entityName: 'Video'
  }
};

type ContentType = keyof typeof contentTypeMap;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contentType: string }> }
) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');
  const locale = searchParams.get('locale');
  const slug = searchParams.get('slug');
  const resolvedParams = await params;
  const contentType = resolvedParams.contentType as ContentType;

  // Clean up locale if it contains error text
  const cleanLocale = locale && !locale.includes('NOT_FOUND') ? locale : null;

  // Validate secret first (authentication before parameter validation)
  const expectedSecret = process.env.CONTENTFUL_PREVIEW_SECRET;
  if (!expectedSecret || !secret || !constantTimeCompare(secret, expectedSecret)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Validate required parameters after authentication
  if (!id) {
    return NextResponse.json({ message: 'No id provided' }, { status: 400 });
  }

  // Validate content type using secure property access
  if (!Object.prototype.hasOwnProperty.call(contentTypeMap, contentType)) {
    return NextResponse.json(
      { message: `Unsupported content type: ${contentType}` },
      { status: 400 }
    );
  }

  // Safe property access after validation with proper typing
  const contentTypeConfig = Object.getOwnPropertyDescriptor(contentTypeMap, contentType)?.value as
    | {
        fetchFn: (id: string, preview?: boolean, locale?: string) => Promise<unknown>;
        previewPath: string;
        entityName: string;
      }
    | undefined;

  if (!contentTypeConfig) {
    return NextResponse.json(
      { message: `Invalid content type configuration: ${contentType}` },
      { status: 500 }
    );
  }

  const { fetchFn, previewPath, entityName } = contentTypeConfig;

  try {
    // Fetch the content using the appropriate API function
    // For Post, try to auto-detect locale or use default
    let content;
    if (contentType === 'post') {
      // Post API supports locale parameter - try with detected locale first
      if (cleanLocale) {
        content = await (
          fetchFn as (id: string, preview: boolean, locale?: string) => Promise<unknown>
        )(id, true, cleanLocale);
      } else {
        // Auto-detect: try default locale first, then fallback to any locale
        try {
          content = await (
            fetchFn as (id: string, preview: boolean, locale?: string) => Promise<unknown>
          )(id, true, 'en-US');
        } catch {
          // If en-US fails, try without locale (will use current locale detection in PostApi)
          content = await fetchFn(id, true);
        }
      }
    } else {
      // Standard call for other content types
      content = await fetchFn(id, true);
    }

    // Type-safe logging - check if content has sys property
    const _contentId =
      content &&
      typeof content === 'object' &&
      'sys' in content &&
      content.sys &&
      typeof content.sys === 'object' &&
      'id' in (content.sys as Record<string, unknown>)
        ? ((content.sys as Record<string, unknown>).id as string)
        : 'unknown';

    if (!content) {
      return NextResponse.json({ message: `${entityName} not found` }, { status: 404 });
    }

    // Enable draft mode
    const draft = await draftMode();
    draft.enable();

    // Handle preview bypass cookie
    const cookieStore = await cookies();
    const cookie = cookieStore.get('__prerender_bypass');

    if (cookie?.value) {
      (await cookies()).set({
        name: '__prerender_bypass',
        value: cookie.value,
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'none'
      });
    }

    // Redirect to the appropriate preview page
    // Build query parameters including locale and slug if provided
    const queryParams = new URLSearchParams({ id });
    if (cleanLocale) queryParams.set('locale', cleanLocale);
    if (slug) queryParams.set('slug', slug);

    return NextResponse.redirect(new URL(`${previewPath}?${queryParams.toString()}`, request.url));
  } catch {
    return NextResponse.json({ message: `Error fetching ${entityName}` }, { status: 500 });
  }
}

// Handle POST requests for security testing
export async function POST(
  request: Request,
  { params }: { params: Promise<{ contentType: string }> }
) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  // Check for secret in request body as well
  let bodySecret: string | undefined;
  try {
    const body = await request.json() as { secret?: string };
    bodySecret = body.secret;
  } catch {
    // Invalid JSON or no body
  }
  
  const providedSecret = secret ?? bodySecret;
  
  // Validate secret first (authentication before parameter validation)
  const expectedSecret = process.env.CONTENTFUL_PREVIEW_SECRET;
  if (!expectedSecret || !providedSecret || !constantTimeCompare(providedSecret, expectedSecret)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  // For POST requests, redirect to GET with same parameters
  const resolvedParams = await params;
  const contentType = resolvedParams.contentType;
  
  return NextResponse.json({ 
    message: 'Use GET method for draft preview',
    method: 'GET',
    endpoint: `/api/enable-draft/${contentType}`
  }, { status: 405 });
}
