import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

export interface LogoProps {
  /**
   * Optional Contentful logo data to override the default logo
   */
  logo?: {
    url: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
  } | null;
  /**
   * Optional className for the logo container
   */
  className?: string;
}

export function Logo({ logo, className }: LogoProps) {
  // If Contentful logo is provided, use it
  if (logo?.url) {
    return (
      <Link href="/" className={cn('max-w-[15rem]', className)}>
        <Image
          src={logo.url}
          alt={logo.description ?? logo.title ?? 'Logo'}
          width={logo.width ?? 40}
          height={logo.height ?? 40}
          className="h-10 w-auto rounded-full object-contain"
          priority
        />
      </Link>
    );
  }

  // Fallback to default logo
  return (
    <Link href="/" className={cn('max-w-[15rem]', className)}>
      <Box gap={2} className="items-center">
        <span className="text-gradient-pink text-lg font-extrabold">|||</span>
        <h1 className="text-headline-xs">Matic</h1>
        <Image
          src="/NXP_Logo_Horizontal_White.svg"
          alt="NXP Logo"
          width={120}
          height={40}
          className="h-auto w-auto"
        />
      </Box>
    </Link>
  );
}
