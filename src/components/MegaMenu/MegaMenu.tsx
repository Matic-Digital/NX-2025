'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ChevronDown } from 'lucide-react';

import { useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Container, Text } from '@/components/global/matic-ds';

import { getMegaMenuById } from '@/components/MegaMenu/MegaMenuApi';
import { MenuItem } from '@/components/MenuItem/MenuItem';

import type { MegaMenu as MegaMenuType } from '@/components/MegaMenu/MegaMenuSchema';

interface MegaMenuProps {
  megaMenu?: MegaMenuType;
  megaMenuId?: string;
  title?: string;
  overflow?: boolean;
}

export function MegaMenu({ megaMenu, megaMenuId, title, overflow }: MegaMenuProps) {
  const [loadedMegaMenu, setLoadedMegaMenu] = useState<MegaMenuType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { openMegaMenu, closeMegaMenu, setOverflowMenuOpen } = useMegaMenuContext();

  const menuId = megaMenuId ?? megaMenu?.sys?.id ?? 'unknown';

  useEffect(() => {
    if (!megaMenu && megaMenuId) {
      setLoading(true);
      getMegaMenuById(megaMenuId)
        .then(setLoadedMegaMenu)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [megaMenu, megaMenuId]);

  const currentMegaMenu = megaMenu ?? loadedMegaMenu;
  const displayTitle = title ?? currentMegaMenu?.title ?? 'Menu';
  const menuItems = currentMegaMenu?.itemsCollection?.items ?? [];

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsHovered(true);
    openMegaMenu(menuId);
    // Close overflow menu when hovering other mega menus
    setOverflowMenuOpen(false);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsHovered(false);
      // Use a delayed close for MegaMenu to allow smooth transitions
      setTimeout(() => {
        closeMegaMenu(menuId);
      }, 100);
    }, 50); // Reduced to 50ms for faster transitions
    setTimeoutId(id);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentMegaMenu) {
    return null;
  }

  // For overflow variant, render as simple menu items without portal
  if (overflow) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground mb-2">{displayTitle}</h3>
        {menuItems.map((menuItem) => (
          <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="cursor-pointer px-4 py-2 text-white hover:text-gray-300 transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex gap-[0.75rem]">
          <Text className="text-white">{displayTitle}</Text>
          <ChevronDown />
        </div>
      </div>
      {isHovered &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed top-0 left-0 w-screen h-auto min-h-fit z-30 bg-black/[0.72] shadow-[0_4px_20px_0_rgba(0,0,0,0.16)] backdrop-blur-[30px] p-8 pt-24"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Container className="mx-auto flex">
              <h2 className="mb-4 flex-grow text-[1.5rem] text-white">{displayTitle}</h2>
              <div className="grid grid-cols-3 gap-4 auto-rows-min">
                {menuItems.map((menuItem) => (
                  <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
                ))}
              </div>
            </Container>
          </div>,
          document.body
        )}
    </div>
  );
}
