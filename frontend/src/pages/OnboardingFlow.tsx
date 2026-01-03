import React, { useState } from 'react';
//import { Button } from '../ui/Button';
import { Button } from '../components/ui/button';


interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const SLIDES = [
  { title: 'Welcome', description: 'Start your journey with the complete offline Bible.' },
  { title: 'Search', description: 'Quickly search any verse or chapter.' },
  { title: 'Favorites', description: 'Save verses for easy access anytime.' },
];

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{SLIDES[current].title}</h1>
      <p className="mb-8 text-center">{SLIDES[current].description}</p>
      <div className="flex gap-4">
        <Button onClick={handleNext}>{current === SLIDES.length - 1 ? 'Finish' : 'Next'}</Button>
        <Button onClick={onSkip} className="bg-gray-400 text-white hover:bg-gray-500">Skip</Button>
      </div>
    </div>
  );
}
