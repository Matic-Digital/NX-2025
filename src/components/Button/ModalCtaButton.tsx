import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Modal } from '@/types/contentful/Modal';
import type { Button as ButtonType } from './ButtonSchema';

export type ModalType = 'quote' | 'support';

// Icon mapping for button icons
const iconMap = {
  Email: Mail
} as const;

interface ModalCtaButtonProps {
  cta: ButtonType;
  variant: 'primary' | 'outline' | 'white' | 'outlineWhite';
  modalType?: ModalType;
  onModalOpen: (modal: Modal, modalType: ModalType) => void;
  className?: string;
}

export function ModalCtaButton({
  cta,
  variant,
  modalType = 'quote',
  onModalOpen,
  className
}: ModalCtaButtonProps) {
  console.log('cta', cta);
  // Render icon based on the icon type
  const renderIcon = () => {
    if (!cta.icon) return null;

    const IconComponent = iconMap[cta.icon];
    if (!IconComponent) return null;

    return <IconComponent className="ml-2 h-4 w-4" />;
  };

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
      <Button variant={variant} className={className}>
        {cta.text}
        {renderIcon()}
      </Button>
    </Link>
  );
}
