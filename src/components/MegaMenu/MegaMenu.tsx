'use client';

import React, { useEffect, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { useMegaMenuContext } from '@/contexts/MegaMenuContext';

import { Text } from '@/components/global/matic-ds';

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
  const {
    setOverflowMenuOpen,
    openMegaMenu,
    setMegaMenuContent,
    clearCloseTimeout,
    activeMegaMenuId
  } = useMegaMenuContext();

  const menuId = megaMenuId ?? megaMenu?.sys?.id ?? 'unknown';

  // Determine if this mega menu should show active state (hovered OR currently open)
  const isActive = isHovered || activeMegaMenuId === menuId;

  useEffect(() => {
    if (!megaMenu && megaMenuId) {
      setLoading(true);
      const fetchMegaMenu = async () => {
        try {
          const response = await fetch(`/api/components/MegaMenu/${megaMenuId}`);
          if (response.ok) {
            const data = await response.json();
            setLoadedMegaMenu(data.megaMenu);
          }
        } catch (error) {
          console.warn('Error fetching mega menu:', error);
        } finally {
          setLoading(false);
        }
      };
      void fetchMegaMenu();
    }
  }, [megaMenu, megaMenuId]);

  const currentMegaMenu = megaMenu ?? loadedMegaMenu;
  const displayTitle = title ?? currentMegaMenu?.title ?? 'Menu';
  const menuItems = currentMegaMenu?.itemsCollection?.items ?? [];
  
  // Calculate dynamic height based on number of items
  const itemCount = menuItems.length;
  const rowsNeeded = Math.ceil(itemCount / 3); // 3 columns on xl screens
  const baseItemHeight = 110; // Height per item in pixels
  const dynamicHeight = Math.max(rowsNeeded * baseItemHeight, 200); // Minimum 200px

  const handleMouseEnter = () => {
    // Clear any pending close timeout immediately
    clearCloseTimeout();
    setIsHovered(true);
    openMegaMenu(menuId);
    setOverflowMenuOpen(false);

    // Set the content for this mega menu
    const content = (
      <div className="p-4 sm:p-6 xl:p-8">
        <div className="flex flex-col gap-6 xl:gap-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-8">
            <h2 className="text-lg sm:text-xl xl:text-[1.5rem] text-white xl:flex-shrink-0 xl:w-64">
              {displayTitle}
            </h2>
            <div className="xl:flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 content-start">
                {menuItems.map((menuItem) => (
                  <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    setMegaMenuContent(content);
  };

  const handleMouseLeave = () => {
    // Don't close immediately - let the portal handle the hover logic
    setIsHovered(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-white">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span className="text-sm">Loading menu...</span>
        </div>
      </div>
    );
  }

  if (!currentMegaMenu) {
    return null;
  }

  // For overflow variant, render with dynamic height
  if (overflow) {
    const overflowHeight = Math.max(itemCount * 50, 100); // 50px per item, minimum 100px
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-foreground mb-2 text-lg font-semibold">{displayTitle}</h3>
        <div className="flex flex-col gap-2 content-start overflow-y-auto" style={{ maxHeight: '300px', minHeight: `${overflowHeight}px` }}>
          {menuItems.map((menuItem) => (
            <MenuItem key={menuItem.sys.id} menuItem={menuItem} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="group cursor-pointer px-2 xl:px-4 py-2 text-white transition-all duration-300 hover:text-gray-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex items-center relative hover:after:scale-x-100 after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white after:transition-transform after:duration-200 after:ease-out after:origin-left ${isActive ? 'after:scale-x-100' : 'after:scale-x-0'}`}
        >
          <Text
            className="text-white transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
            style={{
              textShadow: isActive
                ? '0 0 28px rgba(255, 255, 255, 0.40), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 24px rgba(255, 255, 255, 0.60), 0 0 10px rgba(255, 255, 255, 0.60)'
                : 'none'
            }}
          >
            {displayTitle}
          </Text>
          <ChevronDown
            className={`size-3 xl:size-4 text-white ml-2 transition-transform duration-200 ${isActive ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </div>
    </div>
  );
}
