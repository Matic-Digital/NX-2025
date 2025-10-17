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
    <Link key={social.sys.id} href={social.link} aria-label={`Visit our ${social.title} page`}>
      <SvgIcon
        src={social.icon.url}
        alt={social.title}
        width={24}
        height={24}
        className="text-foreground hover:text-text-primary transition-colors duration-200"
      />
      <span className="sr-only">{social.title}</span>
    </Link>
  );
}
