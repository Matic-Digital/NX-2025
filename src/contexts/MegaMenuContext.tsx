'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Container } from '@/components/global/matic-ds';

import type { ReactNode } from 'react';

interface MegaMenuContextType {
  isAnyMegaMenuOpen: boolean;
  isOverflowMenuOpen: boolean;
  isHeaderBlurVisible: boolean;
  activeMegaMenuContent: React.ReactNode | null;
  activeMegaMenuId: string | null;
  openMegaMenu: (menuId: string) => void;
  closeMegaMenu: (menuId: string) => void;
  setMegaMenuContent: (content: React.ReactNode | null) => void;
  clearCloseTimeout: () => void;
  setOverflowMenuOpen: (isOpen: boolean) => void;
  setMegaMenuOpen: (isOpen: boolean) => void; // Legacy compatibility
}

const MegaMenuContext = createContext<MegaMenuContextType | undefined>(undefined);

export function MegaMenuProvider({ children }: { children: ReactNode }) {
  const [openMegaMenus, setOpenMegaMenus] = useState<Set<string>>(new Set());
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  const [isHeaderBlurVisible, setIsHeaderBlurVisible] = useState(true);
  const [activeMegaMenuContent, setActiveMegaMenuContent] = useState<React.ReactNode | null>(null);
  const [activeMegaMenuId, setActiveMegaMenuId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAnyMegaMenuOpen = openMegaMenus.size > 0;

  // Update header blur visibility based on mega menu portal state and overflow menu
  React.useEffect(() => {
    if ((isAnyMegaMenuOpen && activeMegaMenuContent) || isOverflowMenuOpen) {
      // Immediately hide blur when mega menu portal or overflow menu opens - no delay
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setIsHeaderBlurVisible(false);
    } else {
      // Small delay when restoring blur to prevent overlap with scroll events
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      blurTimeoutRef.current = setTimeout(() => {
        setIsHeaderBlurVisible(true);
      }, 50); // Very short delay to prevent overlap
    }

    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [isAnyMegaMenuOpen, activeMegaMenuContent, isOverflowMenuOpen]);

  const openMegaMenu = (menuId: string) => {
    setOpenMegaMenus((prev) => new Set(prev).add(menuId));
    setActiveMegaMenuId(menuId);
    setShouldRender(true);
    // Small delay to ensure DOM is ready, then start animation
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  const closeMegaMenu = React.useCallback((menuId: string) => {
    setOpenMegaMenus((prev) => {
      const newSet = new Set(prev);
      newSet.delete(menuId);
      return newSet;
    });
    if (activeMegaMenuId === menuId) {
      // Start closing animation
      setIsAnimating(false);
      // Wait for animation to complete before removing content
      setTimeout(() => {
        setActiveMegaMenuId(null);
        setActiveMegaMenuContent(null);
        setShouldRender(false);
      }, 200); // Match animation duration
    }
  }, [activeMegaMenuId]);

  const setOverflowMenuOpenHandler = (isOpen: boolean) => {
    setIsOverflowMenuOpen(isOpen);
    
    // Close all mega menus when overflow menu opens
    if (isOpen && activeMegaMenuId) {
      closeMegaMenu(activeMegaMenuId);
      setActiveMegaMenuContent(null);
    }
  };

  const setMegaMenuContent = (content: React.ReactNode | null) => {
    setActiveMegaMenuContent(content);
  };

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Legacy compatibility method
  const setMegaMenuOpen = (isOpen: boolean) => {
    if (isOpen) {
      openMegaMenu('legacy');
    } else {
      closeMegaMenu('legacy');
    }
  };

  // Close mega menus when clicking outside or hovering out on desktop
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside the mega menu portal and header area
      const target = event.target as Element;
      const isClickingOnHeader = target.closest('header');
      const isClickingOnMegaMenu = target.closest('[data-mega-menu-portal]');
      
      if (!isClickingOnHeader && !isClickingOnMegaMenu && activeMegaMenuId) {
        closeMegaMenu(activeMegaMenuId);
        setActiveMegaMenuContent(null);
      }
    };

    const handleMouseLeave = (event: Event) => {
      // Only close on desktop (screen width >= 1280px)
      if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
        const mouseEvent = event as MouseEvent;
        const target = mouseEvent.target as Element;
        const relatedTarget = mouseEvent.relatedTarget as Element | null;
        
        // Check if we're leaving the mega menu portal or header area
        const isLeavingMegaMenu = target.closest('[data-mega-menu-portal]');
        const isEnteringHeader = relatedTarget?.closest('header');
        const isEnteringMegaMenu = relatedTarget?.closest('[data-mega-menu-portal]');
        
        // Close if leaving mega menu and not entering header or another mega menu
        if (isLeavingMegaMenu && !isEnteringHeader && !isEnteringMegaMenu && activeMegaMenuId) {
          // Add a small delay to prevent accidental closes when moving between elements
          closeTimeoutRef.current = setTimeout(() => {
            closeMegaMenu(activeMegaMenuId);
            setActiveMegaMenuContent(null);
          }, 100);
        }
      }
    };

    if (typeof window !== 'undefined' && activeMegaMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Add mouse leave listener to the mega menu portal
      const megaMenuPortal = document.querySelector('[data-mega-menu-portal]');
      if (megaMenuPortal) {
        megaMenuPortal.addEventListener('mouseleave', handleMouseLeave);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        if (megaMenuPortal) {
          megaMenuPortal.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [activeMegaMenuId, closeMegaMenu, setActiveMegaMenuContent]);


  return (
    <MegaMenuContext.Provider
      value={{
        isAnyMegaMenuOpen,
        isOverflowMenuOpen,
        isHeaderBlurVisible,
        activeMegaMenuContent,
        activeMegaMenuId,
        openMegaMenu,
        closeMegaMenu,
        setMegaMenuContent,
        clearCloseTimeout,
        setOverflowMenuOpen: setOverflowMenuOpenHandler,
        setMegaMenuOpen
      }}
    >
      {children}
      {/* Single shared portal for all mega menus */}
      {shouldRender && activeMegaMenuContent && typeof window !== 'undefined' && document.body &&
        createPortal(
          <div 
            className={`fixed top-0 left-0 w-screen bg-black/[0.72] backdrop-blur-[30px] shadow-[0_4px_20px_0_rgba(0,0,0,0.16)] z-40 transition-all duration-200 ease-out ${
              isAnimating 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-2'
            }`}
            data-mega-menu-portal
          >
            <div className={`pt-24 px-6 transition-all duration-200 ease-out delay-75 ${
              isAnimating 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-1'
            }`}>
              <Container>
                {activeMegaMenuContent}
              </Container>
            </div>
          </div>,
          document.body
        )
      }</MegaMenuContext.Provider>
  );
}

export function useMegaMenuContext() {
  const context = useContext(MegaMenuContext);
  if (context === undefined) {
    throw new Error('useMegaMenuContext must be used within a MegaMenuProvider');
  }
  return context;
}
