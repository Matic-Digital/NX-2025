import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { useModalButtonLogic } from '@/components/Button/hooks/UseModalButtonLogic';
import { ModalButtonContent } from '@/components/Button/components/ModalButtonContent';

import type { Button as ButtonType } from '@/components/Button/ButtonSchema';
import type { Modal } from '@/components/Modals/Modal';

export type ModalType = 'quote' | 'support';

interface ModalCtaButtonProps {
  cta: ButtonType;
  variant: 'primary' | 'outline' | 'white' | 'outlineWhite';
  modalType?: ModalType;
  onModalOpen: (modal: Modal, modalType: ModalType) => void;
  className?: string;
}

/**
 * Main ModalCtaButton component - orchestrates all layers
 * Pure composition of logic and presentation layers
 */
export function ModalCtaButton({
  cta,
  variant,
  modalType = 'quote',
  onModalOpen,
  className
}: ModalCtaButtonProps) {
  // Business logic layer
  const { isModalButton, linkProps, handleModalClick } = useModalButtonLogic(cta, modalType);
  
  // Contentful Live Preview inspector props
  const inspectorProps = useContentfulInspectorMode({ entryId: cta.sys?.id });

  // Handle modal click
  const onClick = () => handleModalClick(onModalOpen);

  return (
    <ModalButtonContent
      cta={cta}
      variant={variant}
      className={className}
      isModalButton={isModalButton}
      linkProps={linkProps}
      onModalClick={onClick}
      inspectorProps={inspectorProps}
    />
  );
}
