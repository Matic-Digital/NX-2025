import Link from 'next/link';

import { SvgIcon } from '@/components/ui/svg-icon';

import type { Social as SocialType } from './SocialSchema';

interface SocialProps {
  social: SocialType;
}

/**
 * Social Component
 *
 * Renders a social media link with an icon.
 */
export function Social({ social }: SocialProps) {
  return (
    <Link
      key={social.sys.id}
      href={social.link}
      aria-label={`Visit our ${social.title} page`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* Fixed container to prevent layout shift */}
      <div
        className="inline-flex items-center justify-center text-foreground hover:text-text-primary transition-colors duration-200"
        style={{ width: '24px', height: '24px' }}
      >
        <SvgIcon
          src={social.icon?.url || ''}
          alt={social.title}
          width={24}
          height={24}
          className="w-full h-full"
        />
      </div>
      <span className="sr-only">{social.title}</span>
    </Link>
  );
}
