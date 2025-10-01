'use client';

import { BannerHero } from './BannerHero';
import type { BannerHero as BannerHeroType } from './BannerHeroSchema';

interface BannerHeroPreviewProps extends Partial<BannerHeroType> {
  bannerHeroId?: string;
}

/**
 * BannerHero Preview Component
 * 
 * This component is used in Contentful Live Preview to display BannerHero components
 * with a live preview and field breakdown.
 */
export function BannerHeroPreview(props: BannerHeroPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                BannerHero
              </span>
            </div>
            <div className="overflow-hidden">
              {props.sys && props.title && props.heading && props.backgroundImage ? (
                <BannerHero {...(props as BannerHeroType)} />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Preview will appear when all required fields are configured:</p>
                  <ul className="mt-2 text-sm">
                    {!props.title && <li>• Title is required</li>}
                    {!props.heading && <li>• Heading is required</li>}
                    {!props.backgroundImage && <li>• Background Image is required</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Field Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Breakdown</h2>
            <div className="space-y-4">
              
              {/* Title Field */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Title</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The main title for the banner hero section. This appears as the primary heading.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.title ? `"${props.title}"` : 'Not set'}
                </div>
              </div>

              {/* Heading Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Heading</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  A SectionHeading component that provides the main content structure including title, description, and CTAs.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.heading ? 
                    `SectionHeading configured (Title: "${props.heading.title || 'Not set'}")` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Background Image Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Background Image</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The background image that appears behind the hero content. Should be high-resolution and optimized for web.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.backgroundImage ? 
                    `Image configured (${props.backgroundImage.title || 'Untitled'})` : 
                    'Not set'
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
