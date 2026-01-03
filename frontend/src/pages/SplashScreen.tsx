import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/splash-background.dim_800x600.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Logo with Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse-slow">
            <div className="h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          </div>
          <img
            src="/assets/generated/bible-app-logo-transparent.dim_200x200.png"
            alt="Bible App Logo"
            className="relative h-32 w-32 animate-float"
          />
        </div>

        {/* App Name */}
        <h1 className="mb-4 text-4xl font-bold text-foreground">Daily Word</h1>
        <p className="text-lg text-muted-foreground">Your Daily Bible Companion</p>

        {/* Loading Animation */}
        <div className="mt-12 flex space-x-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
