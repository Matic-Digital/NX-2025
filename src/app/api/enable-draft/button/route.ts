import { draftMode } from 'next/headers';
import { getButtonById } from '@/lib/contentful-api/button';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');

  // Check the secret and next parameters
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET || !id) {
    return new Response('Invalid token', { status: 401 });
  }

  // Fetch the button to check that it exists
  const button = await getButtonById(id, true);

  // If the button doesn't exist prevent draft mode from being enabled
  if (!button) {
    return new Response('Invalid id', { status: 401 });
  }

  // Enable Draft Mode by setting the cookie
  const draft = await draftMode();
  draft.enable();

  // Set additional cookie for live preview
  const response = new Response(null, {
    status: 307,
    headers: {
      Location: `/button-preview?id=${id}`,
      'Set-Cookie': [
        '__prerender_bypass=true; Path=/; HttpOnly; SameSite=None; Secure',
        '__next_preview_data=true; Path=/; HttpOnly; SameSite=None; Secure'
      ].join(', ')
    }
  });

  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
