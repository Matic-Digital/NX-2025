import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Button as ButtonType } from '@/types/contentful/Button';
import type { Modal } from '@/types/contentful/Modal';

export type ModalType = 'quote' | 'support';

interface ModalCtaButtonProps {
  cta: ButtonType;
  variant: 'primary' | 'outline' | 'white';
  modalType?: ModalType;
  onModalOpen: (modal: Modal, modalType: ModalType) => void;
  className?: string;
}

export function ModalCtaButton({ cta, variant, modalType = 'quote', onModalOpen, className }: ModalCtaButtonProps) {
  if (cta.modal) {
    return (
      <Button
        variant={variant}
        className={className}
        onClick={() => {
          if (cta.modal) {
            onModalOpen(cta.modal, modalType);
          }
        }}
      >
        {cta.text}
      </Button>
    );
  }

  return (
    <Link
      href={cta.internalLink?.slug ?? cta.externalLink ?? '#'}
      {...(cta.externalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <Button variant={variant} className={className}>{cta.text}</Button>
    </Link>
  );
}
