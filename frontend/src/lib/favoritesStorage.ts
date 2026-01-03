/**
 * Favorites storage utility using IndexedDB for offline-first favorites management
 */

interface FavoriteVerse {
  id: string; // Unique ID: "book-chapter-verse"
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string; // e.g., "John 3:16"
  dateAdded: string;
}

const DB_NAME = 'BibleAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create favorites store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        objectStore.createIndex('bookName', 'bookName', { unique: false });
      }
    };
  });
}

/**
 * Add a verse to favorites
 */
export async function addFavorite(verse: Omit<FavoriteVerse, 'id' | 'dateAdded'>): Promise<void> {
  try {
    const db = await initDB();
    const id = `${verse.bookName}-${verse.chapter}-${verse.verse}`;
    
    const favorite: FavoriteVerse = {
      ...verse,
      id,
      dateAdded: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(favorite);

      request.onsuccess = () => {
        // Also backup to localStorage
        backupToLocalStorage();
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to add favorite:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    // Fallback to localStorage
    addFavoriteToLocalStorage(verse);
  }
}

/**
 * Remove a verse from favorites
 */
export async function removeFavorite(id: string): Promise<void> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        // Also update localStorage backup
        backupToLocalStorage();
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove favorite:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    // Fallback to localStorage
    removeFavoriteFromLocalStorage(id);
  }
}

/**
 * Get all favorites
 */
export async function getAllFavorites(): Promise<FavoriteVerse[]> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const favorites = request.result as FavoriteVerse[];
        // Sort by date added (newest first)
        favorites.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        resolve(favorites);
      };

      request.onerror = () => {
        console.error('Failed to get favorites:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    // Fallback to localStorage
    return getFavoritesFromLocalStorage();
  }
}

/**
 * Check if a verse is favorited
 */
export async function isFavorite(bookName: string, chapter: number, verse: number): Promise<boolean> {
  try {
    const db = await initDB();
    const id = `${bookName}-${chapter}-${verse}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        console.error('Failed to check favorite:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    // Fallback to localStorage
    return isFavoriteInLocalStorage(bookName, chapter, verse);
  }
}

/**
 * Get favorites grouped by book
 */
export async function getFavoritesByBook(): Promise<Map<string, FavoriteVerse[]>> {
  const favorites = await getAllFavorites();
  const grouped = new Map<string, FavoriteVerse[]>();

  favorites.forEach(fav => {
    if (!grouped.has(fav.bookName)) {
      grouped.set(fav.bookName, []);
    }
    grouped.get(fav.bookName)!.push(fav);
  });

  // Sort verses within each book by chapter and verse
  grouped.forEach(verses => {
    verses.sort((a, b) => {
      if (a.chapter !== b.chapter) {
        return a.chapter - b.chapter;
      }
      return a.verse - b.verse;
    });
  });

  return grouped;
}

// LocalStorage fallback functions
function backupToLocalStorage() {
  getAllFavorites().then(favorites => {
    localStorage.setItem('favorites_backup', JSON.stringify(favorites));
  }).catch(console.error);
}

function addFavoriteToLocalStorage(verse: Omit<FavoriteVerse, 'id' | 'dateAdded'>) {
  const favorites = getFavoritesFromLocalStorage();
  const id = `${verse.bookName}-${verse.chapter}-${verse.verse}`;
  
  const favorite: FavoriteVerse = {
    ...verse,
    id,
    dateAdded: new Date().toISOString(),
  };

  favorites.push(favorite);
  localStorage.setItem('favorites_backup', JSON.stringify(favorites));
}

function removeFavoriteFromLocalStorage(id: string) {
  const favorites = getFavoritesFromLocalStorage();
  const filtered = favorites.filter(f => f.id !== id);
  localStorage.setItem('favorites_backup', JSON.stringify(filtered));
}

function getFavoritesFromLocalStorage(): FavoriteVerse[] {
  try {
    const stored = localStorage.getItem('favorites_backup');
    if (stored) {
      const favorites = JSON.parse(stored) as FavoriteVerse[];
      favorites.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      return favorites;
    }
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
  }
  return [];
}

function isFavoriteInLocalStorage(bookName: string, chapter: number, verse: number): boolean {
  const favorites = getFavoritesFromLocalStorage();
  const id = `${bookName}-${chapter}-${verse}`;
  return favorites.some(f => f.id === id);
}
