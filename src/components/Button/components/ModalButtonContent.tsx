import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { renderIcon } from '@/components/Button/utils/ModalButtonUtils';

import type { Button as ButtonType } from '@/components/Button/ButtonSchema';

interface ModalButtonContentProps {
  cta: ButtonType;
  variant: 'primary' | 'outline' | 'white' | 'outlineWhite';
  className?: string;
  isModalButton: boolean;
  linkProps: {
    href: string;
    target?: '_blank';
    rel?: 'noopener noreferrer';
  };
  onModalClick: () => void;
}

/**
 * Pure presentation component for ModalCtaButton
 * Handles only UI rendering, no business logic
 */
export const ModalButtonContent = ({
  cta,
  variant,
  className,
  isModalButton,
  linkProps,
  onModalClick
}: ModalButtonContentProps) => {
  // Modal button rendering
  if (isModalButton) {
    return (
      <Button
        variant={variant}
        className={className}
        onClick={onModalClick}
      >
        {cta.text}
      </Button>
    );
  }

  // Link button rendering
  return (
    <Link href={linkProps.href} {...(linkProps.target ? { target: linkProps.target, rel: linkProps.rel } : {})}>
      <Button variant={variant} className={className}>
        {cta.text}
        {renderIcon(cta.icon)}
      </Button>
    </Link>
  );
};
