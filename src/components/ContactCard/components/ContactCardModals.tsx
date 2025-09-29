'use client';

import { RequestAQuoteModal } from '@/components/Modals/RequestAQuoteModal';
import { RequestSupportModal } from '@/components/Modals/RequestSupportModal';

import type { Modal } from '@/components/Modals/Modal';

interface ContactCardModalsProps {
  modalOpen: boolean;
  selectedModal: Modal | null;
  modalType: 'quote' | 'support';
  onOpenChange: (open: boolean) => void;
}

/**
 * ContactCard modals component - handles modal rendering
 */
export function ContactCardModals({
  modalOpen,
  selectedModal,
  modalType,
  onOpenChange
}: ContactCardModalsProps) {
  return (
    <>
      {selectedModal && modalType === 'quote' && (
        <RequestAQuoteModal
          isOpen={modalOpen}
          onOpenChange={onOpenChange}
          title={selectedModal.title ?? 'Request a Quote'}
          description={
            selectedModal.description ??
            'Please fill out the form below and we will get back to you shortly.'
          }
        />
      )}

      {selectedModal && modalType === 'support' && (
        <RequestSupportModal
          isOpen={modalOpen}
          onOpenChange={onOpenChange}
          title={selectedModal.title ?? 'Request Support'}
          description={
            selectedModal.description ??
            'Please fill out the form below and we will get back to you shortly.'
          }
        />
      )}
    </>
  );
}
