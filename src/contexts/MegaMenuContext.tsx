'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface MegaMenuContextType {
  isAnyMegaMenuOpen: boolean;
  setMegaMenuOpen: (isOpen: boolean) => void;
}

const MegaMenuContext = createContext<MegaMenuContextType | undefined>(undefined);

export function MegaMenuProvider({ children }: { children: ReactNode }) {
  const [isAnyMegaMenuOpen, setIsAnyMegaMenuOpen] = useState(false);
  const [openTimeoutId, setOpenTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const setMegaMenuOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Clear any pending close timeout when opening
      if (openTimeoutId) {
        clearTimeout(openTimeoutId);
        setOpenTimeoutId(null);
      }
      setIsAnyMegaMenuOpen(true);
    } else {
      // Immediately close when explicitly set to false (e.g., hovering regular menu items)
      if (openTimeoutId) {
        clearTimeout(openTimeoutId);
        setOpenTimeoutId(null);
      }
      setIsAnyMegaMenuOpen(false);
    }
  };

  return (
    <MegaMenuContext.Provider value={{ isAnyMegaMenuOpen, setMegaMenuOpen }}>
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
