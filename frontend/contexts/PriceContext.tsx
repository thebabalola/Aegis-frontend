"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePriceTracker, type SpotPrices } from "@/hooks/usePriceTracker";

interface PriceContextType {
  prices: SpotPrices;
  loading: boolean;
  error: string | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const { prices, loading, error } = usePriceTracker({
    ids: ["stellar", "usd-coin", "wrapped-stellar"],
    enabled: true,
  });

  return (
    <PriceContext.Provider value={{ prices, loading, error }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePrices must be used within a PriceProvider");
  }
  return context;
}
