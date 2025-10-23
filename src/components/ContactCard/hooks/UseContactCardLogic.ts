'use client';

import { useState } from 'react';

import { Headset, Mic, PhoneCall } from 'lucide-react';

import type { ContactCard } from '@/components/ContactCard/ContactCardSchema';
import type { Modal } from '@/components/Modals/Modal';

/**
 * Custom hook for ContactCard business logic
 */
export function useContactCardLogic(contactCard: ContactCard | null) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModal, setSelectedModal] = useState<Modal | null>(null);
  const [modalType, setModalType] = useState<'quote' | 'support'>('support');

  // Icon mapping function
  const getIcon = () => {
    if (!contactCard) return PhoneCall;

    switch (contactCard.icon) {
      case 'Phone':
        return PhoneCall;
      case 'Headset':
        return Headset;
      case 'Microphone':
        return Mic;
      default:
        return PhoneCall; // Default fallback
    }
  };

  const handleModalOpen = (modal: Modal, type: 'quote' | 'support') => {
    setSelectedModal(modal);
    setModalType(type);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedModal(null);
  };

  // Computed values
  const hasCta = contactCard?.cta ?? false;
  const hasPhone = contactCard?.phone ?? false;
  const hasEmail = contactCard?.email ?? false;
  const IconComponent = getIcon();

  return {
    modalOpen,
    selectedModal,
    modalType,
    handleModalOpen,
    handleModalClose,
    hasCta,
    hasPhone,
    hasEmail,
    IconComponent
  };
}
