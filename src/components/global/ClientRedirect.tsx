'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientRedirectProps {
  href: string;
}

/**
 * Client-side redirect component
 *
 * This component performs a client-side redirect using the Next.js router.
 * It's useful for handling redirects in response to client-side navigation
 * where server-side redirects might cause issues.
 */
export function ClientRedirect({ href }: ClientRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-headline-xs mb-2 font-semibold">Redirecting...</h2>
        <p className="text-muted-foreground">
          If you are not redirected automatically, please{' '}
          <a href={href} className="text-blue-600 hover:underline">
            click here
          </a>
        </p>
      </div>
    </div>
  );
}
