import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import type { Modal } from '@/components/Modals/Modal';

interface RequestSupportModalProps extends Modal {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestSupportModal({
  isOpen,
  onOpenChange,
  title,
  description
}: RequestSupportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <p>Support form goes here</p>
        {/* <HubspotForm
          portalId="12345678"
          formId="12345678-1234-1234-1234-123456789012"
          onSubmit={() => onOpenChange(false)}
        /> */}
      </DialogContent>
    </Dialog>
  );
}
