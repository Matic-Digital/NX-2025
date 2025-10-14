'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { Button as ButtonComponent } from '@/components/ui/button';
import type { Button as ButtonType } from './ButtonSchema';

interface ButtonPreviewProps extends Partial<ButtonType> {
  buttonId?: string;
}

/**
 * Button Preview Component
 * 
 * This component is used in Contentful Live Preview to display Button components
 * with a live preview and field breakdown.
 */
export function ButtonPreview(props: ButtonPreviewProps) {
  // Contentful Live Preview integration
  const liveButton = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveButton?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Button
              </span>
            </div>
            <div className="p-8 flex justify-center">
              {(() => {
                // Check if we have required fields for a valid Button
                const hasRequiredFields = liveButton?.sys && (liveButton?.internalText ?? liveButton?.text);
                
                if (hasRequiredFields) {
                  const displayText = liveButton?.text ?? liveButton?.internalText ?? 'Button';
                  const textFieldId = liveButton?.text ? 'text' : 'internalText';
                  
                  // Determine which link field to target for inspector props
                  const linkFieldId = liveButton?.internalLink ? 'internalLink' : 
                                     liveButton?.externalLink ? 'externalLink' : 
                                     liveButton?.modal ? 'modal' : null;
                  
                  return (
                    <div {...(linkFieldId ? inspectorProps({ fieldId: linkFieldId }) : {})}>
                      <ButtonComponent>
                        <span {...inspectorProps({ fieldId: textFieldId })}>
                          {displayText}
                        </span>
                      </ButtonComponent>
                    </div>
                  );
                }
                
                // Show preview placeholder when fields are missing
                return (
                  <div className="text-center text-gray-500">
                    <p>Preview will appear when required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.internalText && !props.text && <li>• Text or Internal Text is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Breakdown</h2>
            <div className="space-y-4">
              
              {/* Internal Text Field */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Internal Text</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The internal text identifier for this button. Used for content management and fallback display.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.internalText ? `"${props.internalText}"` : 'Not set'}
                </div>
              </div>

              {/* Text Field */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Text</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The display text that appears on the button. This is what users will see and click.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.text ? `"${props.text}"` : 'Not set'}
                </div>
              </div>

              {/* Internal Link Field */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Internal Link</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Link to an internal page within the site. Takes precedence over external links when both are set.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.internalLink ? 
                    `Internal page: /${props.internalLink.slug}` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* External Link Field */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">External Link</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Link to an external website. Used when the button should navigate away from the site.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.externalLink ? `"${props.externalLink}"` : 'Not set'}
                </div>
              </div>

              {/* Modal Field */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Modal</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Modal dialog that opens when the button is clicked. Used for forms, confirmations, or additional content.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.modal ? 
                    `Modal configured (${props.modal.title ?? 'Untitled'})` : 
                    'Not set'
                  }
                </div>
              </div>

              {/* Icon Field */}
              <div className="border-l-4 border-pink-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Icon</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optional icon that appears alongside the button text. Currently supports Email icon.
                </p>
                <div className="text-xs text-gray-500">
                  Current value: {props.icon ? `"${props.icon}"` : 'Not set'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
