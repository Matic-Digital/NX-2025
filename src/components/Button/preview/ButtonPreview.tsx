'use client';

import { ModalCtaButton } from '../ModalCtaButton';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { buttonFields } from '@/components/Button/preview/ButtonFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { createOrValidation, LivePreview } from '@/components/Preview/LivePreview';

import type { Button as ButtonType } from '@/components/Button/ButtonSchema';

/**
 * Button Preview Component
 *
 * This component is used in Contentful Live Preview to display Button components
 * with a live preview and field breakdown.
 */
export function ButtonPreview(props: Partial<ButtonType>) {
  // Contentful Live Preview integration
  const liveButton = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveButton?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <LivePreview
            componentName="Button"
            data={liveButton}
            customValidation={(data) =>
              createOrValidation(data, [['text', 'internalText']], ['sys'])
            }
          >
            <div className="p-8 flex justify-center">
              {(() => {
                const displayText = liveButton?.text ?? liveButton?.internalText ?? 'Button';

                // Determine which link field to target for inspector props
                const linkFieldId = liveButton?.internalLink
                  ? 'internalLink'
                  : liveButton?.externalLink
                    ? 'externalLink'
                    : liveButton?.modal
                      ? 'modal'
                      : null;

                return (
                  <div {...(linkFieldId ? inspectorProps({ fieldId: linkFieldId }) : {})}>
                    <ModalCtaButton
                      cta={{
                        sys: {
                          id: liveButton?.sys?.id ?? ''
                        },
                        internalText: displayText,
                        text: displayText,
                        internalLink: liveButton?.internalLink,
                        externalLink: liveButton?.externalLink,
                        modal: liveButton?.modal,
                        icon: liveButton?.icon
                      }}
                      variant="white"
                      className="border-border-input w-full justify-center border-1"
                    />
                  </div>
                );
              })()}
            </div>
          </LivePreview>

          {/* Field Breakdown */}
          <FieldBreakdown fields={buttonFields} data={liveButton} />
        </div>
      </div>
    </div>
  );
}
