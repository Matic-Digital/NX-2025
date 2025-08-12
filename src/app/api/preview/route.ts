import { draftMode } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const sectionHeadingId = searchParams.get('sectionHeadingId');
  const bannerHeroId = searchParams.get('bannerHeroId');

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
    return NextResponse.redirect(new URL(`/section-heading-preview?id=${sectionHeadingId}`, request.url));
  }

  // Redirect to Banner Hero preview
  if (bannerHeroId) {
    return NextResponse.redirect(new URL(`/banner-hero-preview?id=${bannerHeroId}`, request.url));
  }

  // If no valid parameters were provided
  return NextResponse.json({ message: 'No Section Heading ID or Banner Hero ID provided' }, { status: 400 });
}
