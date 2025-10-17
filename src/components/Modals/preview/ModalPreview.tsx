'use client';

import { useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { Button } from '@/components/ui/button';

import { modalFields } from '@/components/Modals/preview/ModalFields';
import { RequestAQuoteModal } from '@/components/Modals/RequestAQuoteModal';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';

import type { Modal } from '@/components/Modals/Modal';

/**
 * This component is used in Contentful Live Preview to display Modal components
 * with a live preview and field breakdown.
 */
export function ModalPreview(props: Partial<Modal>) {
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Contentful Live Preview integration
  const liveModal = useContentfulLiveUpdates(props);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveModal?.sys?.id });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Live Component Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Modal
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid Modal
                const hasRequiredFields = liveModal?.title && liveModal?.description;

                if (hasRequiredFields) {
                  return (
                    <div className="p-8 text-center">
                      {/* Modal Component */}
                      <RequestAQuoteModal
                        isOpen={true}
                        onOpenChange={setIsModalOpen}
                        formId={liveModal?.form?.formId}
                        title={liveModal.title}
                        description={liveModal.description}
                      />

                      {/* Show configuration status */}
                      <div className="mt-6 text-left max-w-md mx-auto">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Modal Configuration:
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Title: &quot;{liveModal.title}&quot;</li>
                          <li>• Description: &quot;{liveModal.description}&quot;</li>
                          <li>
                            • Form:{' '}
                            {liveModal?.form?.formId
                              ? `Form ID: ${liveModal.form.formId}`
                              : 'Using default form'}
                          </li>
                        </ul>
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveModal?.title && <li>• Title is required</li>}
                      {!liveModal?.description && <li>• Description is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown fields={modalFields} data={liveModal} />
        </div>
      </div>
    </div>
  );
}
