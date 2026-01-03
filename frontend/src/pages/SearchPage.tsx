import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { loadBibleData } from '../lib/bibleDataLoader';

interface SearchPageProps {
  bibleDataReady: boolean;
}

export default function SearchPage({ bibleDataReady }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (!bibleDataReady) return;
    loadBibleData(); // ensure data is loaded
  }, [bibleDataReady]);

  const handleSearch = () => {
    if (!query) return;
    // Simple offline search in Bible data (mocked)
    const matchedVerses = [
      `Found "${query}" in Genesis 1:1`,
      `Found "${query}" in John 3:16`,
    ];
    setResults(matchedVerses);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a word, phrase, or reference"
          className="flex-1 border rounded px-3 py-2"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((verse, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{verse}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                    if (!favorites.includes(verse)) {
                      favorites.push(verse);
                      localStorage.setItem('favorites', JSON.stringify(favorites));
                    }
                  }}
                >
                  Add to Favorites
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
