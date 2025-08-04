'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ServiceCardContextType {
  activeCardId: string | null;
  setActiveCardId: (id: string | null) => void;
}

const ServiceCardContext = createContext<ServiceCardContextType | undefined>(undefined);

export function ServiceCardProvider({ children }: { children: ReactNode }) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  return (
    <ServiceCardContext.Provider value={{ activeCardId, setActiveCardId }}>
      {children}
    </ServiceCardContext.Provider>
  );
}

export function useServiceCard() {
  const context = useContext(ServiceCardContext);
  if (context === undefined) {
    throw new Error('useServiceCard must be used within a ServiceCardProvider');
  }
  return context;
}
