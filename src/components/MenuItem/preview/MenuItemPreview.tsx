'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { MenuItem } from '@/components/MenuItem/MenuItem';
import { menuItemFields } from '@/components/MenuItem/preview/MenuItemFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { MenuItem as MenuItemType } from '@/components/MenuItem/MenuItemSchema';

/**
 * This component is used in Contentful Live Preview to display MenuItem components
 * with a live preview and field breakdown.
 */
export function MenuItemPreview(props: Partial<MenuItemType>) {
  // Contentful Live Preview integration
  const liveMenuItem = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveMenuItem?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                MenuItem
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid MenuItem
                const hasRequiredFields =
                  liveMenuItem?.sys &&
                  liveMenuItem?.title &&
                  liveMenuItem?.text &&
                  liveMenuItem?.description;

                if (hasRequiredFields) {
                  return (
                    <div className="overflow-hidden p-6 bg-gray-900">
                      <div className="flex gap-8">
                        {/* Vertical Layout */}
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Vertical Layout</p>
                          <MenuItem
                            menuItem={liveMenuItem as MenuItemType}
                            layout="vertical"
                            {...inspectorProps}
                          />
                        </div>
                        {/* Horizontal Layout */}
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Horizontal Layout</p>
                          <MenuItem
                            menuItem={liveMenuItem as MenuItemType}
                            layout="horizontal"
                            {...inspectorProps}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveMenuItem?.title && <li>• Title is required</li>}
                      {!liveMenuItem?.text && <li>• Text is required</li>}
                      {!liveMenuItem?.description && <li>• Description is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={menuItemFields} data={liveMenuItem} />
        </div>
      </div>
    </div>
  );
}
