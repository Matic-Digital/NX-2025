import { draftMode } from 'next/headers';
import Link from 'next/link';

/**
 * Draft Mode Indicator
 *
 * A simple component that shows whether draft mode is currently enabled.
 * Useful for debugging and confirming that preview mode is working correctly.
 */
export async function DraftModeIndicator() {
  const { isEnabled } = await draftMode();

  if (!isEnabled) {
    return null; // Don't show anything when draft mode is disabled
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-center py-2 text-sm font-medium">
      🔍 Draft Mode Enabled - You are viewing unpublished content
      <Link href="/api/exit-preview" className="ml-4 underline hover:no-underline">
        Exit Preview
      </Link>
    </div>
  );
}
