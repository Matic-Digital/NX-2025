'use client';

import Link from 'next/link';

import { Mail, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import { ModalCtaButton } from '@/components/Button/ModalCtaButton';

import type { ContactCard } from '@/components/ContactCard/ContactCardSchema';

interface ContactCardContentProps {
  contactCard: ContactCard;
  inspectorProps: (options: { fieldId: string }) => Record<string, unknown>;
  hasCta: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  IconComponent: React.ComponentType<{ className?: string }>;
  onModalOpen: (modal: Record<string, unknown>, type: 'quote' | 'support') => void;
}

/**
 * ContactCard content component - handles the main content rendering
 */
export function ContactCardContent({
  contactCard,
  inspectorProps,
  hasCta,
  hasPhone,
  hasEmail,
  IconComponent,
  onModalOpen
}: ContactCardContentProps) {
  return (
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
              onModalOpen={onModalOpen}
            />
          </div>
        )}
      </Box>
    </Box>
  );
}
