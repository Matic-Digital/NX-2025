import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { DynamicHubspotForm as HubspotForm } from '@/components/Forms/DynamicContactForm';

interface RequestAQuoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formId?: string; // Direct HubSpot form ID (e.g., "1d392e69-b470-4703-afa6-19b01f490b84")
  title?: string;
  description?: string;
}

export function RequestAQuoteModal({
  isOpen,
  onOpenChange,
  formId,
  title,
  description
}: RequestAQuoteModalProps) {
  // Use formId from Contentful - no hardcoded fallback
  if (!formId) {
    console.warn('RequestAQuoteModal: No formId provided from Contentful. Make sure the modal button has a form configured.');
    return null;
  }
  const hubspotFormId = formId;

  const handleFormSubmit = (_data: Record<string, unknown>) => {
    // You can add additional logic here like tracking, notifications, etc.

    // Close the modal after successful submission
    onOpenChange(false);
  };

  // Get modal content with fallbacks
  const modalTitle = title ?? 'Request a Quote';
  const modalDescription =
    description ?? 'Fill out the form below to request a quote for our services.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <HubspotForm 
            formId={hubspotFormId} 
            onSubmit={handleFormSubmit} 
            className="w-full" 
            theme="light"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
