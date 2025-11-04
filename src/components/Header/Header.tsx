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

import { useEffect, useRef, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

import { staticRoutingService } from '@/lib/static-routing';

import { ChevronDown, Menu, Search, X } from 'lucide-react';

import { useIsDesktop, useIsTablet } from '@/hooks/useBreakpoint';

import { MegaMenuProvider, useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Button } from '@/components/ui/button';
// Collapsible components for mobile mega menus
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// Sheet components for mobile menu from shadcn
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Logo } from '@/components/global/Logo';
import { Box, Container } from '@/components/global/matic-ds';

import { LocaleDropdown } from '@/components/LocaleDropdown/LocaleDropdown';
import { Menu as MenuComponent } from '@/components/Menu/Menu';

import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Menu as MenuType } from '@/components/Menu/MenuSchema';
import type { Page } from '@/components/Page/PageSchema';
import type { LocaleOption } from '@/lib/server-locales';
import type { MenuItem } from '@/components/MenuItem/MenuItemSchema';

// Interface for locale API response
interface LocaleApiResponse {
  locales: LocaleOption[];
}

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
  const [overflowMenuTags, setOverflowMenuTags] = useState<
    Array<{ id: string; name: string }> | undefined
  >(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [loadedMegaMenus, setLoadedMegaMenus] = useState<Record<string, MenuType>>({});
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const [overflowAnimating, setOverflowAnimating] = useState(false);
  const overflowButtonRef = useRef<HTMLButtonElement>(null);
  const overflowMenuRef = useRef<HTMLDivElement>(null);

  // Use optimized breakpoint hooks to prevent forced reflows
  const _isDesktop = useIsDesktop();
  const _isTablet = useIsTablet();

  const {
    isHeaderBlurVisible,
    setOverflowMenuOpen,
    isOverflowMenuOpen,
    activeMegaMenuId,
    closeMegaMenu,
    setMegaMenuContent
  } = useMegaMenuContext();

  // Important: We'll use CSS-only dark mode with the 'dark:' variant
  // This prevents hydration mismatches by ensuring server and client render the same HTML

  // Use Contentful Live Preview to get real-time updates
  const header = useContentfulLiveUpdates(props);
  // Add inspector mode for Contentful editing
  const inspectorProps = useContentfulInspectorMode({ entryId: header?.sys?.id });

  // Helper function to resolve the correct URL for menu items
  const resolveMenuItemUrl = (item: { internalLink?: { slug: string }; externalLink?: string; text: string }) => {
    if (item.externalLink) {
      return item.externalLink;
    }
    
    if (item.internalLink?.slug) {
      const slug = item.internalLink.slug;
      
      // If static routing is available, try it first
      if (staticRoutingService.isAvailable()) {
        // First try the slug as-is (with leading slash)
        const directPath = slug.startsWith('/') ? slug : `/${slug}`;
        const route = staticRoutingService.getRoute(directPath);
        if (route) {
          return route.path;
        }
        
        // If not found, search for routes that end with this slug
        const allPaths = staticRoutingService.getAllPaths();
        
        const matchingPaths = allPaths.filter(path => {
          const pathSegments = path.split('/');
          const lastSegment = pathSegments[pathSegments.length - 1];
          return lastSegment === slug || path === directPath;
        });
        
        if (matchingPaths.length > 0) {
          const selectedPath = matchingPaths[0];
          return selectedPath;
        }
      }
      
      // Enhanced fallback logic based on menu item text and slug
      let fallbackUrl = slug.startsWith('/') ? slug : `/${slug}`;
      
      // Special handling for services menu items
      if (item.text.toLowerCase().includes('deploy') || slug.includes('deploy')) {
        fallbackUrl = '/services/deploy';
      } else if (item.text.toLowerCase().includes('operate') || slug.includes('operate')) {
        fallbackUrl = '/services/operate';
      } else if (item.text.toLowerCase().includes('design') || slug.includes('design')) {
        fallbackUrl = '/services/design';
      }
      
      return fallbackUrl;
    }
    
    return '#';
  };

  // Load menu if header has menu reference
  useEffect(() => {
    if (header?.menu?.sys?.id && !menu) {
      setMenuLoading(true);
      const fetchMenu = async () => {
        try {
          const response = await fetch(`/api/components/Menu/${header.menu?.sys.id}`);
          if (response.ok) {
            const data = await response.json();
            setMenu(data.menu);
          }
        } catch (error) {
          console.warn('Error fetching menu:', error);
        } finally {
          setMenuLoading(false);
        }
      };
      void fetchMenu();
    }
  }, [header?.menu?.sys?.id, menu]);

  // Load overflow menu if header has overflow reference
  useEffect(() => {
    if (header?.overflow?.sys?.id && !overflowMenu && !overflowMenuLoading) {
      setOverflowMenuLoading(true);

      // Since overflow links to MegaMenu, not Menu, we need to use MegaMenu API
      if (header.overflow.__typename === 'MegaMenu') {
        const fetchOverflowMegaMenu = async () => {
          try {
            const response = await fetch(`/api/components/MegaMenu/${header.overflow!.sys.id}/overflow`);
            if (response.ok) {
              const data = await response.json();
              const loadedMegaMenu = data.megaMenu;
              
              // Convert MegaMenu to Menu format for compatibility
              if (loadedMegaMenu?.itemsCollection) {
                const menuFormat = {
                  sys: loadedMegaMenu.sys,
                  __typename: 'Menu' as const,
                  title: loadedMegaMenu.title,
                  itemsCollection: {
                    items: loadedMegaMenu.itemsCollection.items.map((item: MenuItem) => ({
                      ...item,
                      __typename: 'MenuItem' as const,
                      description: item.description ?? '',
                      // Preserve associatedImage if it exists
                      associatedImage: item.associatedImage || null
                    }))
                  }
                };
                setOverflowMenu(menuFormat);

                // Store the tags from the original MegaMenu
                setOverflowMenuTags(loadedMegaMenu.contentfulMetadata?.tags);
              }
            }
          } catch (error) {
            console.warn('Error fetching overflow mega menu:', error);
          } finally {
            setOverflowMenuLoading(false);
          }
        };
        void fetchOverflowMegaMenu();
      } else {
        // Fallback to Menu API with associated images for overflow
        const fetchOverflowMenu = async () => {
          try {
            const response = await fetch(`/api/components/Menu/${header.overflow!.sys.id}/overflow`);
            if (response.ok) {
              const data = await response.json();
              const loadedMenu = data.menu;
              if (loadedMenu) {
                setOverflowMenu(loadedMenu);
              }
            }
          } catch (error) {
            console.warn('Error fetching overflow menu:', error);
          } finally {
            setOverflowMenuLoading(false);
          }
        };
        void fetchOverflowMenu();
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
        // md breakpoint is 768px - close sheet when switching to tablet/desktop
        setIsSheetOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isSheetOpen]);

  // Load available locales on mount
  useEffect(() => {
    const loadLocales = async () => {
      try {
        const response = await fetch('/api/locales');

        if (!response.ok) {
          const _errorText = await response.text();
          throw new Error(`Failed to fetch locales: ${response.statusText}`);
        }

        const data = (await response.json()) as LocaleApiResponse;

        if (data.locales && Array.isArray(data.locales)) {
          setLocales(data.locales);
        } else {
          throw new Error('Invalid locales response format');
        }
      } catch {
        // Fallback to minimal locale set
        setLocales([
          { code: 'en-US', name: 'English (US)', default: true },
          { code: 'pt-BR', name: 'Português (Brasil)', default: false },
          { code: 'es', name: 'Español', default: false }
        ]);
      }
    };

    void loadLocales();
  }, []);

  // Function to check if a link is active
  const _isActivePage = (page: Page) => pathname === `/${page.slug}`;

  const _isActiveHref = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Don't show full skeleton - render header with logo but skeleton navigation
  const showNavigationSkeleton = menuLoading || overflowMenuLoading;

  if (!header) {
    return (
      <div className="fixed top-0 left-0 right-0 w-full header-skeleton z-[100]">
        <Container className="w-full pt-0 lg:pt-6">
          <header className="relative z-[100] px-6 py-1.5 lg:py-4">
            <div className="nav-container">
              <div className="logo-container">
                {/* Logo skeleton */}
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/20"></div>
                <div className="h-6 w-24 animate-pulse rounded bg-white/20"></div>
              </div>
              {/* Navigation skeleton */}
              <div className="hidden md:flex items-center gap-4">
                <div className="h-6 w-16 animate-pulse rounded bg-white/20"></div>
                <div className="h-6 w-20 animate-pulse rounded bg-white/20"></div>
                <div className="h-6 w-18 animate-pulse rounded bg-white/20"></div>
              </div>
            </div>
          </header>
        </Container>
      </div>
    );
  }

  return (
    <div className={`fixed top-0 left-0 right-0 w-full header-container ${isSheetOpen ? 'z-[0] md:z-[90]' : 'z-[100]'}`}>
      <Container className={`w-full pt-0 transition-all duration-300 lg:pt-6`}>
        <header
          className={`relative z-[100] px-6 transition-all duration-300 max-md:z-[40] max-md:py-1.5 lg:w-full ${
            isScrolled && isHeaderBlurVisible ? 'bg-black/[0.72] backdrop-blur-[30px]' : ''
          }`}
          {...inspectorProps({ fieldId: 'name' })}
          onMouseLeave={(e) => {
            // Only close on desktop (screen width >= 1280px)
            if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
              const relatedTarget = e.relatedTarget;
              const isEnteringMegaMenu =
                relatedTarget && typeof relatedTarget === 'object' && 'closest' in relatedTarget
                  ? (relatedTarget as Element).closest('[data-mega-menu-portal]')
                  : null;
              const isEnteringOverflowMenu =
                relatedTarget && typeof relatedTarget === 'object' && 'closest' in relatedTarget
                  ? (relatedTarget as Element).closest('[data-overflow-menu]')
                  : null;

              // Don't close if entering mega menu or overflow menu
              if (!isEnteringMegaMenu && !isEnteringOverflowMenu) {
                // Close any open mega menus after a short delay
                setTimeout(() => {
                  if (activeMegaMenuId) {
                    closeMegaMenu(activeMegaMenuId);
                    setMegaMenuContent(null);
                  }
                  setOverflowMenuOpen(false);
                }, 150);
              }
            }
          }}
        >
          <Box className="items-center justify-between">
            {/* Logo Section */}
            <Logo logo={header.logo} className="flex items-center gap-2 py-4 flex-shrink-0" />

            {/* Tablet Navigation - Compact */}
            <div className="hidden items-center md:flex xl:hidden" data-testid="tablet-nav">
              <Link href="/search" aria-label="Search" className="mr-2">
                <Search className="text-white hover:text-white/80 transition-colors cursor-pointer size-5" />
              </Link>

              {/* Mobile Hamburger Menu */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-xxs flex items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="fullscreen" className="p-0 bg-black flex flex-col z-[9999]">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  {/* Header with Logo, Search, and Close */}
                  <div className="flex items-center justify-between p-6">
                    <Logo logo={header.logo} />
                    <div className="flex items-center gap-0 pl-4">
                      <Link href="/search">
                        <Button
                          variant="ghost"
                          className="rounded-xxs flex items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl"
                        >
                          <Search className="size-5" />
                          <span className="sr-only">Search</span>
                        </Button>
                      </Link>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="rounded-xxs flex items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl"
                        >
                          <X className="size-5" />
                          <span className="sr-only">Close menu</span>
                        </Button>
                      </SheetClose>
                    </div>
                  </div>

                  {/* Navigation Content */}
                  <nav className="max-h-[75vh] overflow-y-auto px-6 pt-6 pb-24 space-y-6">
                    {/* Main Menu Items */}
                    {showNavigationSkeleton ? (
                      <div className="space-y-4">
                        <div className="h-5 w-24 animate-pulse rounded bg-white/20" />
                        <div className="h-5 w-32 animate-pulse rounded bg-white/20" />
                        <div className="h-5 w-28 animate-pulse rounded bg-white/20" />
                      </div>
                    ) : menu ? (
                      <div>
                        <div className="space-y-2">
                          {menu.itemsCollection?.items?.map((item, index) => {
                            const isDropdownParent = item.__typename === 'MegaMenu';
                            const previousItem =
                              index > 0 ? menu.itemsCollection?.items?.[index - 1] : null;
                            const previousIsDropdownParent =
                              previousItem?.__typename === 'MegaMenu';
                            const isCurrentOpen = openCollapsible === `main-${item.sys.id}`;
                            const isPreviousOpen =
                              previousItem && openCollapsible === `main-${previousItem.sys.id}`;
                            const hasAnyDropdownOpen = openCollapsible !== null;

                            // Show divider logic:
                            // If no dropdown is open: show dividers between all top-level items (except first)
                            // If a dropdown is open: only show dividers around the open dropdown
                            const needsDivider =
                              index > 0 &&
                              (!hasAnyDropdownOpen ||
                                (isDropdownParent &&
                                  previousIsDropdownParent &&
                                  (isCurrentOpen || isPreviousOpen)));

                            // Check if any dropdown is open and this is a regular menu item
                            const isInactiveMenuItem =
                              item.__typename === 'MenuItem' && hasAnyDropdownOpen;

                            return (
                              <div
                                key={item.sys.id}
                                className={isInactiveMenuItem ? 'opacity-50' : ''}
                              >
                                {needsDivider && (
                                  <div className="my-4 border-t border-white/20"></div>
                                )}

                                {item.__typename === 'MenuItem' &&
                                  (() => {
                                    const linkUrl = item.internalLink?.slug
                                      ? `/${item.internalLink.slug}`
                                      : (item.externalLink ?? '#');
                                    const linkTarget = item.externalLink ? '_blank' : '_self';
                                    const linkRel = item.externalLink
                                      ? 'noopener noreferrer'
                                      : undefined;

                                    return (
                                      <a
                                        href={linkUrl}
                                        target={linkTarget}
                                        rel={linkRel}
                                        className="text-white hover:bg-white/10 block rounded-md px-3 py-2 text-[1.375rem] font-normal leading-[1.4] tracking-[0.01rem] transition-colors"
                                        onClick={() => setIsSheetOpen(false)}
                                      >
                                        {item.text}
                                      </a>
                                    );
                                  })()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-white">No menu available</div>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Navigation */}
            <div
              className="hidden items-center xl:flex min-w-0 flex-1 justify-end"
              data-testid="desktop-nav"
            >
              <div
                className={`rounded-xxs mr-4 transition-all duration-300 min-w-0 ${
                  isHeaderBlurVisible && !isScrolled ? 'bg-black/[0.72] backdrop-blur-[30px]' : ''
                }`}
              >
                {showNavigationSkeleton ? (
                  <div className="flex items-center px-6 py-3 gap-4">
                    <div className="h-4 w-16 animate-pulse rounded bg-white/20" />
                    <div className="h-4 w-20 animate-pulse rounded bg-white/20" />
                    <div className="h-4 w-18 animate-pulse rounded bg-white/20" />
                  </div>
                ) : menu ? (
                  <MenuComponent menu={menu} locales={locales} {...inspectorProps} />
                ) : (
                  <div className="px-4 py-2 text-white">
                    No menu available (Header menu ID: {header?.menu?.sys?.id ?? 'none'})
                  </div>
                )}
              </div>

              <Link href="/search" aria-label="Search">
                <Search className="text-white hover:text-white/80 transition-colors cursor-pointer" />
              </Link>

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
                    onClick={() => {
                      if (!isOverflowMenuOpen) {
                        setOverflowMenuOpen(true);
                        requestAnimationFrame(() => {
                          setOverflowAnimating(true);
                        });
                      } else {
                        setOverflowAnimating(false);
                        setTimeout(() => {
                          setOverflowMenuOpen(false);
                        }, 200);
                      }
                    }}
                  >
                    {isOverflowMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    <span className="sr-only">
                      {isOverflowMenuOpen ? 'Close overflow menu' : 'Open overflow menu'}
                    </span>
                  </Button>

                  {/* Portal-based dropdown menu */}
                  {isOverflowMenuOpen &&
                    typeof window !== 'undefined' &&
                    document.body &&
                    createPortal(
                      <div
                        ref={overflowMenuRef}
                        className={`fixed top-0 left-0 z-[99] h-auto min-h-fit w-screen bg-black/[0.72] pt-24 shadow-[0_4px_20px_0_rgba(0,0,0,0.16)] backdrop-blur-[30px] transition-all duration-200 ease-out ${
                          overflowAnimating
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 -translate-y-2'
                        }`}
                        data-overflow-menu
                        onClick={() => {
                          setOverflowAnimating(false);
                          setTimeout(() => {
                            setOverflowMenuOpen(false);
                          }, 200);
                        }}
                        onMouseLeave={(e) => {
                          // Only close on desktop (screen width >= 1280px)
                          if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
                            const relatedTarget = e.relatedTarget;
                            const isEnteringHeader =
                              relatedTarget &&
                              typeof relatedTarget === 'object' &&
                              'closest' in relatedTarget
                                ? (relatedTarget as Element).closest('header')
                                : null;

                            // Close if not entering header area
                            if (!isEnteringHeader) {
                              setOverflowAnimating(false);
                              setTimeout(() => {
                                setOverflowMenuOpen(false);
                              }, 200);
                            }
                          }
                        }}
                      >
                        <div
                          className={`px-6 py-8 transition-all duration-200 ease-out delay-75 ${
                            overflowAnimating
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 -translate-y-1'
                          }`}
                        >
                          <Container>
                            <nav onClick={(e) => e.stopPropagation()}>
                              {showNavigationSkeleton ? (
                                <div className="flex flex-col gap-4">
                                  <div className="h-6 w-32 animate-pulse rounded bg-white/20" />
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="h-40 animate-pulse rounded bg-white/10" />
                                    <div className="flex flex-col gap-2">
                                      <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
                                      <div className="h-4 w-28 animate-pulse rounded bg-white/20" />
                                      <div className="h-4 w-20 animate-pulse rounded bg-white/20" />
                                    </div>
                                  </div>
                                </div>
                              ) : overflowMenu ? (
                                <MenuComponent
                                  menu={overflowMenu}
                                  variant="overflow"
                                  megaMenuTags={overflowMenuTags}
                                  locales={locales}
                                />
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
            <Box
              direction="row"
              gap={2}
              className="items-center md:hidden"
              data-testid="mobile-nav"
            >
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
                <SheetContent side="fullscreen" className="p-0 bg-black flex flex-col z-[9999]">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  {/* Header with Logo, Search, and Close */}
                  <div className="flex items-center justify-between p-6">
                    <Logo logo={header.logo} />
                    <div className="flex items-center gap-2">
                      <Link href="/search">
                        <Button
                          variant="ghost"
                          className="rounded-xxs flex items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl"
                        >
                          <Search className="size-5" />
                          <span className="sr-only">Search</span>
                        </Button>
                      </Link>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="rounded-xxs flex items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl"
                        >
                          <X className="size-5" />
                          <span className="sr-only">Close menu</span>
                        </Button>
                      </SheetClose>
                    </div>
                  </div>

                  {/* Navigation Content */}
                  <nav className="max-h-[75vh] overflow-y-auto px-6 pt-6 pb-24 space-y-6">
                    {/* Main Menu Items */}
                    {showNavigationSkeleton ? (
                      <div className="space-y-4">
                        <div className="h-5 w-24 animate-pulse rounded bg-white/20" />
                        <div className="h-5 w-32 animate-pulse rounded bg-white/20" />
                        <div className="h-5 w-28 animate-pulse rounded bg-white/20" />
                      </div>
                    ) : menu ? (
                      <div>
                        <div className="space-y-2">
                          {menu.itemsCollection?.items?.map((item, index) => {
                            const isDropdownParent = item.__typename === 'MegaMenu';
                            const previousItem =
                              index > 0 ? menu.itemsCollection?.items?.[index - 1] : null;
                            const previousIsDropdownParent =
                              previousItem?.__typename === 'MegaMenu';
                            const isCurrentOpen = openCollapsible === `main-${item.sys.id}`;
                            const isPreviousOpen =
                              previousItem && openCollapsible === `main-${previousItem.sys.id}`;
                            const hasAnyDropdownOpen = openCollapsible !== null;

                            // Show divider logic:
                            // If no dropdown is open: show dividers between all top-level items (except first)
                            // If a dropdown is open: only show dividers around the open dropdown
                            const needsDivider =
                              index > 0 &&
                              (!hasAnyDropdownOpen ||
                                (isDropdownParent &&
                                  previousIsDropdownParent &&
                                  (isCurrentOpen || isPreviousOpen)));

                            // Check if any dropdown is open and this dropdown is not the open one
                            const isInactiveDropdown =
                              isDropdownParent && hasAnyDropdownOpen && !isCurrentOpen;
                            // Check if any dropdown is open and this is a regular menu item
                            const isInactiveMenuItem =
                              item.__typename === 'MenuItem' && hasAnyDropdownOpen;

                            return (
                              <div
                                key={item.sys.id}
                                className={`${isInactiveDropdown ? 'opacity-50' : ''} ${isInactiveMenuItem ? 'opacity-50' : ''}`}
                              >
                                {needsDivider && (
                                  <div className="my-4 border-t border-white/20"></div>
                                )}

                                {item.__typename === 'MenuItem'
                                  ? (() => {
                                      const linkUrl = resolveMenuItemUrl(item);
                                      const linkTarget = item.externalLink ? '_blank' : '_self';
                                      const linkRel = item.externalLink
                                        ? 'noopener noreferrer'
                                        : undefined;

                                      return (
                                        <a
                                          href={linkUrl}
                                          target={linkTarget}
                                          rel={linkRel}
                                          className="text-white hover:bg-white/10 block rounded-md px-3 py-2 text-[1.375rem] font-normal leading-[1.4] tracking-[0.01rem] transition-colors"
                                          onClick={() => setIsSheetOpen(false)}
                                        >
                                          {item.text}
                                        </a>
                                      );
                                    })()
                                  : item.__typename === 'MegaMenu'
                                    ? (() => {
                                        const megaMenuData = loadedMegaMenus[item.sys.id];
                                        const isOpen = openCollapsible === `main-${item.sys.id}`;

                                        return (
                                          <Collapsible
                                            open={isOpen}
                                            onOpenChange={(open) => {
                                              if (open) {
                                                setOpenCollapsible(`main-${item.sys.id}`);
                                                if (!megaMenuData) {
                                                  const fetchMegaMenu = async () => {
                                                    try {
                                                      const response = await fetch(`/api/components/MegaMenu/${item.sys.id}`);
                                                      if (response.ok) {
                                                        const data = await response.json();
                                                        const loadedMenu = data.megaMenu;
                                                        if (loadedMenu?.itemsCollection) {
                                                          const itemsCollection = loadedMenu.itemsCollection;
                                                          setLoadedMegaMenus((prev) => ({
                                                            ...prev,
                                                            [item.sys.id]: {
                                                              ...loadedMenu,
                                                              itemsCollection: {
                                                                items: itemsCollection.items.map(
                                                                  (menuItem: MenuItem) => ({
                                                                    ...menuItem,
                                                                    __typename: 'MenuItem' as const,
                                                                    description: menuItem.description ?? ''
                                                                  })
                                                                )
                                                              }
                                                            }
                                                          }));
                                                        }
                                                      }
                                                    } catch (error) {
                                                      console.warn('Error fetching mega menu:', error);
                                                    }
                                                  };
                                                  void fetchMegaMenu();
                                                }
                                              } else {
                                                setOpenCollapsible(null);
                                              }
                                            }}
                                          >
                                            <CollapsibleTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                className="text-white hover:bg-white/10 w-full justify-between rounded-md px-3 py-2 text-[1.375rem] font-normal leading-[1.4] tracking-[0.01rem] transition-colors"
                                              >
                                                {item.title}
                                                <ChevronDown className="h-4 w-4" />
                                              </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="pl-4 pb-4">
                                              <div className="space-y-1">
                                                {megaMenuData?.itemsCollection?.items?.map(
                                                  (subItem) => {
                                                    if (subItem.__typename === 'MenuItem') {
                                                      const subLinkUrl = resolveMenuItemUrl(subItem);
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
                                                          className="text-white/90 hover:bg-white/10 block rounded-md px-3 py-3 text-base font-normal leading-[1.4] tracking-[0.01rem] transition-colors"
                                                          onClick={() => setIsSheetOpen(false)}
                                                        >
                                                          {subItem.text}
                                                        </a>
                                                      );
                                                    }
                                                    return null;
                                                  }
                                                ) ?? (
                                                  <div className="text-white/70 px-3 py-3 text-base">
                                                    {megaMenuData
                                                      ? 'No items available'
                                                      : 'Loading...'}
                                                  </div>
                                                )}
                                              </div>
                                            </CollapsibleContent>
                                          </Collapsible>
                                        );
                                      })()
                                    : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-white">No menu available</div>
                    )}

                    {/* Overflow Menu Items - Mobile Bottom */}
                    {overflowMenu && (
                      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black">
                        <div className="space-y-4">
                          {/* LocaleDropdown - Centered above overflow items */}
                          <div className="flex justify-center">
                            <LocaleDropdown locales={locales} className="rounded-md px-4 py-2" />
                          </div>

                          {/* Overflow Menu Items */}
                          <div className="flex flex-wrap gap-4 justify-center">
                            {overflowMenu.itemsCollection?.items?.map((item) => {
                              if (item.__typename === 'MenuItem') {
                                const linkUrl = resolveMenuItemUrl(item);
                                const linkTarget = item.externalLink ? '_blank' : '_self';
                                const linkRel = item.externalLink
                                  ? 'noopener noreferrer'
                                  : undefined;

                                return (
                                  <a
                                    key={item.sys.id}
                                    href={linkUrl}
                                    target={linkTarget}
                                    rel={linkRel}
                                    className="text-white/90 hover:bg-white/10 rounded-md px-4 py-2 text-sm transition-colors whitespace-nowrap"
                                    onClick={() => setIsSheetOpen(false)}
                                  >
                                    {item.text}
                                  </a>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </Box>
          </Box>
        </header>
      </Container>
    </div>
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
