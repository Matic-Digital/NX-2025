import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { DynamicHubspotForm as HubspotForm } from '@/components/Forms/DynamicContactForm';

import type { Modal } from '@/components/Modals/Modal';

interface RequestSupportModalProps extends Modal {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formId?: string;
}

export function RequestSupportModal({
  isOpen,
  onOpenChange,
  title,
  description,
  formId
}: RequestSupportModalProps) {
  // Use formId from Contentful - no hardcoded fallback
  if (!formId) {
    console.warn('RequestSupportModal: No formId provided from Contentful. Make sure the modal button has a form configured.');
    return null;
  }
  const hubspotFormId = formId;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <HubspotForm
            formId={hubspotFormId}
            onSubmit={() => onOpenChange(false)}
            className="w-full"
            theme="light"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
