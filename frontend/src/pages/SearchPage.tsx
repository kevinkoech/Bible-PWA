import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Share2, BookOpen, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { useSearchVerse } from '@/hooks/useQueries';
import BookmarkButton from '@/components/BookmarkButton';
import { toast } from 'sonner';

interface SearchPageProps {
  bibleDataReady: boolean;
}

export default function SearchPage({ bibleDataReady }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { data: searchResults, isLoading, error } = useSearchVerse(submittedQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
    }
  };

  const handleShare = async (reference: string, text: string) => {
    const shareText = `"${text}"\n\n— ${reference}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bible Verse',
          text: shareText,
        });
        toast.success('Verse shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyToClipboard(shareText);
        }
      }
    } else {
      handleCopyToClipboard(shareText);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Verse copied to clipboard!');
  };

  // Get user-friendly error message
  const getErrorMessage = () => {
    if (!error) return null;
    
    const errorMessage = (error as Error).message;
    
    if (errorMessage === 'NO_RESULTS') {
      return `No results found for your search "${submittedQuery}".`;
    } else if (errorMessage === 'BOOK_NOT_FOUND') {
      return `Book not found. Please check the spelling and try again.`;
    } else if (errorMessage === 'CHAPTER_NOT_FOUND') {
      return `Chapter not found. The book may not have that many chapters.`;
    } else if (errorMessage === 'VERSE_NOT_FOUND') {
      return `Verse not found. The chapter may not have that many verses.`;
    } else if (errorMessage === 'INVALID_FORMAT') {
      return `Invalid search format. Try "John 3:16" or search for keywords like "faith".`;
    } else if (errorMessage === 'EMPTY_SEARCH') {
      return 'Please enter a search term.';
    }
    
    return 'Unable to search. Please try again.';
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Offline Ready Status */}
      <div className="mb-4 flex items-center justify-center gap-2 text-sm">
        {bibleDataReady ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-medium text-green-600 dark:text-green-400">
              Searching 31,102 verses locally - Works completely offline
            </span>
          </>
        ) : (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-muted-foreground">Loading Bible data...</span>
          </>
        )}
      </div>

      <Card className="mb-8 border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Search className="h-6 w-6 text-primary" />
            Search Complete KJV Bible
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search across all 66 books, 1,189 chapters, and 31,102 verses - supports flexible matching
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder='Try "John 3:16", "Psalm 23", "faith", or "love your neighbor"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!searchQuery.trim() || !bibleDataReady}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Examples:</span>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setSearchQuery('John 3:16');
                  setSubmittedQuery('John 3:16');
                }}
              >
                John 3:16
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setSearchQuery('faith');
                  setSubmittedQuery('faith');
                }}
              >
                faith
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setSearchQuery('love');
                  setSubmittedQuery('love');
                }}
              >
                love
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setSearchQuery('Psalm 23');
                  setSubmittedQuery('Psalm 23');
                }}
              >
                Psalm 23
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setSearchQuery('grace');
                  setSubmittedQuery('grace');
                }}
              >
                grace
              </Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Performance Info */}
      {bibleDataReady && !submittedQuery && (
        <Card className="mb-8 border-2 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Optimized Search Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Our indexed search engine can quickly find verses across all 31,102 verses with support for partial matching, fuzzy search, and phrase queries - all working offline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
              <h3 className="mb-2 text-lg font-semibold">No Results Found</h3>
              <p className="mb-4 text-muted-foreground">{getErrorMessage()}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium">Try these search tips:</p>
                <ul className="space-y-1 text-left">
                  <li>• For specific verses: "John 3:16" or "Psalm 23"</li>
                  <li>• For keywords: "faith", "love", "hope"</li>
                  <li>• For phrases: "love your neighbor"</li>
                  <li>• Partial book names work: "John" finds all John books</li>
                  <li>• Search works across all 31,102 verses</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {searchResults.reference}
            </CardTitle>
            {searchResults.verses.length > 1 && (
              <p className="text-sm text-muted-foreground">
                Showing {searchResults.verses.length} verse{searchResults.verses.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {searchResults.verses.map((verse, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent/5"
                >
                  <blockquote className="mb-4 border-l-4 border-primary pl-4 text-base italic leading-relaxed">
                    "{verse.text}"
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-primary">
                      {verse.book_name} {verse.chapter}:{verse.verse}
                    </p>
                    <div className="flex gap-2">
                      <BookmarkButton
                        bookName={verse.book_name}
                        chapter={verse.chapter}
                        verse={verse.verse}
                        text={verse.text}
                        reference={`${verse.book_name} ${verse.chapter}:${verse.verse}`}
                        variant="outline"
                      />
                      <Button
                        onClick={() =>
                          handleShare(
                            `${verse.book_name} ${verse.chapter}:${verse.verse}`,
                            verse.text
                          )
                        }
                        variant="outline"
                        size="sm"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!submittedQuery && !isLoading && !bibleDataReady && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">Flexible Bible Search</h3>
              <p className="mb-4 text-muted-foreground">
                Search by verse reference, keywords, or phrases across the complete KJV Bible
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="mb-2 font-medium text-foreground">Search by Reference:</p>
                  <ul className="space-y-1">
                    <li>• "John 3:16" - Specific verse</li>
                    <li>• "Psalm 23" - Entire chapter</li>
                    <li>• "Romans 8:28-30" - Verse range</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-medium text-foreground">Search by Keywords:</p>
                  <ul className="space-y-1">
                    <li>• "faith" - Find all verses with "faith"</li>
                    <li>• "love" - Partial matches included</li>
                    <li>• "love your neighbor" - Phrase search</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-medium text-foreground">Flexible Matching:</p>
                  <ul className="space-y-1">
                    <li>• Partial book names: "John" finds all John books</li>
                    <li>• Case-insensitive search</li>
                    <li>• Searches all 31,102 verses</li>
                    <li>• Works completely offline</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
