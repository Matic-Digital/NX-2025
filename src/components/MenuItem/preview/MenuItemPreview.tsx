'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { MenuItem } from '@/components/MenuItem/MenuItem';
import { menuItemFields } from '@/components/MenuItem/preview/MenuItemFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { LivePreview } from '@/components/Preview/LivePreview';

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
          <LivePreview
            componentName="MenuItem"
            data={liveMenuItem}
            requiredFields={['sys', 'title', 'text']}
          >
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
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={menuItemFields} data={liveMenuItem} />
        </div>
      </div>
    </div>
  );
}
