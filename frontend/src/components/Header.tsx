import React from 'react';
//import { Button } from '../ui/Button';
import { Button } from '../components/ui/button';

interface HeaderProps {
  currentPage: 'home' | 'search' | 'books' | 'favorites' | 'settings';
  onNavigate: (page: 'home' | 'search' | 'books' | 'favorites' | 'settings') => void;
  bibleDataReady: boolean;
}

export default function Header({ currentPage, onNavigate, bibleDataReady }: HeaderProps) {
  return (
    <header className="bg-blue-600 dark:bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">📖 Bible PWA</h1>
        <nav className="flex gap-2">
          {['home','search','books','favorites','settings'].map((page) => (
            <Button
              key={page}
              onClick={() => onNavigate(page as any)}
              className={`px-3 py-1 rounded ${
                currentPage === page ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </Button>
          ))}
        </nav>
      </div>
      {!bibleDataReady && (
        <div className="bg-blue-400 dark:bg-gray-700 text-white text-center py-1 text-sm">
          Loading Bible data...
        </div>
      )}
    </header>
  );
}
