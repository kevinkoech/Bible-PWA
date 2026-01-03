import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  loadBibleData, 
  getVerseByReference, 
  searchVerses, 
  getBookContent,
  getPopularVerse 
} from '@/lib/bibleDataLoader';

interface BibleVerse {
  reference: string;
  text: string;
  date: string;
  version: string;
}

interface BibleApiResponse {
  reference: string;
  verses: Array<{
    book_id?: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  text: string;
  translation_id: string;
  translation_name?: string;
}

// Get daily verse reference index (rotates through popular verses)
function getDailyVerseIndex(): number {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return dayOfYear % 20; // 20 popular verses
}

// Check if we need to fetch a new daily verse
function shouldFetchNewVerse(): boolean {
  const cached = localStorage.getItem('daily_verse');
  if (!cached) return true;

  try {
    const verse: BibleVerse = JSON.parse(cached);
    const cacheDate = new Date(verse.date);
    const today = new Date();
    
    // Check if cached verse is from today
    return cacheDate.toDateString() !== today.toDateString();
  } catch {
    return true;
  }
}

// Get fallback verse for error scenarios
function getFallbackVerse(): BibleVerse {
  return {
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    date: new Date().toISOString(),
    version: 'KJV',
  };
}

// Custom hook for daily verse using local data
export function useDailyVerse() {
  const queryClient = useQueryClient();

  return useQuery<BibleVerse>({
    queryKey: ['dailyVerse'],
    queryFn: async () => {
      // Check cache first
      if (!shouldFetchNewVerse()) {
        const cached = localStorage.getItem('daily_verse');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            // Continue to fetch if cache is corrupted
          }
        }
      }

      try {
        // Load Bible data to ensure it's cached
        await loadBibleData();
        
        // Get daily verse from popular verses
        const verseIndex = getDailyVerseIndex();
        const result = await getPopularVerse(verseIndex);

        const verse: BibleVerse = {
          reference: result.reference,
          text: result.text,
          date: new Date().toISOString(),
          version: result.translation_id,
        };

        // Cache the verse
        localStorage.setItem('daily_verse', JSON.stringify(verse));

        // Add to history
        const history = JSON.parse(localStorage.getItem('verse_history') || '[]');
        history.unshift(verse);
        // Keep only last 30 verses
        localStorage.setItem('verse_history', JSON.stringify(history.slice(0, 30)));

        // Send notification if enabled
        sendDailyNotification(verse);

        // Invalidate history query
        queryClient.invalidateQueries({ queryKey: ['verseHistory'] });

        return verse;
      } catch (error) {
        console.error('Error loading daily verse:', error);
        
        // Try to return cached verse if fetch fails
        const cached = localStorage.getItem('daily_verse');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            // Fall through to fallback
          }
        }
        
        // Return fallback verse as last resort
        return getFallbackVerse();
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Custom hook for verse history
export function useVerseHistory() {
  return useQuery<BibleVerse[]>({
    queryKey: ['verseHistory'],
    queryFn: async () => {
      const history = localStorage.getItem('verse_history');
      return history ? JSON.parse(history) : [];
    },
    staleTime: Infinity,
  });
}

// Custom hook for Bible search using local data with flexible keyword matching
export function useSearchVerse(query: string) {
  return useQuery<BibleApiResponse>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.trim() === '') {
        throw new Error('EMPTY_SEARCH');
      }

      // Check cache first
      const cacheKey = `search_${query}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // Continue to fetch if cache is invalid
        }
      }

      try {
        // Try to parse as verse reference first
        let result;
        try {
          result = await getVerseByReference(query);
        } catch (refError) {
          // If not a valid reference, try keyword search
          const errorMsg = (refError as Error).message;
          if (errorMsg === 'INVALID_FORMAT' || 
              errorMsg === 'BOOK_NOT_FOUND' || 
              errorMsg === 'CHAPTER_NOT_FOUND' || 
              errorMsg === 'VERSE_NOT_FOUND') {
            // Try keyword/phrase search
            result = await searchVerses(query);
          } else {
            throw refError;
          }
        }

        // Cache the search result
        localStorage.setItem(cacheKey, JSON.stringify(result));

        return result;
      } catch (error) {
        console.error('Error searching verse:', error);
        
        // Try to return cached result if fetch fails
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            // Fall through to throw error
          }
        }
        throw error;
      }
    },
    enabled: !!query && query.trim() !== '',
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
    retryDelay: 2000,
  });
}

// Custom hook for book content using local data
export function useBookContent(bookQuery: string) {
  return useQuery<BibleApiResponse>({
    queryKey: ['book', bookQuery],
    queryFn: async () => {
      if (!bookQuery || bookQuery.trim() === '') {
        throw new Error('EMPTY_SEARCH');
      }

      // Check cache first
      const cacheKey = `book_${bookQuery}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // Continue to fetch if cache is invalid
        }
      }

      try {
        const result = await getBookContent(bookQuery);

        // Cache the book content
        localStorage.setItem(cacheKey, JSON.stringify(result));

        return result;
      } catch (error) {
        console.error('Error fetching book content:', error);
        
        // Try to return cached result if fetch fails
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            // Fall through to throw error
          }
        }
        throw error;
      }
    },
    enabled: !!bookQuery && bookQuery.trim() !== '',
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 1,
    retryDelay: 2000,
  });
}

// Send daily notification
function sendDailyNotification(verse: BibleVerse) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const enabled = localStorage.getItem('notifications_enabled') === 'true';
    if (enabled) {
      try {
        new Notification('Daily Bible Verse', {
          body: `${verse.text.substring(0, 100)}... - ${verse.reference}`,
          icon: '/assets/generated/bible-app-logo-transparent.dim_200x200.png',
          badge: '/assets/generated/bible-app-logo-transparent.dim_200x200.png',
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }
  }
}
