import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Search, Library, Wifi, Share2, Bookmark, ChevronRight } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slides = [
  {
    icon: BookOpen,
    title: 'Daily Bible Verses',
    description: 'Start each day with inspiration. Receive a new verse every day to guide and uplift your spirit.',
    color: 'text-primary',
  },
  {
    icon: Search,
    title: 'Search & Explore',
    description: 'Find any verse instantly. Search by book, chapter, verse, or keyword to discover passages that speak to you.',
    color: 'text-accent',
  },
  {
    icon: Library,
    title: 'Browse All Books',
    description: 'Navigate through the entire Bible. Access all books, chapters, and verses organized for easy reading.',
    color: 'text-secondary',
  },
  {
    icon: Bookmark,
    title: 'Save Your Favorites',
    description: 'Bookmark meaningful verses for quick access. Build your personal collection of favorite scriptures.',
    color: 'text-primary',
  },
  {
    icon: Wifi,
    title: 'Offline Reading',
    description: 'Access your saved verses anytime, anywhere. No internet connection required for previously loaded content.',
    color: 'text-accent',
  },
  {
    icon: Share2,
    title: 'Share & Inspire',
    description: 'Spread the word. Share meaningful verses with friends and family through your favorite apps.',
    color: 'text-secondary',
  },
];

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardContent className="p-8">
            {/* Icon Animation */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className={`absolute inset-0 animate-ping rounded-full ${slide.color} opacity-20`}>
                  <div className="h-24 w-24" />
                </div>
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10`}>
                  <Icon className={`h-12 w-12 ${slide.color} animate-float`} />
                </div>
              </div>
            </div>

            {/* Content */}
            <h2 className="mb-4 text-center text-2xl font-bold">{slide.title}</h2>
            <p className="mb-8 text-center text-muted-foreground">{slide.description}</p>

            {/* Progress Dots */}
            <div className="mb-8 flex justify-center space-x-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              {currentSlide < slides.length - 1 && (
                <Button variant="outline" onClick={onSkip} className="flex-1">
                  Skip
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {currentSlide < slides.length - 1 ? (
                  <>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
