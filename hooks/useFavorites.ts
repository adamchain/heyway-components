import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteItem {
  id: string;
  name: string;
  phoneNumber: string;
  type: 'contact' | 'business';
  address?: string;
  rating?: number;
  dateAdded: string;
}

const FAVORITES_STORAGE_KEY = 'userFavorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFavorites = useCallback(async (newFavorites: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Failed to save favorites:', err);
      setError('Failed to save favorites');
      throw err;
    }
  }, []);

  const addToFavorites = useCallback(async (item: Omit<FavoriteItem, 'id' | 'dateAdded'>) => {
    try {
      setError(null);
      
      // Check if already exists
      const exists = favorites.find(fav => 
        fav.phoneNumber === item.phoneNumber && fav.type === item.type
      );
      
      if (exists) {
        throw new Error('Item is already in favorites');
      }

      const newFavorite: FavoriteItem = {
        ...item,
        id: `${item.type}_${item.phoneNumber}_${Date.now()}`,
        dateAdded: new Date().toISOString(),
      };

      const updatedFavorites = [...favorites, newFavorite];
      await saveFavorites(updatedFavorites);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to favorites';
      setError(message);
      throw new Error(message);
    }
  }, [favorites, saveFavorites]);

  const removeFromFavorites = useCallback(async (itemId: string) => {
    try {
      setError(null);
      const updatedFavorites = favorites.filter(fav => fav.id !== itemId);
      await saveFavorites(updatedFavorites);
    } catch (err) {
      console.error('Failed to remove from favorites:', err);
      setError('Failed to remove from favorites');
      throw err;
    }
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((phoneNumber: string, type: 'contact' | 'business') => {
    return favorites.some(fav => fav.phoneNumber === phoneNumber && fav.type === type);
  }, [favorites]);

  const getFavoritesByType = useCallback((type: 'contact' | 'business') => {
    return favorites.filter(fav => fav.type === type);
  }, [favorites]);

  const clearAllFavorites = useCallback(async () => {
    try {
      setError(null);
      await saveFavorites([]);
    } catch (err) {
      console.error('Failed to clear favorites:', err);
      setError('Failed to clear favorites');
      throw err;
    }
  }, [saveFavorites]);

  // Load on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByType,
    clearAllFavorites,
    loadFavorites,
  };
};