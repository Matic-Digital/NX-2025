import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { DynamicHubspotForm as _HubspotForm } from '@/components/Forms/DynamicContactForm';

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
  formId: _formId
}: RequestSupportModalProps) {
  // Use formId from Contentful - no hardcoded fallback

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mt-6 lg:mt-12">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex-1 min-h-0">
          <iframe 
            src="https://nextracker--cpqqa.sandbox.my.salesforce-sites.com/CreateCaseAttachments" 
            title="Support Case Creation Form"
            width="100%" 
            height="800px"
            style={{ border: 'none' }}
            sandbox="allow-forms allow-scripts allow-same-origin"
            loading="lazy"
          >
            <p>Your browser does not support iframes. Please visit the form directly at: 
              <a href="https://nextracker--cpqqa.sandbox.my.salesforce-sites.com/CreateCaseAttachments" target="_blank" rel="noopener noreferrer">
                Support Form
              </a>
            </p>
          </iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
