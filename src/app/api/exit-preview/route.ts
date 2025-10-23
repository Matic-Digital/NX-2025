import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

import type { NextRequest } from 'next/server';

/**
 * Exit Preview API Route
 * Disables draft mode and redirects to the specified path or home page
 *
 * Query parameters:
 * - slug: The path to redirect to after disabling preview mode
 */
export async function GET(request: NextRequest) {
  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Get the redirect path
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get('slug') ?? '/';

  // Redirect to the page
  redirect(redirectPath);
}
