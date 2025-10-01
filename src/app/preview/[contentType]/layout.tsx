import { draftMode } from 'next/headers';
import { DraftModeIndicator } from '@/components/global/DraftModeIndicator';

interface PreviewLayoutProps {
  children: React.ReactNode;
}

/**
 * Preview Layout
 * 
 * Wraps preview pages with draft mode indicator and ensures draft mode is enabled.
 * This server component can access draft mode status and pass it to client components.
 */
export default async function PreviewLayout({ children }: PreviewLayoutProps) {
  const { isEnabled } = await draftMode();

  return (
    <>
      <DraftModeIndicator />
      {!isEnabled && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-red-500 text-white text-center py-2 text-sm font-medium">
          ⚠️ Draft Mode Not Enabled - You may not see the latest content
        </div>
      )}
      <div className={isEnabled ? 'pt-12' : 'pt-12'}>
        {children}
      </div>
    </>
  );
}
