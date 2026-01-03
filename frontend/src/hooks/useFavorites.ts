import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addFavorite as addFavoriteToStorage,
  removeFavorite as removeFavoriteFromStorage,
  getAllFavorites,
  isFavorite as checkIsFavorite,
  getFavoritesByBook,
} from '@/lib/favoritesStorage';
import { toast } from 'sonner';

interface FavoriteVerse {
  id: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  dateAdded: string;
}

/**
 * Hook to get all favorites
 */
export function useFavorites() {
  return useQuery<FavoriteVerse[]>({
    queryKey: ['favorites'],
    queryFn: getAllFavorites,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get favorites grouped by book
 */
export function useFavoritesByBook() {
  return useQuery<Map<string, FavoriteVerse[]>>({
    queryKey: ['favoritesByBook'],
    queryFn: getFavoritesByBook,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to check if a verse is favorited
 */
export function useIsFavorite(bookName: string, chapter: number, verse: number) {
  return useQuery<boolean>({
    queryKey: ['isFavorite', bookName, chapter, verse],
    queryFn: () => checkIsFavorite(bookName, chapter, verse),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to add a favorite
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (verse: {
      bookName: string;
      chapter: number;
      verse: number;
      text: string;
      reference: string;
    }) => {
      await addFavoriteToStorage(verse);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favoritesByBook'] });
      queryClient.invalidateQueries({ 
        queryKey: ['isFavorite', variables.bookName, variables.chapter, variables.verse] 
      });
      toast.success('Verse added to favorites!');
    },
    onError: (error) => {
      console.error('Failed to add favorite:', error);
      toast.error('Failed to add favorite. Please try again.');
    },
  });
}

/**
 * Hook to remove a favorite
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await removeFavoriteFromStorage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favoritesByBook'] });
      queryClient.invalidateQueries({ queryKey: ['isFavorite'] });
      toast.success('Verse removed from favorites');
    },
    onError: (error) => {
      console.error('Failed to remove favorite:', error);
      toast.error('Failed to remove favorite. Please try again.');
    },
  });
}
