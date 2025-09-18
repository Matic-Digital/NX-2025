import { draftMode, cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Import all the API functions
import { getContentGridById, getContentGridItemById } from '@/lib/contentful-api/content-grid';
import { getPageById } from '@/lib/contentful-api/page';
import { getPageListById } from '@/lib/contentful-api/page-list';
import { getBannerHero } from '@/components/BannerHero/BannerHeroApi';
import { getButtonById } from '@/components/Button/ButtonApi';
import { getContentById } from '@/components/Content/ContentApi';
import { getCtaBannerById } from '@/components/CtaBanner/CtaBannerApi';
import { getFooterById } from '@/lib/contentful-api/footer';
import { getHeaderById } from '@/lib/contentful-api/header';
import { getImageById } from '@/lib/contentful-api/image';
import { getImageBetweenById } from '@/lib/contentful-api/image-between';
import { getProductById } from '@/lib/contentful-api/product';
import { getSectionHeadingById } from '@/components/SectionHeading/SectionHeadingApi';
import { getServiceById } from '@/lib/contentful-api/service';
import { getSliderById } from '@/components/Slider/SliderApi';
import { getSliderItemById } from '@/components/Slider/SliderItemApi';
import { getSocialById } from '@/lib/contentful-api/social';
import { getSolutionById } from '@/lib/contentful-api/solution';

// Content type to API function mapping
const contentTypeMap = {
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
  product: {
    fetchFn: getProductById,
    previewPath: '/preview/product',
    entityName: 'Product'
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
  }
} as const;

type ContentType = keyof typeof contentTypeMap;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contentType: string }> }
) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');
  const resolvedParams = await params;
  const contentType = resolvedParams.contentType as ContentType;

  // Validate required parameters
  if (!secret || !id) {
    return NextResponse.json({ message: 'No secret or id provided' }, { status: 400 });
  }

  // Validate secret
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // Validate content type
  if (!contentTypeMap[contentType]) {
    return NextResponse.json(
      { message: `Unsupported content type: ${contentType}` },
      { status: 400 }
    );
  }

  const { fetchFn, previewPath, entityName } = contentTypeMap[contentType];

  try {
    // Fetch the content using the appropriate API function
    const content = await fetchFn(id, true);

    // Type-safe logging - check if content has sys property
    const contentId =
      content &&
      typeof content === 'object' &&
      'sys' in content &&
      content.sys &&
      typeof content.sys === 'object' &&
      'id' in content.sys
        ? content.sys.id
        : 'unknown';
    console.log(`enable-draft-${contentType}`, contentId, id);

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
    return NextResponse.redirect(new URL(`${previewPath}?id=${id}`, request.url));
  } catch (error) {
    console.error(`Error enabling draft for ${contentType}:`, error);
    return NextResponse.json({ message: `Error fetching ${entityName}` }, { status: 500 });
  }
}
