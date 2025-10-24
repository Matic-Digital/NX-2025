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
  const defaultFormId = '1d392e69-b470-4703-afa6-19b01f490b84';
  const hubspotFormId = formId ?? defaultFormId;

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
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
