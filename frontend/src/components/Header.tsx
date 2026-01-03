import { Button } from '@/components/ui/button';
import { Home, Search, BookOpen, Bookmark, Settings, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'search' | 'books' | 'favorites' | 'settings';
  onNavigate: (page: 'home' | 'search' | 'books' | 'favorites' | 'settings') => void;
  bibleDataReady: boolean;
}

export default function Header({ currentPage, onNavigate, bibleDataReady }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/bible-app-logo-transparent.dim_200x200.png" 
            alt="Bible App Logo" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold text-primary">Bible App</h1>
            {bibleDataReady && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Offline Ready</span>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex items-center gap-2">
          <Button
            variant={currentPage === 'home' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('home')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            variant={currentPage === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('search')}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button
            variant={currentPage === 'books' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('books')}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Books</span>
          </Button>
          <Button
            variant={currentPage === 'favorites' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('favorites')}
            className="gap-2"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Favorites</span>
          </Button>
          <Button
            variant={currentPage === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('settings')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
