import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import HubspotForm from '@/components/HubspotForm/HubspotForm';
import type { Modal } from '@/components/Modals/Modal';

interface RequestAQuoteModalProps extends Modal {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestAQuoteModal({
  isOpen,
  onOpenChange,
  title,
  description
}: RequestAQuoteModalProps) {
  // HubSpot form ID for the request a quote form
  const formId = '1d392e69-b470-4703-afa6-19b01f490b84';

  const handleFormSubmit = (data: Record<string, unknown>) => {
    console.log('Quote request submitted:', data);
    // You can add additional logic here like tracking, notifications, etc.
    
    // Close the modal after successful submission
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title ?? 'Request a Quote'}</DialogTitle>
          <DialogDescription>
            {description ?? 'Fill out the form below to request a quote for our services.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <HubspotForm
            formId={formId}
            onSubmit={handleFormSubmit}
            className="w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
