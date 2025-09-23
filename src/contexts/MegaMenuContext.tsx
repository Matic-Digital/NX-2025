'use client';

import React, { createContext, useContext, useRef, useState } from 'react';

import type { ReactNode } from 'react';

interface MegaMenuContextType {
  isAnyMegaMenuOpen: boolean;
  isOverflowMenuOpen: boolean;
  isHeaderBlurVisible: boolean;
  openMegaMenu: (menuId: string) => void;
  closeMegaMenu: (menuId: string) => void;
  setOverflowMenuOpen: (isOpen: boolean) => void;
  setMegaMenuOpen: (isOpen: boolean) => void; // Legacy compatibility
}

const MegaMenuContext = createContext<MegaMenuContextType | undefined>(undefined);

export function MegaMenuProvider({ children }: { children: ReactNode }) {
  const [openMegaMenus, setOpenMegaMenus] = useState<Set<string>>(new Set());
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  const [isHeaderBlurVisible, setIsHeaderBlurVisible] = useState(true);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAnyMegaMenuOpen = openMegaMenus.size > 0;
  const isAnyMenuOpen = isAnyMegaMenuOpen || isOverflowMenuOpen;

  // Update header blur visibility based on menu states
  React.useEffect(() => {
    if (isAnyMenuOpen) {
      // Immediately hide blur when any menu opens
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setIsHeaderBlurVisible(false);
    } else {
      // Add small delay before showing blur to handle rapid transitions
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      blurTimeoutRef.current = setTimeout(() => {
        setIsHeaderBlurVisible(true);
      }, 150);
    }

    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [isAnyMenuOpen]);

  const openMegaMenu = (menuId: string) => {
    setOpenMegaMenus((prev) => new Set(prev).add(menuId));
  };

  const closeMegaMenu = (menuId: string) => {
    setOpenMegaMenus((prev) => {
      const newSet = new Set(prev);
      newSet.delete(menuId);
      return newSet;
    });
  };

  const setOverflowMenuOpenHandler = (isOpen: boolean) => {
    setIsOverflowMenuOpen(isOpen);
  };

  // Legacy compatibility method
  const setMegaMenuOpen = (isOpen: boolean) => {
    if (isOpen) {
      openMegaMenu('legacy');
    } else {
      closeMegaMenu('legacy');
    }
  };

  return (
    <MegaMenuContext.Provider
      value={{
        isAnyMegaMenuOpen,
        isOverflowMenuOpen,
        isHeaderBlurVisible,
        openMegaMenu,
        closeMegaMenu,
        setOverflowMenuOpen: setOverflowMenuOpenHandler,
        setMegaMenuOpen
      }}
    >
      {children}
    </MegaMenuContext.Provider>
  );
}

export function useMegaMenuContext() {
  const context = useContext(MegaMenuContext);
  if (context === undefined) {
    throw new Error('useMegaMenuContext must be used within a MegaMenuProvider');
  }
  return context;
}
