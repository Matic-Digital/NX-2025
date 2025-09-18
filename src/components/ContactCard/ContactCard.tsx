'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Phone, Mail, PhoneCall, Headset, Mic } from 'lucide-react';
import { Box } from '@/components/global/matic-ds';
import { Button } from '@/components/ui/button';
import type { ContactCard } from './ContactCardSchema';
import type { Modal } from '@/types/contentful/Modal';
import { ContactCardSkeleton } from './ContactCardSkeleton';
import { getContactCardById } from './ContactCardApi';
import { ModalCtaButton } from '@/components/Button/ModalCtaButton';
import { RequestAQuoteModal } from '@/components/global/modals/RequestAQuoteModal';
import { RequestSupportModal } from '@/components/global/modals/RequestSupportModal';

interface ContactCardProps extends Partial<ContactCard> {
  contactCardId?: string;
}

export function ContactCard(props: ContactCardProps) {
  const { contactCardId, ...restProps } = props;
  const [fetchedData, setFetchedData] = useState<ContactCard | null>(null);
  const [loading, setLoading] = useState(!!contactCardId);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModal, setSelectedModal] = useState<Modal | null>(null);
  const [modalType, setModalType] = useState<'quote' | 'support'>('support');

  const handleModalOpen = (modal: Modal, type: 'quote' | 'support') => {
    setSelectedModal(modal);
    setModalType(type);
    setModalOpen(true);
  };

  // Fetch data if contactCardId is provided
  useEffect(() => {
    if (!contactCardId) return;

    async function fetchContactCard() {
      try {
        setLoading(true);
        const data = await getContactCardById(contactCardId ?? '');
        setFetchedData(data);
      } catch (err) {
        console.error('Failed to fetch contact card:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contact card');
      } finally {
        setLoading(false);
      }
    }

    void fetchContactCard();
  }, [contactCardId]);

  // Use fetched data if available, otherwise use props data
  const contactCard = useContentfulLiveUpdates(fetchedData ?? restProps);
  const inspectorProps = useContentfulInspectorMode({ entryId: contactCard?.sys?.id });

  if (loading) {
    return <ContactCardSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-background border-border flex h-full flex-col rounded-lg border p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!contactCard) {
    return <ContactCardSkeleton />;
  }

  const hasCta = contactCard.cta;
  const hasPhone = contactCard.phone;
  const hasEmail = contactCard.email;

  // Icon mapping function
  const getIcon = () => {
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

  const IconComponent = getIcon();

  return (
    <>
      <Box
        direction="col"
        gap={3}
        className="bg-surface-invert h-full p-10"
        {...inspectorProps({ fieldId: 'title' })}
      >
        {/* Title */}
        <Box direction="row" gap={4} className="items-center">
          <div className="bg-black p-2" {...inspectorProps({ fieldId: 'icon' })}>
            <IconComponent className="size-8 text-white" />
          </div>
          <h3 className="text-headline-md" {...inspectorProps({ fieldId: 'title' })}>
            {contactCard.title}
          </h3>
        </Box>

        {/* Description */}
        <p className="text-body-sm" {...inspectorProps({ fieldId: 'description' })}>
          {contactCard.description}
        </p>

        {/* Contact Information */}
        <Box direction="col" gap={3} className="mt-auto mb-6">
          {hasPhone && (
            <Button
              variant="white"
              className="border-border-input text-body-sm text-body w-full justify-center border-1 [&_svg]:size-5"
            >
              <Box direction="row" gap={2} className="items-center">
                <Phone />
                <Link
                  href={`tel:${contactCard.phone ?? ''}`}
                  {...inspectorProps({ fieldId: 'phone' })}
                >
                  {contactCard.phone}
                </Link>
              </Box>
            </Button>
          )}

          {hasEmail && (
            <Button
              variant="white"
              className="border-border-input text-body-sm text-body w-full justify-center border-1 [&_svg]:size-5"
            >
              <Box direction="row" gap={2} className="items-center">
                <Mail />
                <Link
                  href={`mailto:${contactCard.email ?? ''}`}
                  {...inspectorProps({ fieldId: 'email' })}
                >
                  {contactCard.email}
                </Link>
              </Box>
            </Button>
          )}

          {/* CTA Button */}
          {hasCta && contactCard.cta && (
            <div {...inspectorProps({ fieldId: 'cta' })}>
              <ModalCtaButton
                cta={contactCard.cta}
                variant="white"
                modalType="support"
                className="border-border-input w-full justify-center border-1"
                onModalOpen={handleModalOpen}
              />
            </div>
          )}
        </Box>
      </Box>

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
        />
      )}
    </>
  );
}
