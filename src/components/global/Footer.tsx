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
import { SvgIcon } from '@/components/ui/svg-icon';
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
  console.log('footerData', footerData);
  // Use our custom hook to ensure theme changes are properly applied
  useThemeSync();

  // Use Contentful Live Updates to get real-time updates
  const liveFooterData = useContentfulLiveUpdates<FooterType>(footerData ?? ({} as FooterType));

  // Use Contentful Inspector Mode for field tagging
  const inspectorProps = useContentfulInspectorMode();

  // If no footer data is provided, render a minimal footer
  if (!footerData) {
    return (
      <footer className="bg-background mt-24 border-t border-gray-200 py-12">
        <Container>
          <p className="text-muted-foreground text-center">Footer data not available</p>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="dark bg-background py-24">
      <Box direction="col" gap={6} className="xl:px-41">
        <Container>
          {/* Main footer content grid */}
          <Box
            direction={{ base: 'col', lg: 'row' }}
            cols={{ base: 1, lg: 2 }}
            gap={{ base: 12, lg: 0 }}
          >
            {/* Company information */}
            <Box direction="col" gap={8}>
              {liveFooterData.logo ? (
                <Link href="/">
                  <Box direction="row" gap={4} className="items-center">
                    <Image
                      src={liveFooterData.logo.url}
                      alt={liveFooterData.logo.title ?? 'Logo'}
                      width={liveFooterData.logo.width ?? 150}
                      height={liveFooterData.logo.height ?? 50}
                      className="h-8 w-auto rounded-full border-none"
                    />
                    <h4 className="text-foreground text-headline-sm">NextPower</h4>
                  </Box>
                </Link>
              ) : (
                <Logo />
              )}
              {liveFooterData.description && (
                <p
                  className="text-muted-foreground text-body-sm max-w-xs"
                  {...inspectorProps({ entryId: liveFooterData.sys.id, fieldId: 'description' })}
                >
                  {liveFooterData.description ?? ''}
                </p>
              )}
              <Box direction="row" gap={8}>
                {liveFooterData.socialNetworksCollection?.items?.map((social) => (
                  <Link key={social.sys.id} href={social.link}>
                    <SvgIcon
                      src={social.icon.url}
                      alt={social.title}
                      width={24}
                      height={24}
                      className="text-foreground hover:text-text-primary transition-colors duration-200"
                    />
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Page Navigation Menu */}
            <Box
              direction={{ base: 'col', lg: 'row' }}
              cols={{ base: 1, sm: 2, lg: 4 }}
              gap={{ base: 12, lg: 0 }}
              className="justify-start lg:justify-between"
              {...inspectorProps({
                entryId: liveFooterData.sys.id,
                fieldId: 'pageListsCollection'
              })}
            >
              {/* Footer sections with links from Contentful */}
              {liveFooterData.pageListsCollection?.items.map((pageList) => (
                <Box direction="col" gap={4} key={pageList.sys.id}>
                  <h3
                    className="text-body-sm text-text-input leading-[160%] tracking-wide uppercase"
                    {...inspectorProps({ entryId: pageList.sys.id, fieldId: 'title' })}
                  >
                    {pageList.header && pageList.footer ? (
                      <Link href={`/${pageList.slug}`} className="hover:text-text-primary">
                        {pageList.title}
                      </Link>
                    ) : (
                      <span>{pageList.title}</span>
                    )}
                  </h3>

                  <nav>
                    <ul
                      className="flex flex-col gap-5"
                      {...inspectorProps({ entryId: pageList.sys.id, fieldId: 'pagesCollection' })}
                    >
                      {pageList.pagesCollection?.items
                        .filter((page) => page != null)
                        .map((page, index) => (
                          <li
                            key={page.sys?.id || `page-${index}`}
                            {...inspectorProps({ entryId: page.sys?.id, fieldId: 'title' })}
                          >
                            <Link
                              href={'link' in page ? page.link : `/${page.slug}`}
                              className="text-foreground hover:text-text-primary text-body-sm tracking-tight"
                              {...('link' in page && {
                                target: '_blank',
                                rel: 'noopener noreferrer'
                              })}
                            >
                              {page.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </nav>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>

        <Container className="py-6">
          <hr className="border-input-hover-border/10 border-t" />
        </Container>

        {/* Copyright section */}
        <Container>
          <Box
            direction={{ base: 'col', lg: 'row' }}
            gap={{ base: 12, lg: 2 }}
            className="items-start justify-between lg:items-center"
          >
            <p
              className="text-body-xs text-text-on-invert order-2 text-left lg:order-1"
              {...inspectorProps({ entryId: liveFooterData.sys.id, fieldId: 'copyright' })}
            >
              © {liveFooterData.copyright}, {new Date().getFullYear()}
            </p>
            <Box direction={{ base: 'col', md: 'row' }} gap={8} className="order-1 lg:order-2">
              {liveFooterData.legalPageListsCollection?.items?.[0]?.pagesCollection?.items
                ?.filter((legalPage) => 'slug' in legalPage)
                ?.map((legalPage) => (
                  <Link
                    key={legalPage.sys.id}
                    href={`/${legalPage.slug}`}
                    className="text-text-input text-body-xs w-max border-b-[.5px] hover:border-white hover:text-white"
                  >
                    {legalPage.title}
                  </Link>
                ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </footer>
  );
}
