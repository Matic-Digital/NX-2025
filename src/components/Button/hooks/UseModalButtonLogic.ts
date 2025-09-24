import type { Button as ButtonType } from '@/components/Button/ButtonSchema';
import type { Modal } from '@/components/Modals/Modal';

export type ModalType = 'quote' | 'support';

/**
 * Business logic for ModalCtaButton behavior
 * Handles modal vs link decision making and URL generation
 */
export const useModalButtonLogic = (
  cta: ButtonType,
  modalType: ModalType = 'quote'
) => {
  // Determine if this should be a modal button
  const isModalButton = Boolean(cta.modal);

  // Generate link attributes
  const getLinkProps = () => {
    const href = cta.internalLink?.slug ?? cta.externalLink ?? '#';

    if (cta.externalLink) {
      return {
        href,
        target: '_blank' as const,
        rel: 'noopener noreferrer' as const
      };
    }

    return { href };
  };

  // Handle modal opening
  const handleModalClick = (onModalOpen: (modal: Modal, modalType: ModalType) => void) => {
    if (cta.modal) {
      onModalOpen(cta.modal, modalType);
    }
  };

  return {
    isModalButton,
    linkProps: getLinkProps(),
    handleModalClick
  };
};
