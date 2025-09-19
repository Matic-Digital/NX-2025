import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import type { Modal } from '@/components/Modals/Modal';
import { HubspotForm } from '@/components/HubspotForm/HubspotForm';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <HubspotForm 
          hubspotForm={{
            sys: { id: 'quote-form' },
            formLink: 'https://share.hsforms.com/242546672/bc714460-764a-41ca-9cc3-1875f88cb365',
            __typename: 'HubspotForm'
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
