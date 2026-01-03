import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Share2, BookOpen, Calendar, Sparkles, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { useDailyVerse, useVerseHistory } from '@/hooks/useQueries';
import BookmarkButton from '@/components/BookmarkButton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface HomePageProps {
  bibleDataReady: boolean;
}

export default function HomePage({ bibleDataReady }: HomePageProps) {
  const { data: dailyVerse, isLoading, refetch, isFetching, error } = useDailyVerse();
  const { data: history } = useVerseHistory();

  useEffect(() => {
    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleShare = async () => {
    if (!dailyVerse) return;

    const shareText = `"${dailyVerse.text}"\n\n— ${dailyVerse.reference}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Bible Verse',
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

  const handleRefresh = () => {
    refetch();
    toast.info('Loading new verse...');
  };

  // Parse reference to extract book, chapter, verse for bookmark
  const parseReference = (ref: string) => {
    const match = ref.match(/^([\w\s]+?)\s+(\d+):(\d+)$/);
    if (match) {
      return {
        bookName: match[1].trim(),
        chapter: parseInt(match[2], 10),
        verse: parseInt(match[3], 10),
      };
    }
    return null;
  };

  const dailyVerseParsed = dailyVerse ? parseReference(dailyVerse.reference) : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Offline Ready Status */}
      <div className="mb-4 flex items-center justify-center gap-2 text-sm">
        {bibleDataReady ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-medium text-green-600 dark:text-green-400">
              Complete KJV Bible Ready - All 66 books, 31,102 verses available offline
            </span>
          </>
        ) : (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-muted-foreground">Loading complete Bible data...</span>
          </>
        )}
      </div>

      {/* Verse of the Day Section */}
      <Card className="mb-8 overflow-hidden border-2 shadow-lg">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Sparkles className="h-6 w-6 text-primary" />
                Verse of the Day
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isFetching}
                className="h-9 w-9"
                title="Refresh verse"
              >
                <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {dailyVerse && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(dailyVerse.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </CardHeader>
        </div>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Unable to load verse. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : dailyVerse ? (
            <>
              <div className="mb-6 rounded-lg bg-accent/30 p-6">
                <blockquote className="border-l-4 border-primary pl-6 text-lg leading-relaxed text-foreground">
                  <span className="text-primary/40">"</span>
                  <span className="italic">{dailyVerse.text}</span>
                  <span className="text-primary/40">"</span>
                </blockquote>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <p className="text-lg font-semibold text-primary">{dailyVerse.reference}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase text-primary">
                    {dailyVerse.version}
                  </span>
                </div>
                <div className="flex gap-2">
                  {dailyVerseParsed && (
                    <BookmarkButton
                      bookName={dailyVerseParsed.bookName}
                      chapter={dailyVerseParsed.chapter}
                      verse={dailyVerseParsed.verse}
                      text={dailyVerse.text}
                      reference={dailyVerse.reference}
                      variant="outline"
                      showLabel
                    />
                  )}
                  <Button onClick={handleShare} variant="default" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Bible Data Info Card */}
      {bibleDataReady && (
        <Card className="mb-8 border-2 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Complete Bible Available Offline</h3>
                <p className="text-sm text-muted-foreground">
                  All 66 books, 1,189 chapters, and 31,102 verses from the King James Version are now cached locally for instant access without internet connection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verse History Section */}
      {history && history.length > 0 && (
        <Card className="border-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              Previous Verses
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your recently viewed daily verses
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((verse, index) => {
                const parsed = parseReference(verse.reference);
                return (
                  <div
                    key={index}
                    className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-accent/5 hover:shadow-sm"
                  >
                    <p className="mb-3 text-sm italic leading-relaxed text-muted-foreground">
                      "{verse.text.substring(0, 120)}
                      {verse.text.length > 120 ? '...' : ''}"
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-primary">{verse.reference}</p>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase text-primary/80">
                          {verse.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(verse.date), { addSuffix: true })}
                        </p>
                        {parsed && (
                          <BookmarkButton
                            bookName={parsed.bookName}
                            chapter={parsed.chapter}
                            verse={parsed.verse}
                            text={verse.text}
                            reference={verse.reference}
                            variant="ghost"
                            size="icon"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
