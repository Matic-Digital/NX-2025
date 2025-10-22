import { draftMode } from 'next/headers';

interface PreviewLayoutProps {
  children: React.ReactNode;
}

/**
 * Preview Layout
 * 
 * Wraps preview pages for Contentful Live Preview.
 * This server component can access draft mode status and pass it to client components.
 */
export default async function PreviewLayout({ children }: PreviewLayoutProps) {
  // Draft mode is still enabled for functionality, just not showing banners
  const { isEnabled: _isEnabled } = await draftMode();

  return (
    <>
      {/* Draft mode banners removed per user request */}
      <div>
        {children}
      </div>
    </>
  );
}
