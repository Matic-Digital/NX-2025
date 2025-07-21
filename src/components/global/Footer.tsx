// Mark as client component
'use client';

// Next.js imports
import Link from 'next/link';
import Image from 'next/image';

// Contentful Live Preview imports
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';

import { Box, Container } from '@/components/global/matic-ds';
import { useThemeSync } from '@/hooks/useThemeSync';
import { Logo } from '@/components/global/Logo';
import type { Footer as FooterType } from '@/types/contentful/Footer';

/**
 * Footer component
 * Responsive footer with multiple columns of links and company information
 * Features:
 * - Responsive grid layout (2 columns on mobile, 4 on desktop)
 * - Company branding and description
 * - Organized link sections from Contentful
 * - Copyright notice
 */
export function Footer({ footerData }: { footerData: FooterType | null }) {
  // Use our custom hook to ensure theme changes are properly applied
  useThemeSync();

  // Use Contentful Live Updates to get real-time updates
  const liveFooterData = useContentfulLiveUpdates<FooterType>(footerData ?? ({} as FooterType));

  // Use Contentful Inspector Mode for field tagging
  const inspectorProps = useContentfulInspectorMode();

  // If no footer data is provided, render a minimal footer
  if (!footerData) {
    return (
      <footer className="bg-background mt-24 border-t border-gray-200 py-12 dark:border-gray-800">
        <Container width="full">
          <p className="text-muted-foreground text-center">Footer data not available</p>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="bg-background mt-24 border-t border-gray-200 py-12 dark:border-gray-800">
      <Container width="full">
        {/* Main footer content grid */}
        <Box cols={{ sm: 2 }} gap={12}>
          {/* Company information */}
          <div>
            {liveFooterData.logo ? (
              <div
                className="mb-4"
                {...inspectorProps({ entryId: liveFooterData.sys.id, fieldId: 'logo' })}
              >
                <Image
                  src={liveFooterData.logo.url}
                  alt={liveFooterData.logo.title ?? liveFooterData.name ?? 'Logo'}
                  width={liveFooterData.logo.width ?? 150}
                  height={liveFooterData.logo.height ?? 50}
                  className="h-8 rounded-none border-none"
                />
              </div>
            ) : (
              <Logo />
            )}
            <p
              className="text-muted-foreground max-w-xs text-sm"
              {...inspectorProps({ entryId: liveFooterData.sys.id, fieldId: 'description' })}
            >
              {liveFooterData.description ??
                'Modern blog platform built with Next.js, Contentful and Mux'}
            </p>
          </div>

          <Box
            gap={12}
            className="justify-start lg:justify-between"
            {...inspectorProps({ entryId: liveFooterData.sys.id, fieldId: 'pageListsCollection' })}
          >
            {/* Footer sections with links from Contentful */}
            {liveFooterData.pageListsCollection?.items.map((pageList) => (
              <div key={pageList.sys.id}>
                <h3
                  className="text-sm font-medium"
                  {...inspectorProps({ entryId: pageList.sys.id, fieldId: 'name' })}
                >
                  <Link href={`/${pageList.slug}`} className="hover:text-primary">
                    {pageList.name}
                  </Link>
                </h3>
                <nav>
                  <ul
                    className="mt-4 ml-1 space-y-2"
                    {...inspectorProps({ entryId: pageList.sys.id, fieldId: 'pagesCollection' })}
                  >
                    {pageList.pagesCollection?.items.map((page) => (
                      <li
                        key={page.sys.id}
                        {...inspectorProps({ entryId: page.sys.id, fieldId: 'name' })}
                      >
                        <Link
                          href={`/${page.slug}`}
                          className="text-muted-foreground hover:text-primary text-sm"
                        >
                          {page.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </Box>
        </Box>
      </Container>
      {/* Copyright section */}
      <div className="mt-8 border-t pt-8">
        <Container width="full">
          <p
            className="text-muted-foreground text-right text-sm"
            {...inspectorProps({ entryId: liveFooterData.sys.id, fieldId: 'copyright' })}
          >
            © {new Date().getFullYear()} {liveFooterData.copyright ?? 'Matic'}. All rights
            reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
