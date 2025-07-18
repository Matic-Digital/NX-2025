'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

interface PageLinkResolverProps {
  slug: string | undefined;
  name: string | undefined;
  className?: string;
  _isActive?: boolean;
  isNavigationLink?: boolean;
}

export function PageLinkResolver({
  slug,
  name,
  className,
  // Prefix with underscore to indicate it's not used
  _isActive = false,
  isNavigationLink = false
}: PageLinkResolverProps) {
  const pathname = usePathname();

  // Safely handle slug - explicitly check for undefined or empty string
  // Empty string for homepage, otherwise use the slug value
  const resolvedUrl = !slug ? '/' : `/${slug}`;

  // Determine if this link is active based on the current pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  // Account for homepage and other cases
  const isLinkActive = slug ? lastSegment === slug || pathname === `/${slug}` : pathname === '/';

  if (isNavigationLink) {
    return (
      <Link href={resolvedUrl} legacyBehavior passHref>
        <NavigationMenuLink
          className={navigationMenuTriggerStyle()}
          {...(isLinkActive && { 'data-active': true })}
        >
          {name}
        </NavigationMenuLink>
      </Link>
    );
  }

  // For mobile links, add active class if the link is active
  const mobileClassName = className
    ? `${className} ${isLinkActive ? 'text-foreground' : 'text-foreground/60'}`
    : '';

  return (
    <Link href={resolvedUrl} className={mobileClassName}>
      {name}
    </Link>
  );
}
