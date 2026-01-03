import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bookmark, Share2, Trash2, BookOpen, Heart, CheckCircle2 } from 'lucide-react';
import { useFavoritesByBook, useRemoveFavorite } from '@/hooks/useFavorites';
import { toast } from 'sonner';

interface FavoritesPageProps {
  bibleDataReady: boolean;
}

export default function FavoritesPage({ bibleDataReady }: FavoritesPageProps) {
  const { data: favoritesByBook, isLoading, error } = useFavoritesByBook();
  const removeFavorite = useRemoveFavorite();

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

  const handleRemove = (id: string) => {
    removeFavorite.mutate(id);
  };

  const totalFavorites = favoritesByBook
    ? Array.from(favoritesByBook.values()).reduce((sum, verses) => sum + verses.length, 0)
    : 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Offline Ready Status */}
      <div className="mb-4 flex items-center justify-center gap-2 text-sm">
        {bibleDataReady ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-medium text-green-600 dark:text-green-400">
              All favorites available offline
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
            <Bookmark className="h-6 w-6 text-primary" />
            My Favorites
          </CardTitle>
          <CardDescription>
            {totalFavorites > 0
              ? `${totalFavorites} saved verse${totalFavorites !== 1 ? 's' : ''} organized by book`
              : 'Save your favorite verses for quick access'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load favorites. Please try again.
              </AlertDescription>
            </Alert>
          ) : !favoritesByBook || favoritesByBook.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No Favorites Yet</h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                Start building your collection of favorite verses. Tap the bookmark icon next to any verse to save it here.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Find verses to save:</p>
                <ul className="space-y-1">
                  <li>• Browse the daily verse on the Home page</li>
                  <li>• Search for specific verses or keywords</li>
                  <li>• Read through books and chapters</li>
                  <li>• All favorites work completely offline</li>
                </ul>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {Array.from(favoritesByBook.entries()).map(([bookName, verses]) => (
                  <div key={bookName} className="space-y-3">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-primary">{bookName}</h3>
                      <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {verses.length} verse{verses.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {verses.map((verse) => (
                        <Card
                          key={verse.id}
                          className="group transition-all hover:border-primary/50 hover:shadow-sm"
                        >
                          <CardContent className="p-4">
                            <div className="mb-3">
                              <p className="mb-2 text-sm font-semibold text-primary">
                                {verse.reference}
                              </p>
                              <blockquote className="border-l-4 border-primary pl-4 text-sm italic leading-relaxed text-muted-foreground">
                                "{verse.text}"
                              </blockquote>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                Saved {new Date(verse.dateAdded).toLocaleDateString()}
                              </p>
                              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  onClick={() => handleShare(verse.reference, verse.text)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Share2 className="mr-1 h-3 w-3" />
                                  Share
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="mr-1 h-3 w-3" />
                                      Remove
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove "{verse.reference}" from your favorites? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRemove(verse.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
