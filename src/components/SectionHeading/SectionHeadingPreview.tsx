'use client';

import {
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { SectionHeading } from './SectionHeading';
import type { SectionHeading as SectionHeadingType } from './SectionHeadingSchema';

interface SectionHeadingPreviewProps extends Partial<SectionHeadingType> {
  sectionHeadingId?: string;
}

/**
 * SectionHeading Preview Component
 * 
 * This component is used in Contentful Live Preview to display SectionHeading components
 * with a live preview and field breakdown.
 */
export function SectionHeadingPreview(props: SectionHeadingPreviewProps) {
  // Contentful Live Preview integration
  const liveSectionHeading = useContentfulLiveUpdates(props);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                SectionHeading
              </span>
            </div>
            <div className="p-8">
              <SectionHeading {...liveSectionHeading} />
            </div>
          </div>

          {/* Field Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Breakdown</h2>
            <div className="space-y-4">
              
              {/* Overline Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Overline</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Small text that appears above the main title. Used for context or categorization.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.overline ? `"${props.overline}"` : 'Not set'}
                </div>
              </div>

              {/* Title Field */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Title</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main heading text. This is the primary content that users will see.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Description Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Supporting text that provides additional context or details about the section.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.description ? `"${props.description}"` : 'Not set'}
                </div>
              </div>

              {/* Variant Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Variant</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Controls the visual layout and styling. Options: Horizontal, Stacked, Centered, Default.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.variant ?? 'Default'}
                </div>
              </div>

              {/* CTA Collection Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">CTA Collection</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Call-to-action buttons that can link to pages or trigger modals. Maximum of 2 buttons.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.ctaCollection?.items?.length ? 
                    `${props.ctaCollection.items.length} button(s) configured` : 
                    'No buttons set'
                  }
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
