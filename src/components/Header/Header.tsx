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

import * as React from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { getMenuById } from '../Menu/MenuApi';
import type { Menu as MenuType } from '../Menu/MenuSchema';
import { Menu as MenuComponent } from '../Menu/Menu';
import { MegaMenuProvider } from '../../contexts/MegaMenuContext';
import { Container, Box } from '@/components/global/matic-ds';
import type { Header as HeaderType } from '@/components/Header/HeaderSchema';
import type { Page } from '@/components/Page/PageSchema';

// Navigation menu components from shadcn
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
  NavigationMenuTrigger,
  NavigationMenuContent
} from '@/components/ui/navigation-menu';

// Sheet components for mobile menu from shadcn
import { SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [_isScrolled, setIsScrolled] = React.useState(false);
  const [menu, setMenu] = React.useState<MenuType | null>(null);
  const [menuLoading, setMenuLoading] = React.useState(false);
  // const { isAnyMegaMenuOpen } = useMegaMenuContext();

  // Important: We'll use CSS-only dark mode with the 'dark:' variant
  // This prevents hydration mismatches by ensuring server and client render the same HTML

  // Use Contentful Live Preview to get real-time updates
  const header = useContentfulLiveUpdates(props);
  // Add inspector mode for Contentful editing
  const inspectorProps = useContentfulInspectorMode({ entryId: header?.sys?.id });

  // Debug: Log header data
  React.useEffect(() => {
    console.log('Header data:', header);
    console.log('Header menu:', header?.menu);
  }, [header]);

  // Load menu if header has menu reference
  React.useEffect(() => {
    if (header?.menu?.sys?.id && !menu) {
      console.log('Loading menu with ID:', header.menu.sys.id);
      setMenuLoading(true);
      getMenuById(header.menu.sys.id)
        .then((loadedMenu) => {
          console.log('Menu loaded:', loadedMenu);
          setMenu(loadedMenu);
        })
        .catch((error) => {
          console.error('Error loading menu:', error);
        })
        .finally(() => setMenuLoading(false));
    }
  }, [header?.menu?.sys?.id, menu]);

  // Handle scroll events to add frosted glass effect to header
  React.useEffect(() => {
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

  // Function to check if a link is active
  const _isActivePage = (page: Page) => pathname === `/${page.slug}`;

  const _isActiveHref = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
      className={`sticky top-0 z-50 pt-0 md:pt-6 transition-all duration-300`}
    >
      <header
        className={`relative z-50 px-6 max-md:py-1.5 lg:w-full`}
        {...inspectorProps({ fieldId: 'name' })}
      >
        <Box className="items-center justify-between">
          {/* Logo Section */}
          {header?.logo?.url && (
            <Link href="/" className="flex items-center gap-2 py-4">
              <Box gap={4}>
                <div {...inspectorProps({ fieldId: 'logo' })}>
                  <Image
                    src={header.logo.url}
                    alt={header.logo.description ?? header.logo.title ?? 'Logo'}
                    width={header.logo.width ?? 40}
                    height={header.logo.height ?? 40}
                    className="h-10 w-auto rounded-full object-contain"
                    priority
                  />
                </div>
                <span className="text-headline-xs text-white">{header.name}</span>
              </Box>
            </Link>
          )}

            {/* Desktop Navigation */}
            <div className="hidden items-center lg:flex">
              <div className="rounded-xxs mr-4">
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
            </div>

            {/* Mobile Navigation */}
            <Box direction="row" gap={2} className="items-center lg:hidden">
              <Button
                variant="ghost"
                className={`rounded-xxs ml-2 flex size-10 items-center justify-center bg-black/40 p-2 text-white backdrop-blur-2xl`}
                aria-label="Open menu"
              >
                <Search className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>

              <Sheet>
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
                  <SheetHeader className="text-left text-lg font-semibold">Menu</SheetHeader>
                  <nav className="mt-6">
                    {menuLoading ? (
                      <div className="text-foreground">Loading menu...</div>
                    ) : header.menu && header.menu.__typename === 'Menu' ? (
                      <MenuComponent menu={header.menu as MenuType} />
                    ) : (
                      <div className="text-foreground">No menu available</div>
                    )}
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
