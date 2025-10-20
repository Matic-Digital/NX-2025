'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

import type { ReactNode } from 'react';

interface AccordionContextType {
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export function AccordionProvider({ children }: { children: ReactNode }) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Use useCallback to prevent unnecessary re-renders that could cause flickering
  const handleSetActiveItemId = useCallback((id: string | null) => {
    setActiveItemId(id);
  }, []);

  return (
    <AccordionContext.Provider value={{ activeItemId, setActiveItemId: handleSetActiveItemId }}>
      {children}
    </AccordionContext.Provider>
  );
}

export function useAccordion() {
  const context = useContext(AccordionContext);
  if (context === undefined) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
}
