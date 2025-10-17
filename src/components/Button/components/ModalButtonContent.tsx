import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { renderIcon } from '@/components/Button/utils/ModalButtonUtils';

import type { Button as ButtonType } from '@/components/Button/ButtonSchema';

interface ModalButtonContentProps {
  cta: ButtonType;
  variant: 'primary' | 'secondary' | 'outline' | 'white' | 'outlineWhite';
  className?: string;
  isModalButton: boolean;
  linkProps: {
    href: string;
    target?: '_blank';
    rel?: 'noopener noreferrer';
  };
  onModalClick: () => void;
  inspectorProps: (options: { fieldId: string }) => Record<string, unknown> | null;
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
  onModalClick,
  inspectorProps
}: ModalButtonContentProps) => {
  // Modal button rendering
  if (isModalButton) {
    return (
      <Button
        variant={variant}
        className={className}
        onClick={onModalClick}
        {...inspectorProps({ fieldId: 'text' })}
      >
        {cta.text}
      </Button>
    );
  }

  // Link button rendering
  return (
    <Link
      href={linkProps.href}
      {...(linkProps.target ? { target: linkProps.target, rel: linkProps.rel } : {})}
    >
      <Button variant={variant} className={className} {...inspectorProps({ fieldId: 'text' })}>
        {cta.text}
        {renderIcon(cta.icon)}
      </Button>
    </Link>
  );
};
