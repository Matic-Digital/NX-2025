// Mark as client component
'use client';

// Next.js imports
// Contentful Live Preview imports
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { useThemeSync } from '@/hooks/useThemeSync';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Logo } from '@/components/global/Logo';
import { Box, Container } from '@/components/global/matic-ds';

import { Social } from '@/components/Social/Social';

import type { Footer as FooterType } from '@/components/Footer/FooterSchema';

/**
 * Footer component
 * Responsive footer with multiple columns of links and company information
 * Features:
 * - Responsive grid layout (2 columns on mobile, 4 on desktop)
 * - Company branding and description
 * - Organized menu sections from Contentful
 * - Social media links
 * - Copyright notice and legal links
 */
export function Footer(props: FooterType) {
  // Detailed menu logging
  if (props.menusCollection?.items) {
    props.menusCollection.items.forEach((_menu, _index) => {
      // Menu processing logic removed
    });
  }
  // Use our custom hook to ensure theme changes are properly applied
  useThemeSync();

  // Use Contentful Live Updates to get real-time updates
  const footer = useContentfulLiveUpdates(props);

  // Use Contentful Inspector Mode for field tagging
  const inspectorProps = useContentfulInspectorMode();

  // If no footer data is provided, render a minimal footer
  if (!footer) {
    return (
      <footer className="bg-background mt-24 border-t border-gray-200 py-12">
        <Container>
          <p className="text-muted-foreground text-center">Footer data not available</p>
        </Container>
      </footer>
    );
  }

  return (
    <ErrorBoundary>
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
                <Logo logo={footer.logo} />
                {footer.description && (
                  <p
                    className="text-muted-foreground text-body-sm max-w-xs"
                    {...inspectorProps({ entryId: footer.sys.id, fieldId: 'description' })}
                  >
                    {footer.description ?? ''}
                  </p>
                )}
                <Box direction="row" gap={8}>
                  {footer.socialNetworksCollection?.items?.map((social) => (
                    <Social social={social} key={social.sys.id} />
                  ))}
                </Box>
              </Box>

              {/* Menu Navigation */}
              <Box
                direction={{ base: 'col', lg: 'row' }}
                cols={{ base: 1, sm: 2, lg: 4 }}
                gap={{ base: 12, lg: 4 }}
                className="justify-start lg:justify-between"
              >
                {/* Footer sections with links from Menus */}
                {footer.menusCollection?.items && footer.menusCollection.items.length > 0 ? (
                  footer.menusCollection.items.map((menu) => (
                    <Box direction="col" gap={4} key={menu.sys.id}>
                      <h3
                        className="text-body-sm leading-[160%] tracking-wide text-[#A3A3A3] uppercase"
                        {...inspectorProps({ entryId: menu.sys.id, fieldId: 'title' })}
                      >
                        <span>{menu.title}</span>
                      </h3>

                      <nav>
                        <ul
                          className="flex flex-col gap-5"
                          {...inspectorProps({
                            entryId: menu.sys.id,
                            fieldId: 'itemsCollection'
                          })}
                        >
                          {menu.itemsCollection?.items
                            .filter((item): item is NonNullable<typeof item> => item != null)
                            .map((item, index) => {
                              // Handle different menu item types
                              let href = '/';
                              let isExternal = false;
                              let displayText = item.title; // Default to title
                              let fieldId = 'title'; // Default field for inspector

                              if (item.__typename === 'MenuItem') {
                                displayText = item.text || item.title;
                                fieldId = 'text';

                                if (item.externalLink) {
                                  href = item.externalLink;
                                  isExternal = true;
                                } else if (item.internalLink?.slug) {
                                  href = `/${item.internalLink.slug}`;
                                }
                              }

                              return (
                                <li
                                  key={item.sys?.id || `menu-item-${index}`}
                                  {...inspectorProps({ entryId: item.sys?.id, fieldId })}
                                >
                                  <Link
                                    href={href}
                                    className="text-foreground hover:text-text-primary text-body-sm tracking-tight"
                                    {...(isExternal && {
                                      target: '_blank',
                                      rel: 'noopener noreferrer'
                                    })}
                                  >
                                    {displayText}
                                  </Link>
                                </li>
                              );
                            })}
                        </ul>
                      </nav>
                    </Box>
                  ))
                ) : (
                  <Box direction="col" gap={4}>
                    <p className="text-body-sm text-[#A3A3A3]">
                      No menus configured. Please add menus in Contentful.
                    </p>
                  </Box>
                )}
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
                className="text-body-xs text-foreground order-2 text-left lg:order-1"
                {...inspectorProps({ entryId: footer.sys.id, fieldId: 'copyright' })}
              >
                © {footer.copyright}, {new Date().getFullYear()}
              </p>
              <Box direction={{ base: 'col', md: 'row' }} gap={8} className="order-1 lg:order-2">
                {footer.legalPageListsCollection?.items?.[0]?.pagesCollection?.items
                  ?.filter(
                    (legalPage): legalPage is typeof legalPage & { slug: string } =>
                      'slug' in legalPage && typeof legalPage.slug === 'string'
                  )
                  ?.map((legalPage) => (
                    <Link
                      key={legalPage.sys.id}
                      href={`/${legalPage.slug}`}
                      className="text-body-xs w-max border-b-[.5px] text-[#A3A3A3] hover:border-white hover:text-white"
                    >
                      {legalPage.title}
                    </Link>
                  ))}
              </Box>
            </Box>
          </Container>
        </Box>
      </footer>
    </ErrorBoundary>
  );
}
