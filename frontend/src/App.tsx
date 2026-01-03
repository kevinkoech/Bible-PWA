import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import SplashScreen from './pages/SplashScreen';
import OnboardingFlow from './pages/OnboardingFlow';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BooksPage from './pages/BooksPage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import Header from './components/Header';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import { loadBibleData, getBibleDataLoadingStatus, getBibleStats } from './lib/bibleDataLoader';
import { toast } from 'sonner';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'books' | 'favorites' | 'settings'>('home');
  const [bibleDataReady, setBibleDataReady] = useState(false);

  useEffect(() => {
    // Check URL parameters for page navigation (for shortcuts)
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page && ['home', 'search', 'books', 'favorites', 'settings'].includes(page)) {
      setCurrentPage(page as typeof currentPage);
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    
    // Load complete KJV Bible data in background with progress tracking
    const loadData = async () => {
      try {
        console.log('🔄 Starting complete KJV Bible data preload (all 66 books, 31,102 verses)...');
        
        await loadBibleData();
        
        const status = getBibleDataLoadingStatus();
        if (status.isReady) {
          // Get and display Bible statistics
          const stats = await getBibleStats();
          console.log(`✓ Complete Bible loaded: ${stats.books} books, ${stats.chapters} chapters, ${stats.verses} verses`);
          
          setBibleDataReady(true);
          
          toast.success(`📖 Offline Bible Ready - ${stats.books} books, ${stats.verses.toLocaleString()} verses available`, {
            duration: 4000,
          });
        }
      } catch (error) {
        console.error('✗ Failed to preload Bible data:', error);
        toast.error('Failed to load Bible data. Some features may be limited.', {
          duration: 5000,
        });
      }
    };
    
    loadData();
    
    // Simulate splash screen loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} bibleDataReady={bibleDataReady} />
        <main className="flex-1">
          {currentPage === 'home' && <HomePage bibleDataReady={bibleDataReady} />}
          {currentPage === 'search' && <SearchPage bibleDataReady={bibleDataReady} />}
          {currentPage === 'books' && <BooksPage bibleDataReady={bibleDataReady} />}
          {currentPage === 'favorites' && <FavoritesPage bibleDataReady={bibleDataReady} />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
        <Footer />
        <InstallPrompt />
        <Toaster richColors closeButton />
      </div>
    </ThemeProvider>
  );
}

export default App;

