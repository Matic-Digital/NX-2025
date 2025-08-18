import { getImageById } from '@/lib/contentful-api/image';
import { draftMode, cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');

  if (!secret || !id) {
    return NextResponse.json({ message: 'No secret or id provided' }, { status: 400 });
  }

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const image = await getImageById(id, true);
  console.log('enable-draft-image', image?.sys.id, id);

  if (!image) {
    return NextResponse.json({ message: 'Image not found' }, { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

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

  return NextResponse.redirect(new URL(`/image-preview?id=${id}`, request.url));
}
