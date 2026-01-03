import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
//import { Button } from '../ui/Button';
import { Button } from '../components/ui/button';

export default function FavoritesPage({ bibleDataReady }: { bibleDataReady: boolean }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const handleRemove = (verse: string) => {
    const updated = favorites.filter(f => f !== verse);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  if (!bibleDataReady) {
    return <p className="p-4">Loading favorites...</p>;
  }

  if (favorites.length === 0) {
    return <p className="p-4">No favorite verses yet.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Favorites</h1>
      <div className="space-y-4">
        {favorites.map((verse) => (
          <Card key={verse}>
            <CardHeader>
              <CardTitle>{verse}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleRemove(verse)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
