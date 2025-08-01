import React, { createContext, useContext } from 'react';
import { useFavorites as useBaseFavorites } from '@/hooks/useFavorites';

const FavoritesContext = createContext<ReturnType<typeof useBaseFavorites> | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const favorites = useBaseFavorites();
  
  return (
    <FavoritesContext.Provider value={favorites}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};