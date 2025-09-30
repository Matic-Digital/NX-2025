/**
 * Header Component
 *
 * This component renders a responsive navigation header based on content from Contentful.
 * It displays a logo and navigation links, with support for nested dropdown menus for
 * PageList content types. The component is integrated with Contentful's Live Preview
 * functionality for real-time content updates in the preview environment.
 *
 * Features:
 * - Responsive design with different layouts for desktop and mobile
 * - Support for nested navigation with dropdowns for PageList items
 * - Active link highlighting based on current route
 * - Contentful Live Preview integration for real-time updates
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

import { ChevronDown, Menu, Search } from 'lucide-react';

import { MegaMenuProvider, useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Button } from '@/components/ui/button';
// Collapsible components for mobile mega menus
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// Sheet components for mobile menu from shadcn
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Logo } from '@/components/global/Logo';
import { Box, Container } from '@/components/global/matic-ds';

import { HeaderSkeleton } from '@/components/Header/HeaderSkeleton';
import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';
import { Menu as MenuComponent } from '@/components/Menu/Menu';
import { getMenuById } from '@/components/Menu/MenuApi';

import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Menu as MenuType } from '@/components/Menu/MenuSchema';
import type { Page } from '@/components/Page/PageSchema';

// No need for an empty interface, just use the HeaderType directly
type HeaderProps = HeaderType;

/**
 * Header component that displays a navigation bar with logo and links
 * Supports Contentful Live Preview for real-time updates
 * Features:
 * - Desktop: Full navigation menu with dropdowns for page lists
 * - Mobile: Hamburger menu with slide-out sheet
 * - Sticky positioning with blur effect
 * - Consistent branding across breakpoints
 */
function HeaderContent(props: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuType | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [overflowMenu, setOverflowMenu] = useState<MenuType | null>(null);
  const [overflowMenuLoading, setOverflowMenuLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loadedMegaMenus, setLoadedMegaMenus] = useState<Record<string, MenuType>>({});
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const overflowButtonRef = useRef<HTMLButtonElement>(null);
  const overflowMenuRef = useRef<HTMLDivElement>(null);
  const { isHeaderBlurVisible, setOverflowMenuOpen, isOverflowMenuOpen } = useMegaMenuContext();

  // Important: We'll use CSS-only dark mode with the 'dark:' variant
  // This prevents hydration mismatches by ensuring server and client render the same HTML

  // Use Contentful Live Preview to get real-time updates
  const header = useContentfulLiveUpdates(props);
  // Add inspector mode for Contentful editing
  const inspectorProps = useContentfulInspectorMode({ entryId: header?.sys?.id });

  // Debug: Log header data
  useEffect(() => {
    console.log('Header data:', header);
    console.log('Header menu:', header?.menu);
    console.log('Header overflow:', header?.overflow);
  }, [header]);

  // Load menu if header has menu reference
  useEffect(() => {
    if (header?.menu?.sys?.id && !menu) {
      console.log('Loading menu with ID:', header.menu.sys.id);
      setMenuLoading(true);
      getMenuById(header.menu.sys.id)
        .then((loadedMenu) => {
          console.log('Menu loaded:', loadedMenu);
          if (loadedMenu) {
            setMenu(loadedMenu);
          }
        })
        .catch((error: unknown) => {
          console.error('Failed to load menu:', error);
        })
        .finally(() => {
          setMenuLoading(false);
        });
    }
  }, [header?.menu?.sys?.id, menu]);

  // Load overflow menu if header has overflow reference
  useEffect(() => {
    if (header?.overflow?.sys?.id && !overflowMenu && !overflowMenuLoading) {
      console.log('Loading overflow menu with ID:', header.overflow.sys.id);
      console.log('Overflow typename:', header.overflow.__typename);
      setOverflowMenuLoading(true);

      // Since overflow links to MegaMenu, not Menu, we need to use MegaMenu API
      if (header.overflow.__typename === 'MegaMenu') {
        import('../MegaMenu/MegaMenuApi')
          .then(({ getMegaMenuById }) => {
            return getMegaMenuById(header.overflow!.sys.id);
          })
          .then((loadedMegaMenu) => {
            console.log('Overflow MegaMenu loaded:', loadedMegaMenu);
            // Convert MegaMenu to Menu format for compatibility
            if (loadedMegaMenu?.itemsCollection) {
              const menuFormat = {
                sys: loadedMegaMenu.sys,
                __typename: 'Menu' as const,
                title: loadedMegaMenu.title,
                itemsCollection: {
                  items: loadedMegaMenu.itemsCollection.items.map((item) => ({
                    ...item,
                    __typename: 'MenuItem' as const
                  }))
                }
              };
              setOverflowMenu(menuFormat);
            }
          })
          .catch((error: unknown) => {
            console.error('Failed to load overflow MegaMenu:', error);
          })
          .finally(() => setOverflowMenuLoading(false));
      } else {
        // Fallback to Menu API
        getMenuById(header.overflow.sys.id)
          .then((loadedMenu) => {
            console.log('Overflow menu loaded:', loadedMenu);
            if (loadedMenu) {
              setOverflowMenu(loadedMenu);
            }
          })
          .catch((error: unknown) => {
            console.error('Failed to load overflow menu:', error);
          })
          .finally(() => setOverflowMenuLoading(false));
      }
    }
  }, [header?.overflow?.sys?.id, header?.overflow, overflowMenu, overflowMenuLoading]);

  // Handle scroll events to add frosted glass effect to header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Clean up event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicks outside overflow menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOverflowMenuOpen &&
        overflowMenuRef.current &&
        overflowButtonRef.current &&
        !overflowMenuRef.current.contains(event.target as Node) &&
        !overflowButtonRef.current.contains(event.target as Node)
      ) {
        setOverflowMenuOpen(false);
      }
    };

    if (isOverflowMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOverflowMenuOpen, setOverflowMenuOpen]);

  // Handle escape key to close overflow menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOverflowMenuOpen) {
        setOverflowMenuOpen(false);
      }
    };

    if (isOverflowMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOverflowMenuOpen, setOverflowMenuOpen]);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSheetOpen) {
        // md breakpoint is 768px
        setIsSheetOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isSheetOpen]);

  // Function to check if a link is active
  const _isActivePage = (page: Page) => pathname === `/${page.slug}`;

  const _isActiveHref = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (menuLoading || overflowMenuLoading) {
    return <HeaderSkeleton />;
  }

  if (!header) {
    return (
      <header className="bg-background/95 px-6 py-4">
        <Container>
          <Box direction="row" className="items-center justify-between">
            <p>No header found</p>
          </Box>
        </Container>
      </header>
    );
  }

  return (
    <Container
      className={`sticky top-0 z-[100] pt-0 transition-all duration-300 max-md:z-[40] md:pt-6`}
    >
      <header
        className={`relative z-[100] px-6 transition-all duration-300 max-md:z-[40] max-md:py-1.5 lg:w-full ${
          isScrolled && isHeaderBlurVisible ? 'bg-black/[0.72] backdrop-blur-[30px]' : ''
        }`}
        {...inspectorProps({ fieldId: 'name' })}
      >
        <Box className="items-center justify-between">
          {/* Logo Section */}
          <Logo logo={header.logo} className="flex items-center gap-2 py-4" />

          {/* Desktop Navigation */}
          <div className="hidden items-center md:flex" data-testid="desktop-nav">
            <div
              className={`rounded-xxs mr-4 transition-all duration-300 ${
                isHeaderBlurVisible && !isScrolled ? 'bg-black/[0.72] backdrop-blur-[30px]' : ''
              }`}
            >
              {menuLoading ? (
                <div className="px-4 py-2 text-white">Loading menu...</div>
              ) : menu ? (
                <MenuComponent menu={menu} />
              ) : (
                <div className="px-4 py-2 text-white">
                  No menu available (Header menu ID: {header?.menu?.sys?.id ?? 'none'})
                </div>
              )}
            </div>

            <Search className="text-white" />

            {/* Desktop Overflow Menu (Hamburger) */}
            {header?.overflow && (
              <div className="relative">
                <Button
                  ref={overflowButtonRef}
                  variant="ghost"
                  className="rounded-xxs ml-4 flex items-center justify-center p-2 text-white"
                  aria-label="Open overflow menu"
                  aria-expanded={isOverflowMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setOverflowMenuOpen(!isOverflowMenuOpen)}
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Open overflow menu</span>
                </Button>

                {/* Portal-based dropdown menu */}
                {isOverflowMenuOpen &&
                  typeof window !== 'undefined' && document.body &&
                  createPortal(
                    <div
                      ref={overflowMenuRef}
                      className="fixed top-0 left-0 z-[99] h-auto min-h-fit w-screen bg-black/[0.72] pt-24 shadow-[0_4px_20px_0_rgba(0,0,0,0.16)] backdrop-blur-[30px]"
                      onClick={() => setOverflowMenuOpen(false)}
                    >
                      <div className="px-6 py-8">
                        <Container>
                          <nav onClick={(e) => e.stopPropagation()}>
                            {overflowMenuLoading ? (
                              <div className="text-white">Loading overflow menu...</div>
                            ) : overflowMenu ? (
                              <MenuComponent menu={overflowMenu} variant="overflow" />
                            ) : (
                              <div className="text-white">No overflow menu available</div>
                            )}
                          </nav>
                        </Container>
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <Box direction="row" gap={2} className="items-center md:hidden" data-testid="mobile-nav">
            <Button
              variant="ghost"
              className={`rounded-xxs ml-2 flex size-10 items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl`}
              aria-label="Open search"
            >
              <Search className="size-5" />
              <span className="sr-only">Open search</span>
            </Button>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className={`rounded-xxs ml-2 flex items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl`}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="text-left text-lg font-semibold">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Main navigation menu</SheetDescription>
                </SheetHeader>
                <nav className="mt-6 space-y-6">
                  {/* Main Menu Items */}
                  {menuLoading ? (
                    <div className="text-foreground">Loading menu...</div>
                  ) : menu ? (
                    <div>
                      <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
                        Navigation
                      </h3>
                      <div className="space-y-2">
                        {menu.itemsCollection?.items?.map((item) => {
                          if (item.__typename === 'MenuItem') {
                            const linkUrl = item.internalLink?.slug
                              ? `/${item.internalLink.slug}`
                              : (item.externalLink ?? '#');
                            const linkTarget = item.externalLink ? '_blank' : '_self';
                            const linkRel = item.externalLink ? 'noopener noreferrer' : undefined;

                            return (
                              <a
                                key={item.sys.id}
                                href={linkUrl}
                                target={linkTarget}
                                rel={linkRel}
                                className="text-foreground hover:bg-accent block rounded-md px-3 py-2 text-sm transition-colors"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                {item.text}
                              </a>
                            );
                          } else if (item.__typename === 'MegaMenu') {
                            const megaMenuData = loadedMegaMenus[item.sys.id];
                            const isOpen = openCollapsible === `main-${item.sys.id}`;

                            return (
                              <Collapsible
                                key={item.sys.id}
                                open={isOpen}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setOpenCollapsible(`main-${item.sys.id}`);
                                    if (!megaMenuData) {
                                      getMegaMenuById(item.sys.id)
                                        .then((loadedMenu) => {
                                          if (loadedMenu?.itemsCollection) {
                                            const itemsCollection = loadedMenu.itemsCollection;
                                            setLoadedMegaMenus((prev) => ({
                                              ...prev,
                                              [item.sys.id]: {
                                                ...loadedMenu,
                                                itemsCollection: {
                                                  items: itemsCollection.items.map((menuItem) => ({
                                                    ...menuItem,
                                                    __typename: 'MenuItem' as const
                                                  }))
                                                }
                                              }
                                            }));
                                          }
                                        })
                                        .catch((error: unknown) => {
                                          console.error('Failed to load mega menu:', error);
                                        });
                                    }
                                  } else {
                                    setOpenCollapsible(null);
                                  }
                                }}
                              >
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-foreground hover:bg-accent w-full justify-between rounded-md px-3 py-2 text-sm transition-colors"
                                  >
                                    {item.title}
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 pl-4">
                                  {megaMenuData?.itemsCollection?.items?.map((subItem) => {
                                    if (subItem.__typename === 'MenuItem') {
                                      const subLinkUrl = subItem.internalLink?.slug
                                        ? `/${subItem.internalLink.slug}`
                                        : (subItem.externalLink ?? '#');
                                      const subLinkTarget = subItem.externalLink
                                        ? '_blank'
                                        : '_self';
                                      const subLinkRel = subItem.externalLink
                                        ? 'noopener noreferrer'
                                        : undefined;

                                      return (
                                        <a
                                          key={subItem.sys.id}
                                          href={subLinkUrl}
                                          target={subLinkTarget}
                                          rel={subLinkRel}
                                          className="text-muted-foreground hover:bg-accent block rounded-md px-3 py-2 text-sm transition-colors"
                                          onClick={() => setIsSheetOpen(false)}
                                        >
                                          {subItem.text}
                                        </a>
                                      );
                                    }
                                    return null;
                                  }) ?? (
                                    <div className="text-muted-foreground px-3 py-2 text-sm">
                                      {megaMenuData ? 'No items available' : 'Loading...'}
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-foreground">No menu available</div>
                  )}

                  {/* Overflow Menu Items */}
                  {overflowMenuLoading ? (
                    <div className="text-foreground">Loading overflow menu...</div>
                  ) : overflowMenu ? (
                    <div>
                      <h3 className="text-muted-foreground mb-3 text-sm font-semibold">More</h3>
                      <div className="space-y-2">
                        {overflowMenu.itemsCollection?.items?.map((item) => {
                          if (item.__typename === 'MenuItem') {
                            const linkUrl = item.internalLink?.slug
                              ? `/${item.internalLink.slug}`
                              : (item.externalLink ?? '#');
                            const linkTarget = item.externalLink ? '_blank' : '_self';
                            const linkRel = item.externalLink ? 'noopener noreferrer' : undefined;

                            return (
                              <a
                                key={item.sys.id}
                                href={linkUrl}
                                target={linkTarget}
                                rel={linkRel}
                                className="text-foreground hover:bg-accent block rounded-md px-3 py-2 text-sm transition-colors"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                {item.text}
                              </a>
                            );
                          } else if (item.__typename === 'MegaMenu') {
                            const megaMenuData = loadedMegaMenus[item.sys.id];
                            const isOpen = openCollapsible === `overflow-${item.sys.id}`;

                            return (
                              <Collapsible
                                key={item.sys.id}
                                open={isOpen}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setOpenCollapsible(`overflow-${item.sys.id}`);
                                    if (!megaMenuData) {
                                      getMegaMenuById(item.sys.id)
                                        .then((loadedMenu) => {
                                          if (loadedMenu?.itemsCollection) {
                                            const itemsCollection = loadedMenu.itemsCollection;
                                            setLoadedMegaMenus((prev) => ({
                                              ...prev,
                                              [item.sys.id]: {
                                                ...loadedMenu,
                                                itemsCollection: {
                                                  items: itemsCollection.items.map((menuItem) => ({
                                                    ...menuItem,
                                                    __typename: 'MenuItem' as const
                                                  }))
                                                }
                                              }
                                            }));
                                          }
                                        })
                                        .catch((error: unknown) => {
                                          console.error(
                                            'Failed to load overflow mega menu:',
                                            error
                                          );
                                        });
                                    }
                                  } else {
                                    setOpenCollapsible(null);
                                  }
                                }}
                              >
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-foreground hover:bg-accent w-full justify-between rounded-md px-3 py-2 text-sm transition-colors"
                                  >
                                    {item.title}
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 pl-4">
                                  {megaMenuData?.itemsCollection?.items?.map((subItem) => {
                                    if (subItem.__typename === 'MenuItem') {
                                      const subLinkUrl = subItem.internalLink?.slug
                                        ? `/${subItem.internalLink.slug}`
                                        : (subItem.externalLink ?? '#');
                                      const subLinkTarget = subItem.externalLink
                                        ? '_blank'
                                        : '_self';
                                      const subLinkRel = subItem.externalLink
                                        ? 'noopener noreferrer'
                                        : undefined;

                                      return (
                                        <a
                                          key={subItem.sys.id}
                                          href={subLinkUrl}
                                          target={subLinkTarget}
                                          rel={subLinkRel}
                                          className="text-muted-foreground hover:bg-accent block rounded-md px-3 py-2 text-sm transition-colors"
                                          onClick={() => setIsSheetOpen(false)}
                                        >
                                          {subItem.text}
                                        </a>
                                      );
                                    }
                                    return null;
                                  }) ?? (
                                    <div className="text-muted-foreground px-3 py-2 text-sm">
                                      {megaMenuData ? 'No items available' : 'Loading...'}
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ) : null}
                </nav>
              </SheetContent>
            </Sheet>
          </Box>
        </Box>
      </header>
    </Container>
  );
}

export function Header(props: HeaderProps) {
  return (
    <ErrorBoundary>
      <MegaMenuProvider>
        <HeaderContent {...props} />
      </MegaMenuProvider>
    </ErrorBoundary>
  );
}
