'use client';

import { useEffect, useState } from 'react';
import { ContactCard } from './ContactCard';
import { getContactCardById } from '../../lib/contentful-api/contact-card';
import type { ContactCard as ContactCardType } from '../../types/contentful/ContactCard';

interface LazyContactCardProps {
  contactCardId: string;
  className?: string;
}

export function LazyContactCard({ contactCardId }: LazyContactCardProps) {
  const [contactCard, setContactCard] = useState<ContactCardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContactCard() {
      try {
        setLoading(true);
        const data = await getContactCardById(contactCardId);
        setContactCard(data);
      } catch (err) {
        console.error('Failed to fetch contact card:', err);
        setError('Failed to load contact card');
      } finally {
        setLoading(false);
      }
    }

    void fetchContactCard();
  }, [contactCardId]);

  if (loading) {
    return (
      <div className="bg-background border-border flex h-full flex-col rounded-lg border p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading contact card...</div>
        </div>
      </div>
    );
  }

  if (error || !contactCard) {
    return (
      <div className="bg-background border-border flex h-full flex-col rounded-lg border p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500">{error ?? 'Contact card not found'}</div>
        </div>
      </div>
    );
  }

  return <ContactCard key={`lazy-loaded-${contactCardId}`} {...contactCard} />;
}
