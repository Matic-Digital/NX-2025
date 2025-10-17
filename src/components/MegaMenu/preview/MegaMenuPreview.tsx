'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { MegaMenuProvider } from '@/contexts/MegaMenuContext';

import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { megaMenuFields } from '@/components/MegaMenu/preview/MegaMenuFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { MegaMenu as MegaMenuType } from '@/components/MegaMenu/MegaMenuSchema';

/**
 * This component is used in Contentful Live Preview to display MegaMenu components
 * with a live preview and field breakdown.
 */
export function MegaMenuPreview(props: Partial<MegaMenuType>) {
  // Contentful Live Preview integration
  const liveMegaMenu = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveMegaMenu?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                MegaMenu
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid MegaMenu
                const hasRequiredFields = liveMegaMenu?.sys && liveMegaMenu?.title;

                if (hasRequiredFields) {
                  return (
                    <MegaMenuProvider>
                      <div className="overflow-hidden p-6 mt-12">
                        <MegaMenu
                          megaMenu={liveMegaMenu as MegaMenuType}
                          title={liveMegaMenu.title}
                          overflow={liveMegaMenu.overflow}
                          {...inspectorProps}
                        />
                      </div>
                    </MegaMenuProvider>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveMegaMenu?.title && <li>• Title is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={megaMenuFields} data={liveMegaMenu} />
        </div>
      </div>
    </div>
  );
}
