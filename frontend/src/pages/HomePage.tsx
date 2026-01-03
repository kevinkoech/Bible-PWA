import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
//import { Button } from '../ui/Button';
import { Button } from '../components/ui/button';
import { loadBibleData, getBibleStats } from '../lib/bibleDataLoader';

interface HomePageProps {
  bibleDataReady: boolean;
}

export default function HomePage({ bibleDataReady }: HomePageProps) {
  const [dailyVerse, setDailyVerse] = useState<string>('');

  useEffect(() => {
    if (!bibleDataReady) return;

    // Load daily verse from localStorage or randomly pick
    const savedVerse = localStorage.getItem('daily_verse');
    if (savedVerse) {
      setDailyVerse(savedVerse);
    } else {
      const loadRandomVerse = async () => {
        const stats = await getBibleStats();
        const book = stats.books > 0 ? stats.books[0] : 'Genesis';
        const verse = `Random verse from ${book}`;
        setDailyVerse(verse);
        localStorage.setItem('daily_verse', verse);
      };
      loadRandomVerse();
    }
  }, [bibleDataReady]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Home</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📖 Verse of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyVerse ? (
            <p className="text-lg">{dailyVerse}</p>
          ) : (
            <p>Loading daily verse...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button>Search Verse</Button>
          <Button>Open Books</Button>
          <Button>Favorites</Button>
          <Button>Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
