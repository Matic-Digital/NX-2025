import { useContentfulInspectorMode } from '@contentful/live-preview/react';

import { ModalButtonContent } from '@/components/Button/components/ModalButtonContent';
import { useModalButtonLogic } from '@/components/Button/hooks/UseModalButtonLogic';
import { RequestAQuoteModal } from '@/components/Modals/RequestAQuoteModal';
import { RequestSupportModal } from '@/components/Modals/RequestSupportModal';

import type { Button as ButtonType } from '@/components/Button/ButtonSchema';
import type { Modal } from '@/components/Modals/Modal';

export type ModalType = 'quote' | 'support';

interface ModalCtaButtonProps {
  cta: ButtonType;
  variant: 'primary' | 'secondary' | 'outline' | 'white' | 'outlineWhite';
  setModalOpen: (open: boolean) => void;
  onModalOpen: (modal: Modal, modalType: ModalType) => void;
  modalOpen: boolean;
  selectedModal: Modal | null;
  className?: string;
}

const determineModalType = (cta: ButtonType): 'quote' | 'support' => {
  // Logic based on button text, modal title, etc.
  return cta.text?.toLowerCase().includes('quote') ? 'quote' : 'support';
};

/**
 * Main ModalCtaButton component - orchestrates all layers
 * Pure composition of logic and presentation layers
 */
export function ModalCtaButton({
  cta,
  variant,
  setModalOpen,
  onModalOpen,
  modalOpen,
  selectedModal,
  className
}: ModalCtaButtonProps) {
  const modalType = determineModalType(cta);
  // Business logic layer
  const { isModalButton, linkProps, handleModalClick } = useModalButtonLogic(cta, modalType);

  // Contentful Live Preview inspector props
  const inspectorProps = useContentfulInspectorMode({ entryId: cta.sys?.id });

  // Handle modal click
  const onClick = () => handleModalClick(onModalOpen);

  return (
    <>
      <ModalButtonContent
        cta={cta}
        variant={variant}
        className={className}
        isModalButton={isModalButton}
        linkProps={linkProps}
        onModalClick={onClick}
        inspectorProps={inspectorProps}
      />

      {/* Modals */}
      {selectedModal && modalType === 'quote' && (
        <RequestAQuoteModal
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          title={selectedModal.title ?? 'Request a Quote'}
          description={
            selectedModal.description ??
            'Please fill out the form below and we will get back to you shortly.'
          }
          formId={cta.modal?.form?.formId}
        />
      )}

      {selectedModal && modalType === 'support' && (
        <RequestSupportModal
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          title={selectedModal.title ?? 'Request Support'}
          description={
            selectedModal.description ??
            'Please fill out the form below and we will get back to you shortly.'
          }
          formId={cta.modal?.form?.formId}
        />
      )}
    </>
  );
}
