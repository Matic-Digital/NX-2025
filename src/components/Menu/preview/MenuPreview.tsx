'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { MegaMenuProvider } from '@/contexts/MegaMenuContext';

import { Menu } from '@/components/Menu/Menu';
import { menuFields } from '@/components/Menu/preview/MenuFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Menu as MenuType } from '@/components/Menu/MenuSchema';

/**
 * This component is used in Contentful Live Preview to display Menu components
 * with a live preview and field breakdown.
 */
export function MenuPreview(props: Partial<MenuType>) {
  // Contentful Live Preview integration
  const liveMenu = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveMenu?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Menu
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Menu
                const hasRequiredFields =
                  liveMenu?.sys && liveMenu?.title && liveMenu?.itemsCollection;

                if (hasRequiredFields) {
                  return (
                    <MegaMenuProvider>
                      <div className="overflow-hidden p-6">
                        <Menu menu={liveMenu as MenuType} {...inspectorProps} />
                      </div>
                    </MegaMenuProvider>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveMenu?.title && <li>• Title is required</li>}
                      {!liveMenu?.itemsCollection && <li>• Items Collection is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={menuFields} data={liveMenu} />
        </div>
      </div>
    </div>
  );
}
