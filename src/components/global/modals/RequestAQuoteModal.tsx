import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import type { Modal } from '@/types/contentful/Modal';

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
  console.log('isOpen', isOpen);
  console.log('onOpenChange', onOpenChange);
  console.log('title', title);
  console.log('description', description);
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <p>Hubspot form goes here</p>
        {/* <HubspotForm
          portalId="12345678"
          formId="12345678-1234-1234-1234-123456789012"
          onSubmit={() => onOpenChange(false)}
        /> */} 
      </DialogContent>
    </Dialog>
  );
}
