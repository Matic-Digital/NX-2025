import Link from 'next/link';

import { Box } from '@/components/global/matic-ds';

export function Logo() {
  return (
    <Link href="/" className="mr-6">
      <Box gap={2} className="items-center">
        <span className="text-gradient-pink text-lg font-extrabold">|||</span>
        <h1 className="text-headline-xs">Matic</h1>
      </Box>
    </Link>
  );
}
