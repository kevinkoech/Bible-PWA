import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useIsFavorite, useAddFavorite, useRemoveFavorite } from '@/hooks/useFavorites';

interface BookmarkButtonProps {
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export default function BookmarkButton({
  bookName,
  chapter,
  verse,
  text,
  reference,
  variant = 'ghost',
  size = 'sm',
  showLabel = false,
}: BookmarkButtonProps) {
  const { data: isFavorited, isLoading } = useIsFavorite(bookName, chapter, verse);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorited) {
      const id = `${bookName}-${chapter}-${verse}`;
      removeFavorite.mutate(id);
    } else {
      addFavorite.mutate({
        bookName,
        chapter,
        verse,
        text,
        reference,
      });
    }
  };

  const isProcessing = addFavorite.isPending || removeFavorite.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading || isProcessing}
      className="gap-2"
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? (
        <BookmarkCheck className="h-4 w-4 fill-current text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {isFavorited ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
}
