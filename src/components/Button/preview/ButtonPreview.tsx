'use client';

import { useState } from 'react';
import { ModalCtaButton } from '../ModalCtaButton';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { buttonFields } from '@/components/Button/preview/ButtonFields';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Button as ButtonType } from '@/components/Button/ButtonSchema';
import type { Modal } from '@/components/Modals/Modal';

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

  const [modalOpen, setModalOpen] = useState(false);
  const [_selectedModal, setSelectedModal] = useState<Modal | null>(null);

  const handleModalOpen = (modal: Modal, _modalType: 'quote' | 'support') => {
    setSelectedModal(modal);
    setModalOpen(true);
  };

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
                const hasRequiredFields =
                  liveButton?.sys && (liveButton?.internalText ?? liveButton?.text);

                if (hasRequiredFields) {
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
                        onModalOpen={handleModalOpen}
                        setModalOpen={setModalOpen}
                        modalOpen={modalOpen}
                        selectedModal={liveButton?.modal ?? null}
                      />
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="text-center text-gray-500">
                    <p>Preview will appear when required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!props.internalText && !props.text && (
                        <li>• Text or Internal Text is required</li>
                      )}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={buttonFields} data={liveButton} />
        </div>
      </div>
    </div>
  );
}
