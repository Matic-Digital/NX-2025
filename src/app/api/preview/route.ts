import { draftMode } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const pageListSlug = searchParams.get('pageListSlug');
  const headerName = searchParams.get('headerName');
  const bannerHeroId = searchParams.get('bannerHeroId');
  const id = searchParams.get('id'); // Used for footer previews

  // Check the secret and validate it
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // Enable Draft Mode by setting the cookie
  // In Next.js 15, draftMode() returns a promise that must be awaited
  const draft = await draftMode();
  draft.enable();

  // Determine redirect target based on provided parameters
  // Priority: slug > pageListSlug > headerName > bannerHeroId > footerId
  if (slug) {
    return NextResponse.redirect(new URL(`/page-preview?slug=${slug}`, request.url));
  } else if (pageListSlug) {
    return NextResponse.redirect(
      new URL(`/page-list-preview?pageListSlug=${pageListSlug}`, request.url)
    );
  } else if (headerName) {
    return NextResponse.redirect(new URL(`/header-preview?headerName=${headerName}`, request.url));
  } else if (bannerHeroId) {
    return NextResponse.redirect(
      new URL(`/banner-hero-preview?bannerHeroId=${bannerHeroId}`, request.url)
    );
  } else if (id) {
    return NextResponse.redirect(new URL(`/footer-preview?footerId=${id}`, request.url));
  }

  // If no valid parameters were provided
  return NextResponse.json({ message: 'No valid preview parameters provided' }, { status: 400 });
}
