import type { Button as ButtonType } from '@/components/Button/ButtonSchema';
import type { Modal } from '@/components/Modals/Modal';

export type ModalType = 'quote' | 'support';

/**
 * Business logic for ModalCtaButton behavior
 * Handles modal vs link decision making and URL generation
 */
export const useModalButtonLogic = (cta: ButtonType, modalType: ModalType = 'quote') => {
  // Determine if this should be a modal button
  const isModalButton = Boolean(cta.modal) || modalType === 'support';

  // Generate link attributes
  const getLinkProps = () => {
    // Ensure internal links are absolute paths by adding leading slash
    const internalHref = cta.internalLink?.slug 
      ? `/${cta.internalLink.slug}` 
      : null;
    
    const href = internalHref ?? cta.externalLink ?? '#';

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
    } else if (modalType === 'support') {
      // For support modals, create a default modal object even if none is configured
      const defaultSupportModal: Modal = {
        title: 'Request Support',
        description: 'Please fill out the form below and we will get back to you shortly.'
      };
      onModalOpen(defaultSupportModal, modalType);
    }
  };

  return {
    isModalButton,
    linkProps: getLinkProps(),
    handleModalClick
  };
};
