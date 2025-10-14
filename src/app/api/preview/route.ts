import { draftMode } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const sectionHeadingId = searchParams.get('sectionHeadingId');
  const bannerHeroId = searchParams.get('bannerHeroId');
  const imageId = searchParams.get('imageId');
  const ctaBannerId = searchParams.get('ctaBannerId');
  const buttonId = searchParams.get('buttonId');
  const socialId = searchParams.get('socialId');
  const serviceId = searchParams.get('serviceId');
  const solutionId = searchParams.get('solutionId');
  const productId = searchParams.get('productId');
  const sliderItemId = searchParams.get('sliderItemId');
  const sliderId = searchParams.get('sliderId');
  const contentGridItemId = searchParams.get('contentGridItemId');
  const contentGridId = searchParams.get('contentGridId');
  const contentId = searchParams.get('contentId');
  const headerId = searchParams.get('headerId');
  const footerId = searchParams.get('footerId');
  const pageId = searchParams.get('pageId');
  const pageListId = searchParams.get('pageListId');
  const imageBetweenId = searchParams.get('imageBetweenId');

  // Check the secret and validate it
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // Enable Draft Mode by setting the cookie
  // In Next.js 15, draftMode() returns a promise that must be awaited
  const draft = await draftMode();
  draft.enable();

  // Redirect to Section Heading preview
  if (sectionHeadingId) {
    return NextResponse.redirect(
      new URL(`/preview/section-heading?id=${sectionHeadingId}`, request.url)
    );
  }

  // Redirect to Banner Hero preview
  if (bannerHeroId) {
    return NextResponse.redirect(new URL(`/banner-hero-preview?id=${bannerHeroId}`, request.url));
  }

  // Redirect to Image preview
  if (imageId) {
    return NextResponse.redirect(new URL(`/image-preview?id=${imageId}`, request.url));
  }

  // Redirect to Slider Item preview
  if (sliderItemId) {
    return NextResponse.redirect(new URL(`/slider-item-preview?id=${sliderItemId}`, request.url));
  }

  // Redirect to Slider preview
  if (sliderId) {
    return NextResponse.redirect(new URL(`/slider-preview?id=${sliderId}`, request.url));
  }

  // Redirect to ContentGridItem preview
  if (contentGridItemId) {
    return NextResponse.redirect(
      new URL(`/content-grid-item-preview?id=${contentGridItemId}`, request.url)
    );
  }

  // Redirect to ContentGrid preview
  if (contentGridId) {
    return NextResponse.redirect(new URL(`/content-grid-preview?id=${contentGridId}`, request.url));
  }

  // Redirect to Content preview
  if (contentId) {
    return NextResponse.redirect(new URL(`/content-preview?id=${contentId}`, request.url));
  }

  // Redirect to Header preview
  if (headerId) {
    return NextResponse.redirect(new URL(`/header-preview?id=${headerId}`, request.url));
  }

  // Redirect to Footer preview
  if (footerId) {
    return NextResponse.redirect(new URL(`/footer-preview?id=${footerId}`, request.url));
  }

  // Redirect to Page preview
  if (pageId) {
    return NextResponse.redirect(new URL(`/page-preview?id=${pageId}`, request.url));
  }

  // Redirect to PageList preview
  if (pageListId) {
    return NextResponse.redirect(new URL(`/page-list-preview?id=${pageListId}`, request.url));
  }

  // Redirect to ImageBetween preview
  if (imageBetweenId) {
    return NextResponse.redirect(
      new URL(`/image-between-preview?id=${imageBetweenId}`, request.url)
    );
  }

  // Redirect to CTA Banner preview
  if (ctaBannerId) {
    return NextResponse.redirect(new URL(`/cta-banner-preview?id=${ctaBannerId}`, request.url));
  }

  // Redirect to Service preview
  if (serviceId) {
    return NextResponse.redirect(new URL(`/service-preview?id=${serviceId}`, request.url));
  }

  // Redirect to Button preview
  if (buttonId) {
    return NextResponse.redirect(new URL(`/button-preview?id=${buttonId}`, request.url));
  }

  // Redirect to Social preview
  if (socialId) {
    return NextResponse.redirect(new URL(`/social-preview?id=${socialId}`, request.url));
  }

  // Redirect to Solution preview
  if (solutionId) {
    return NextResponse.redirect(new URL(`/solution-preview?id=${solutionId}`, request.url));
  }

  // Redirect to Product preview
  if (productId) {
    return NextResponse.redirect(new URL(`/product-preview?id=${productId}`, request.url));
  }


  // If no valid parameters were provided
  return NextResponse.json(
    {
      message:
        'No valid content ID provided. Supported parameters: sectionHeadingId, bannerHeroId, imageId, ctaBannerId, buttonId, socialId'
    },
    { status: 400 }
  );
}
