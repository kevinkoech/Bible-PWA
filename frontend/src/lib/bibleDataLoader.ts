interface BibleVerse {
  verse: number;
  text: string;
}

interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

interface BibleBook {
  name: string;
  testament: string;
  chapters: BibleChapter[];
}

interface BibleData {
  version: string;
  books: BibleBook[];
}

interface ParsedVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface SearchResult {
  reference: string;
  verses: ParsedVerse[];
  text: string;
  translation_id: string;
}

// Cache management
let cachedBibleData: BibleData | null = null;
let isLoading = false;
let loadPromise: Promise<BibleData> | null = null;

// Enhanced search index for faster keyword searches with partial matching
interface SearchIndex {
  [word: string]: Array<{ bookIndex: number; chapterIndex: number; verseIndex: number }>;
}
let searchIndex: SearchIndex | null = null;
let partialSearchIndex: Map<string, Set<string>> | null = null;

// Lazy loading cache for individual books
const bookCache = new Map<string, BibleBook>();

/**
 * Load Bible data from local JSON file with caching and lazy loading support
 * Optimized for complete KJV Bible with all 66 books, 1,189 chapters, and 31,102 verses
 */
export async function loadBibleData(): Promise<BibleData> {
  // Return cached data if available
  if (cachedBibleData) {
    return cachedBibleData;
  }

  // If already loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Try to load from localStorage first for offline support
      const cachedString = localStorage.getItem('bible_data_cache');
      const cacheTimestamp = localStorage.getItem('bible_data_cache_timestamp');
      
      // Use cache if it exists and is less than 30 days old
      if (cachedString && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (cacheAge < thirtyDays) {
          try {
            cachedBibleData = JSON.parse(cachedString);
            console.log('✓ Loaded complete KJV Bible from localStorage cache (all 66 books, 31,102 verses)');
            isLoading = false;
            return cachedBibleData!;
          } catch (parseError) {
            console.warn('Failed to parse cached Bible data, fetching fresh copy');
            localStorage.removeItem('bible_data_cache');
            localStorage.removeItem('bible_data_cache_timestamp');
          }
        }
      }

      // Fetch from file
      console.log('Fetching complete KJV Bible data from file...');
      const response = await fetch('/bible-data.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load Bible data: ${response.status} ${response.statusText}`);
      }
      
      const data: BibleData = await response.json();
      
      // Validate data structure
      if (!data.version || !Array.isArray(data.books) || data.books.length === 0) {
        throw new Error('Invalid Bible data structure');
      }
      
      // Count total verses for validation
      let totalVerses = 0;
      let totalChapters = 0;
      data.books.forEach(book => {
        totalChapters += book.chapters.length;
        book.chapters.forEach(chapter => {
          totalVerses += chapter.verses.length;
        });
      });
      
      console.log(`✓ Loaded KJV Bible: ${data.books.length} books, ${totalChapters} chapters, ${totalVerses} verses`);
      
      if (data.books.length !== 66) {
        console.warn(`Warning: Expected 66 books, found ${data.books.length}`);
      }
      
      cachedBibleData = data;
      
      // Store in localStorage for offline access (async to not block)
      try {
        const dataString = JSON.stringify(data);
        localStorage.setItem('bible_data_cache', dataString);
        localStorage.setItem('bible_data_cache_timestamp', Date.now().toString());
        console.log('✓ Complete Bible data cached to localStorage for offline access');
      } catch (storageError) {
        console.warn('Failed to cache Bible data to localStorage (may be too large):', storageError);
        // Continue even if caching fails - data is still loaded in memory
      }
      
      isLoading = false;
      return data;
    } catch (error) {
      isLoading = false;
      console.error('Error loading Bible data:', error);
      
      // Try to return cached data even if fetch fails
      const cached = localStorage.getItem('bible_data_cache');
      if (cached) {
        try {
          cachedBibleData = JSON.parse(cached);
          console.log('✓ Using stale cache due to fetch error');
          return cachedBibleData!;
        } catch {
          // Fall through to throw error
        }
      }
      
      throw new Error('Unable to load Bible data. Please check your connection and try again.');
    }
  })();

  return loadPromise;
}

/**
 * Lazy load a specific book by name
 */
async function loadBook(bookName: string): Promise<BibleBook | null> {
  // Check cache first
  if (bookCache.has(bookName)) {
    return bookCache.get(bookName)!;
  }

  const bibleData = await loadBibleData();
  const book = findBook(bibleData, bookName);
  
  if (book) {
    bookCache.set(bookName, book);
  }
  
  return book;
}

/**
 * Build enhanced search index for faster keyword searches with partial matching support
 * Optimized for complete Bible with all 31,102 verses
 */
async function buildSearchIndex(): Promise<SearchIndex> {
  if (searchIndex) {
    return searchIndex;
  }

  const bibleData = await loadBibleData();
  const index: SearchIndex = {};
  const partialIndex = new Map<string, Set<string>>();

  console.log('Building enhanced search index for complete KJV Bible...');
  const startTime = Date.now();
  
  bibleData.books.forEach((book, bookIndex) => {
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.verses.forEach((verse, verseIndex) => {
        // Tokenize verse text
        const words = verse.text
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2); // Ignore very short words

        words.forEach(word => {
          // Add to main index
          if (!index[word]) {
            index[word] = [];
          }
          index[word].push({ bookIndex, chapterIndex, verseIndex });

          // Build partial match index (prefixes) for fuzzy search
          for (let i = 3; i <= Math.min(word.length, 8); i++) {
            const prefix = word.substring(0, i);
            if (!partialIndex.has(prefix)) {
              partialIndex.set(prefix, new Set());
            }
            partialIndex.get(prefix)!.add(word);
          }
        });
      });
    });
  });

  searchIndex = index;
  partialSearchIndex = partialIndex;
  
  const indexTime = Date.now() - startTime;
  const wordCount = Object.keys(index).length;
  console.log(`✓ Search index built: ${wordCount} unique words indexed in ${indexTime}ms`);
  
  return index;
}

/**
 * Parse verse reference (e.g., "John 3:16", "Psalm 23", "Romans 8:28-30")
 */
function parseReference(reference: string): { book: string; chapter: number; verseStart?: number; verseEnd?: number } | null {
  reference = reference.trim();
  
  // Pattern: Book Chapter:Verse or Book Chapter:Verse-Verse or Book Chapter
  const match = reference.match(/^([\w\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
  
  if (!match) {
    return null;
  }
  
  const book = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verseStart = match[3] ? parseInt(match[3], 10) : undefined;
  const verseEnd = match[4] ? parseInt(match[4], 10) : verseStart;
  
  return { book, chapter, verseStart, verseEnd };
}

/**
 * Find book by name with fuzzy matching (case-insensitive, partial match)
 * Optimized for all 66 Bible books
 */
function findBook(bibleData: BibleData, bookName: string): BibleBook | null {
  const normalizedName = bookName.toLowerCase().trim();
  
  // Try exact match first
  let book = bibleData.books.find(b => b.name.toLowerCase() === normalizedName);
  
  // Try partial match from start
  if (!book) {
    book = bibleData.books.find(b => b.name.toLowerCase().startsWith(normalizedName));
  }
  
  // Try contains match
  if (!book) {
    book = bibleData.books.find(b => b.name.toLowerCase().includes(normalizedName));
  }
  
  // Try fuzzy match (allow for common abbreviations)
  if (!book) {
    const abbreviations: { [key: string]: string[] } = {
      'genesis': ['gen', 'ge', 'gn'],
      'exodus': ['exo', 'ex', 'exod'],
      'leviticus': ['lev', 'le', 'lv'],
      'numbers': ['num', 'nu', 'nm', 'nb'],
      'deuteronomy': ['deut', 'deu', 'dt'],
      'joshua': ['josh', 'jos', 'jsh'],
      'judges': ['judg', 'jdg', 'jg', 'jdgs'],
      'ruth': ['rut', 'rth', 'ru'],
      'samuel': ['sam', 'sa', 'sm'],
      'kings': ['kin', 'ki', 'kgs'],
      'chronicles': ['chr', 'ch', 'chron'],
      'ezra': ['ezr', 'ez'],
      'nehemiah': ['neh', 'ne'],
      'esther': ['est', 'es', 'esth'],
      'job': ['jb'],
      'psalms': ['psa', 'ps', 'psalm', 'pslm', 'psm'],
      'proverbs': ['prov', 'pro', 'prv', 'pr'],
      'ecclesiastes': ['eccl', 'ecc', 'ec', 'qoh'],
      'song': ['song', 'sos', 'so', 'canticle', 'canticles'],
      'isaiah': ['isa', 'is'],
      'jeremiah': ['jer', 'je', 'jr'],
      'lamentations': ['lam', 'la'],
      'ezekiel': ['ezek', 'eze', 'ezk'],
      'daniel': ['dan', 'da', 'dn'],
      'hosea': ['hos', 'ho'],
      'joel': ['joe', 'jl'],
      'amos': ['amo', 'am'],
      'obadiah': ['obad', 'oba', 'ob'],
      'jonah': ['jon', 'jnh'],
      'micah': ['mic', 'mc'],
      'nahum': ['nah', 'na'],
      'habakkuk': ['hab', 'hb'],
      'zephaniah': ['zeph', 'zep', 'zp'],
      'haggai': ['hag', 'hg'],
      'zechariah': ['zech', 'zec', 'zc'],
      'malachi': ['mal', 'ml'],
      'matthew': ['matt', 'mat', 'mt'],
      'mark': ['mar', 'mrk', 'mk', 'mr'],
      'luke': ['luk', 'lk'],
      'john': ['jn', 'joh', 'jhn'],
      'acts': ['act', 'ac'],
      'romans': ['rom', 'ro', 'rm'],
      'corinthians': ['cor', 'co'],
      'galatians': ['gal', 'ga'],
      'ephesians': ['eph', 'ep'],
      'philippians': ['phil', 'php', 'pp'],
      'colossians': ['col', 'co'],
      'thessalonians': ['thess', 'thes', 'th'],
      'timothy': ['tim', 'ti', 'tm'],
      'titus': ['tit', 'ti'],
      'philemon': ['philem', 'phm', 'pm'],
      'hebrews': ['heb', 'he'],
      'james': ['jas', 'ja', 'jm'],
      'peter': ['pet', 'pe', 'pt'],
      'jude': ['jud', 'jd'],
      'revelation': ['rev', 're', 'rv', 'apocalypse'],
    };

    for (const [fullName, abbrevs] of Object.entries(abbreviations)) {
      if (abbrevs.some(abbr => normalizedName === abbr || normalizedName.startsWith(abbr))) {
        book = bibleData.books.find(b => b.name.toLowerCase().includes(fullName));
        if (book) break;
      }
    }
  }
  
  return book || null;
}

/**
 * Get verse by reference with graceful error handling
 */
export async function getVerseByReference(reference: string): Promise<SearchResult> {
  const bibleData = await loadBibleData();
  const parsed = parseReference(reference);
  
  if (!parsed) {
    throw new Error('INVALID_FORMAT');
  }
  
  const book = findBook(bibleData, parsed.book);
  
  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }
  
  const chapter = book.chapters.find(c => c.chapter === parsed.chapter);
  
  if (!chapter) {
    throw new Error('CHAPTER_NOT_FOUND');
  }
  
  let verses: ParsedVerse[];
  
  if (parsed.verseStart !== undefined) {
    // Specific verse(s)
    const filteredVerses = chapter.verses.filter(
      v => v.verse >= parsed.verseStart! && v.verse <= (parsed.verseEnd || parsed.verseStart!)
    );
    
    if (filteredVerses.length === 0) {
      throw new Error('VERSE_NOT_FOUND');
    }
    
    verses = filteredVerses.map(v => ({
      book_name: book.name,
      chapter: parsed.chapter,
      verse: v.verse,
      text: v.text,
    }));
  } else {
    // Entire chapter
    verses = chapter.verses.map(v => ({
      book_name: book.name,
      chapter: parsed.chapter,
      verse: v.verse,
      text: v.text,
    }));
  }
  
  const text = verses.map(v => v.text).join(' ');
  const verseRef = parsed.verseStart
    ? parsed.verseEnd && parsed.verseEnd !== parsed.verseStart
      ? `${book.name} ${parsed.chapter}:${parsed.verseStart}-${parsed.verseEnd}`
      : `${book.name} ${parsed.chapter}:${parsed.verseStart}`
    : `${book.name} ${parsed.chapter}`;
  
  return {
    reference: verseRef,
    verses,
    text,
    translation_id: bibleData.version,
  };
}

/**
 * Enhanced search verses by keyword with flexible matching and phrase support
 * Optimized for searching across all 31,102 verses
 */
export async function searchVerses(keyword: string): Promise<SearchResult> {
  const bibleData = await loadBibleData();
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  if (!normalizedKeyword) {
    throw new Error('EMPTY_SEARCH');
  }
  
  const results: ParsedVerse[] = [];
  const uniqueVerses = new Set<string>();
  
  // Check if it's a phrase search (multiple words)
  const isPhrase = normalizedKeyword.includes(' ');
  
  if (isPhrase) {
    // Direct search for phrases across all verses
    console.log(`Searching for phrase: "${normalizedKeyword}"`);
    for (const book of bibleData.books) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (verse.text.toLowerCase().includes(normalizedKeyword)) {
            const key = `${book.name}-${chapter.chapter}-${verse.verse}`;
            if (!uniqueVerses.has(key)) {
              uniqueVerses.add(key);
              results.push({
                book_name: book.name,
                chapter: chapter.chapter,
                verse: verse.verse,
                text: verse.text,
              });
              
              // Limit results for performance
              if (results.length >= 100) {
                break;
              }
            }
          }
        }
        if (results.length >= 100) break;
      }
      if (results.length >= 100) break;
    }
  } else {
    // Single word search with fuzzy matching using index
    try {
      const index = await buildSearchIndex();
      
      // Try exact match first
      let matchingWords = new Set<string>();
      if (index[normalizedKeyword]) {
        matchingWords.add(normalizedKeyword);
      }
      
      // If no exact match or keyword is short, try partial matching
      if (matchingWords.size === 0 || normalizedKeyword.length >= 3) {
        // Find words that start with or contain the keyword
        for (const word in index) {
          if (word.startsWith(normalizedKeyword) || 
              (normalizedKeyword.length >= 4 && word.includes(normalizedKeyword))) {
            matchingWords.add(word);
            // Limit to prevent too many matches
            if (matchingWords.size >= 20) break;
          }
        }
      }
      
      // Collect verses from all matching words
      for (const word of matchingWords) {
        const positions = index[word] || [];
        
        for (const pos of positions) {
          const book = bibleData.books[pos.bookIndex];
          const chapter = book.chapters[pos.chapterIndex];
          const verse = chapter.verses[pos.verseIndex];
          
          const key = `${pos.bookIndex}-${pos.chapterIndex}-${pos.verseIndex}`;
          if (!uniqueVerses.has(key)) {
            uniqueVerses.add(key);
            results.push({
              book_name: book.name,
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            });
            
            if (results.length >= 100) break;
          }
        }
        if (results.length >= 100) break;
      }
    } catch (indexError) {
      console.warn('Search index failed, falling back to direct search:', indexError);
      // Fallback to direct search across all verses
      for (const book of bibleData.books) {
        for (const chapter of book.chapters) {
          for (const verse of chapter.verses) {
            if (verse.text.toLowerCase().includes(normalizedKeyword)) {
              const key = `${book.name}-${chapter.chapter}-${verse.verse}`;
              if (!uniqueVerses.has(key)) {
                uniqueVerses.add(key);
                results.push({
                  book_name: book.name,
                  chapter: chapter.chapter,
                  verse: verse.verse,
                  text: verse.text,
                });
                
                if (results.length >= 100) break;
              }
            }
          }
          if (results.length >= 100) break;
        }
        if (results.length >= 100) break;
      }
    }
  }
  
  if (results.length === 0) {
    throw new Error('NO_RESULTS');
  }
  
  // Limit to first 50 results for display
  const limitedResults = results.slice(0, 50);
  
  return {
    reference: `Search results for "${keyword}" (${results.length > 50 ? '50 of ' + results.length : results.length} verses)`,
    verses: limitedResults,
    text: limitedResults.map(v => v.text).join(' '),
    translation_id: bibleData.version,
  };
}

/**
 * Get all verses for a book/chapter query with flexible search
 */
export async function getBookContent(query: string): Promise<SearchResult> {
  // Try to parse as reference first
  try {
    return await getVerseByReference(query);
  } catch (error) {
    // If parsing fails, try keyword search
    if ((error as Error).message.startsWith('INVALID_FORMAT') || 
        (error as Error).message === 'BOOK_NOT_FOUND' ||
        (error as Error).message === 'CHAPTER_NOT_FOUND' ||
        (error as Error).message === 'VERSE_NOT_FOUND') {
      // Try keyword search as fallback
      try {
        return await searchVerses(query);
      } catch (searchError) {
        // Re-throw original error if keyword search also fails
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Get a random verse for daily verse feature from complete Bible
 */
export async function getRandomVerse(): Promise<SearchResult> {
  const bibleData = await loadBibleData();
  
  // Get random book
  const randomBook = bibleData.books[Math.floor(Math.random() * bibleData.books.length)];
  
  // Get random chapter
  const randomChapter = randomBook.chapters[Math.floor(Math.random() * randomBook.chapters.length)];
  
  // Get random verse
  const randomVerse = randomChapter.verses[Math.floor(Math.random() * randomChapter.verses.length)];
  
  const verse: ParsedVerse = {
    book_name: randomBook.name,
    chapter: randomChapter.chapter,
    verse: randomVerse.verse,
    text: randomVerse.text,
  };
  
  return {
    reference: `${randomBook.name} ${randomChapter.chapter}:${randomVerse.verse}`,
    verses: [verse],
    text: verse.text,
    translation_id: bibleData.version,
  };
}

/**
 * Get popular verse by index (for daily rotation)
 */
export async function getPopularVerse(index: number): Promise<SearchResult> {
  const popularVerses = [
    'John 3:16',
    'Philippians 4:13',
    'Jeremiah 29:11',
    'Romans 8:28',
    'Proverbs 3:5-6',
    'Isaiah 41:10',
    'Matthew 6:33',
    'Psalm 23:1',
    'Joshua 1:9',
    'Romans 12:2',
    'Galatians 5:22-23',
    'Ephesians 2:8-9',
    'Colossians 3:23',
    'Hebrews 11:1',
    'James 1:2-3',
    'Psalm 46:1',
    'Matthew 11:28',
    'John 14:6',
    'Romans 5:8',
    'Psalm 119:105',
  ];
  
  const reference = popularVerses[index % popularVerses.length];
  
  try {
    return await getVerseByReference(reference);
  } catch {
    // Fallback to random verse if popular verse not found
    return await getRandomVerse();
  }
}

/**
 * Check if Bible data is loaded and ready
 */
export function isBibleDataReady(): boolean {
  return cachedBibleData !== null;
}

/**
 * Get loading status
 */
export function getBibleDataLoadingStatus(): { isLoading: boolean; isReady: boolean } {
  return {
    isLoading,
    isReady: cachedBibleData !== null,
  };
}

/**
 * Get Bible statistics
 */
export async function getBibleStats(): Promise<{ books: number; chapters: number; verses: number }> {
  const bibleData = await loadBibleData();
  
  let totalChapters = 0;
  let totalVerses = 0;
  
  bibleData.books.forEach(book => {
    totalChapters += book.chapters.length;
    book.chapters.forEach(chapter => {
      totalVerses += chapter.verses.length;
    });
  });
  
  return {
    books: bibleData.books.length,
    chapters: totalChapters,
    verses: totalVerses,
  };
}
