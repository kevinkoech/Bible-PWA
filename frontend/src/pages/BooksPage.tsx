import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
//import { Button } from '../ui/Button';
import { Button } from '../components/ui/button';

interface BooksPageProps {
  bibleDataReady: boolean;
}

const BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy',
  'Joshua','Judges','Ruth','1 Samuel','2 Samuel',
  '1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs',
  'Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations',
  'Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk',
  'Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts',
  'Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy',
  '2 Timothy','Titus','Philemon','Hebrews','James',
  '1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

export default function BooksPage({ bibleDataReady }: BooksPageProps) {
  if (!bibleDataReady) {
    return <p className="p-4">Loading books...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bible Books</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {BOOKS.map((book) => (
          <Card key={book}>
            <CardHeader>
              <CardTitle>{book}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
