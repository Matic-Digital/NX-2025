'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Phone, Mail, PhoneCall, Headset, Mic } from 'lucide-react';
import { Box } from '@/components/global/matic-ds';
import { Button } from '@/components/ui/button';
import type { ContactCard } from '@/types/contentful/ContactCard';

interface ContactCardProps extends ContactCard {
  className?: string;
}

export function ContactCard(props: ContactCardProps) {
  const contactCard = useContentfulLiveUpdates(props) as ContactCard;
  const inspectorProps = useContentfulInspectorMode({ entryId: contactCard?.sys?.id });

  console.log('ContactCard render', contactCard);

  if (!contactCard) {
    return null;
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
              <Link href={`tel:${contactCard.phone}`} {...inspectorProps({ fieldId: 'phone' })}>
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
              <Link href={`mailto:${contactCard.email}`} {...inspectorProps({ fieldId: 'email' })}>
                {contactCard.email}
              </Link>
            </Box>
          </Button>
        )}

        {/* CTA Button */}
        {hasCta && (
          <div {...inspectorProps({ fieldId: 'cta' })}>
            <Link
              href={contactCard.cta?.internalLink?.slug ?? contactCard.cta?.externalLink ?? '#'}
              {...(contactCard.cta?.externalLink
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="block"
            >
              <Button
                variant="white"
                className="border-border-input w-full justify-center border-1"
              >
                {contactCard.cta?.text}
              </Button>
            </Link>
          </div>
        )}
      </Box>
    </Box>
  );
}
