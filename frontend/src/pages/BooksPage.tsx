import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, ChevronLeft, Share2, AlertCircle, BookMarked, CheckCircle2, Database } from 'lucide-react';
import { useBookContent } from '@/hooks/useQueries';
import BookmarkButton from '@/components/BookmarkButton';
import { toast } from 'sonner';

// Bible books organized by testament - Complete 66 books
const OLD_TESTAMENT = [
  { name: 'Genesis', chapters: 50, abbr: 'Gen', description: 'The beginning of creation' },
  { name: 'Exodus', chapters: 40, abbr: 'Exo', description: 'Israel\'s deliverance from Egypt' },
  { name: 'Leviticus', chapters: 27, abbr: 'Lev', description: 'Laws and worship' },
  { name: 'Numbers', chapters: 36, abbr: 'Num', description: 'Wilderness wanderings' },
  { name: 'Deuteronomy', chapters: 34, abbr: 'Deu', description: 'Moses\' final words' },
  { name: 'Joshua', chapters: 24, abbr: 'Jos', description: 'Conquest of Canaan' },
  { name: 'Judges', chapters: 21, abbr: 'Jdg', description: 'Israel\'s judges' },
  { name: 'Ruth', chapters: 4, abbr: 'Rut', description: 'A story of loyalty' },
  { name: '1 Samuel', chapters: 31, abbr: '1Sa', description: 'Samuel and Saul' },
  { name: '2 Samuel', chapters: 24, abbr: '2Sa', description: 'King David\'s reign' },
  { name: '1 Kings', chapters: 22, abbr: '1Ki', description: 'Solomon and divided kingdom' },
  { name: '2 Kings', chapters: 25, abbr: '2Ki', description: 'Fall of Israel and Judah' },
  { name: '1 Chronicles', chapters: 29, abbr: '1Ch', description: 'David\'s genealogy' },
  { name: '2 Chronicles', chapters: 36, abbr: '2Ch', description: 'Judah\'s history' },
  { name: 'Ezra', chapters: 10, abbr: 'Ezr', description: 'Return from exile' },
  { name: 'Nehemiah', chapters: 13, abbr: 'Neh', description: 'Rebuilding Jerusalem' },
  { name: 'Esther', chapters: 10, abbr: 'Est', description: 'God\'s providence' },
  { name: 'Job', chapters: 42, abbr: 'Job', description: 'Suffering and faith' },
  { name: 'Psalms', chapters: 150, abbr: 'Psa', description: 'Songs of worship' },
  { name: 'Proverbs', chapters: 31, abbr: 'Pro', description: 'Wisdom for living' },
  { name: 'Ecclesiastes', chapters: 12, abbr: 'Ecc', description: 'Life\'s meaning' },
  { name: 'Song of Solomon', chapters: 8, abbr: 'Sng', description: 'Love poetry' },
  { name: 'Isaiah', chapters: 66, abbr: 'Isa', description: 'Prophecy and hope' },
  { name: 'Jeremiah', chapters: 52, abbr: 'Jer', description: 'Warnings and promises' },
  { name: 'Lamentations', chapters: 5, abbr: 'Lam', description: 'Mourning Jerusalem' },
  { name: 'Ezekiel', chapters: 48, abbr: 'Eze', description: 'Visions and prophecy' },
  { name: 'Daniel', chapters: 12, abbr: 'Dan', description: 'Faith in exile' },
  { name: 'Hosea', chapters: 14, abbr: 'Hos', description: 'God\'s faithful love' },
  { name: 'Joel', chapters: 3, abbr: 'Joe', description: 'The day of the Lord' },
  { name: 'Amos', chapters: 9, abbr: 'Amo', description: 'Justice and righteousness' },
  { name: 'Obadiah', chapters: 1, abbr: 'Oba', description: 'Judgment on Edom' },
  { name: 'Jonah', chapters: 4, abbr: 'Jon', description: 'God\'s mercy' },
  { name: 'Micah', chapters: 7, abbr: 'Mic', description: 'Justice and mercy' },
  { name: 'Nahum', chapters: 3, abbr: 'Nah', description: 'Nineveh\'s fall' },
  { name: 'Habakkuk', chapters: 3, abbr: 'Hab', description: 'Faith amid doubt' },
  { name: 'Zephaniah', chapters: 3, abbr: 'Zep', description: 'The day of judgment' },
  { name: 'Haggai', chapters: 2, abbr: 'Hag', description: 'Rebuild the temple' },
  { name: 'Zechariah', chapters: 14, abbr: 'Zec', description: 'Visions of restoration' },
  { name: 'Malachi', chapters: 4, abbr: 'Mal', description: 'The Lord\'s messenger' },
];

const NEW_TESTAMENT = [
  { name: 'Matthew', chapters: 28, abbr: 'Mat', description: 'Jesus the Messiah' },
  { name: 'Mark', chapters: 16, abbr: 'Mar', description: 'Jesus the Servant' },
  { name: 'Luke', chapters: 24, abbr: 'Luk', description: 'Jesus the Savior' },
  { name: 'John', chapters: 21, abbr: 'Jhn', description: 'Jesus the Son of God' },
  { name: 'Acts', chapters: 28, abbr: 'Act', description: 'The early church' },
  { name: 'Romans', chapters: 16, abbr: 'Rom', description: 'Salvation by faith' },
  { name: '1 Corinthians', chapters: 16, abbr: '1Co', description: 'Church unity and love' },
  { name: '2 Corinthians', chapters: 13, abbr: '2Co', description: 'Paul\'s ministry' },
  { name: 'Galatians', chapters: 6, abbr: 'Gal', description: 'Freedom in Christ' },
  { name: 'Ephesians', chapters: 6, abbr: 'Eph', description: 'Unity in Christ' },
  { name: 'Philippians', chapters: 4, abbr: 'Php', description: 'Joy in Christ' },
  { name: 'Colossians', chapters: 4, abbr: 'Col', description: 'Christ\'s supremacy' },
  { name: '1 Thessalonians', chapters: 5, abbr: '1Th', description: 'Christ\'s return' },
  { name: '2 Thessalonians', chapters: 3, abbr: '2Th', description: 'Stand firm' },
  { name: '1 Timothy', chapters: 6, abbr: '1Ti', description: 'Church leadership' },
  { name: '2 Timothy', chapters: 4, abbr: '2Ti', description: 'Paul\'s final words' },
  { name: 'Titus', chapters: 3, abbr: 'Tit', description: 'Sound doctrine' },
  { name: 'Philemon', chapters: 1, abbr: 'Phm', description: 'Forgiveness' },
  { name: 'Hebrews', chapters: 13, abbr: 'Heb', description: 'Christ our High Priest' },
  { name: 'James', chapters: 5, abbr: 'Jas', description: 'Faith and works' },
  { name: '1 Peter', chapters: 5, abbr: '1Pe', description: 'Hope in suffering' },
  { name: '2 Peter', chapters: 3, abbr: '2Pe', description: 'Growing in grace' },
  { name: '1 John', chapters: 5, abbr: '1Jn', description: 'God is love' },
  { name: '2 John', chapters: 1, abbr: '2Jn', description: 'Walk in truth' },
  { name: '3 John', chapters: 1, abbr: '3Jn', description: 'Support for workers' },
  { name: 'Jude', chapters: 1, abbr: 'Jud', description: 'Contend for the faith' },
  { name: 'Revelation', chapters: 22, abbr: 'Rev', description: 'Christ\'s victory' },
];

interface Book {
  name: string;
  chapters: number;
  abbr: string;
  description: string;
}

interface BooksPageProps {
  bibleDataReady: boolean;
}

export default function BooksPage({ bibleDataReady }: BooksPageProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const bookQuery = selectedBook && selectedChapter
    ? `${selectedBook.name} ${selectedChapter}`
    : '';

  const { data: chapterContent, isLoading, error } = useBookContent(bookQuery);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  const handleBack = () => {
    if (selectedChapter) {
      setSelectedChapter(null);
    } else {
      setSelectedBook(null);
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

  // Book list view with rich cards
  if (!selectedBook) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Offline Ready Status */}
        <div className="mb-4 flex items-center justify-center gap-2 text-sm">
          {bibleDataReady ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-600 dark:text-green-400">
                All 66 books with 1,189 chapters available offline
              </span>
            </>
          ) : (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-muted-foreground">Loading Bible books...</span>
            </>
          )}
        </div>

        {/* Complete Bible Info */}
        {bibleDataReady && (
          <Card className="mb-6 border-2 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Complete King James Version Bible</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse all 66 books (39 Old Testament + 27 New Testament) with instant access to every chapter and verse - works completely offline.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <BookMarked className="h-6 w-6 text-primary" />
              Bible Books
            </CardTitle>
            <CardDescription>
              Browse through the Old and New Testament books
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="old" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="old" className="text-base">
                  Old Testament ({OLD_TESTAMENT.length})
                </TabsTrigger>
                <TabsTrigger value="new" className="text-base">
                  New Testament ({NEW_TESTAMENT.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="old" className="mt-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {OLD_TESTAMENT.map((book) => (
                      <Card
                        key={book.name}
                        className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
                        onClick={() => handleBookSelect(book)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {book.chapters} ch
                            </span>
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary">
                            {book.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {book.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="new" className="mt-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {NEW_TESTAMENT.map((book) => (
                      <Card
                        key={book.name}
                        className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
                        onClick={() => handleBookSelect(book)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {book.chapters} ch
                            </span>
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary">
                            {book.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {book.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chapter selection view
  if (!selectedChapter) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {selectedBook.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {selectedBook.description} • Select a chapter to read ({selectedBook.chapters} chapters available)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(
                  (chapter) => (
                    <Button
                      key={chapter}
                      variant="outline"
                      className="aspect-square text-base font-semibold transition-all hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleChapterSelect(chapter)}
                    >
                      {chapter}
                    </Button>
                  )
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chapter content view
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-primary" />
                {selectedBook.name} {selectedChapter}
              </CardTitle>
              <CardDescription className="mt-1">
                {selectedBook.description}
              </CardDescription>
            </div>
          </div>
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Unable to load chapter. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : chapterContent ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {chapterContent.verses.map((verse, index) => (
                  <div
                    key={index}
                    className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:bg-accent/5 hover:shadow-sm"
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {verse.verse}
                      </span>
                      <p className="flex-1 pt-1 leading-relaxed">{verse.text}</p>
                    </div>
                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <BookmarkButton
                        bookName={verse.book_name}
                        chapter={verse.chapter}
                        verse={verse.verse}
                        text={verse.text}
                        reference={`${verse.book_name} ${verse.chapter}:${verse.verse}`}
                        variant="ghost"
                        size="sm"
                      />
                      <Button
                        onClick={() =>
                          handleShare(
                            `${verse.book_name} ${verse.chapter}:${verse.verse}`,
                            verse.text
                          )
                        }
                        variant="ghost"
                        size="sm"
                      >
                        <Share2 className="mr-2 h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
