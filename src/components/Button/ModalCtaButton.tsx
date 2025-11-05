import { useState } from 'react';
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
  setModalOpen?: (open: boolean) => void;
  onModalOpen?: (modal: Modal, modalType: ModalType) => void;
  modalOpen?: boolean;
  selectedModal?: Modal | null;
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
  // Internal state for when external props aren't provided
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [internalSelectedModal, setInternalSelectedModal] = useState<Modal | null>(null);

  const modalType = determineModalType(cta);

  // Use external state if provided, otherwise use internal state
  const isModalOpenState = modalOpen ?? internalModalOpen;
  const selectedModalState = selectedModal ?? internalSelectedModal;
  const setModalOpenState = setModalOpen ?? setInternalModalOpen;

  // Handle modal opening
  const handleInternalModalOpen = (modal: Modal, type: ModalType) => {
    if (onModalOpen) {
      onModalOpen(modal, type);
    } else {
      setInternalSelectedModal(modal);
      setInternalModalOpen(true);
    }
  };

  // Business logic layer
  const { isModalButton, linkProps, handleModalClick } = useModalButtonLogic(cta, modalType);

  // Contentful Live Preview inspector props
  const inspectorProps = useContentfulInspectorMode({ entryId: cta.sys?.id });

  // Handle modal click
  const onClick = () => handleModalClick(handleInternalModalOpen);

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
      {selectedModalState && modalType === 'quote' && (
        <RequestAQuoteModal
          isOpen={isModalOpenState}
          onOpenChange={setModalOpenState}
          title={selectedModalState.title ?? 'Request a Quote'}
          description={
            selectedModalState.description ??
            'Please fill out the form below and we will get back to you shortly.'
          }
          formId={cta.modal?.form?.formId}
        />
      )}

      {selectedModalState && modalType === 'support' && (
        <RequestSupportModal
          isOpen={isModalOpenState}
          onOpenChange={setModalOpenState}
          title={selectedModalState.title ?? 'Request Support'}
          description={
            selectedModalState.description ??
            'Please fill out the form below and we will get back to you shortly.'
          }
          formId={cta.modal?.form?.formId}
        />
      )}
      
      {/* Debug logging */}
      {console.warn('ModalCtaButton Debug:', {
        selectedModalState,
        modalType,
        ctaModal: cta.modal,
        formId: cta.modal?.form?.formId,
        isModalOpenState,
        fullCta: cta
      })}
    </>
  );
}
