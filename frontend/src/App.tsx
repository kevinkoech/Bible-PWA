import { useEffect, useState } from 'react';
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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'books' | 'favorites' | 'settings'>('home');
  const [bibleDataReady, setBibleDataReady] = useState(false);

  useEffect(() => {
    // Check URL parameters for page navigation
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page && ['home', 'search', 'books', 'favorites', 'settings'].includes(page)) {
      setCurrentPage(page as typeof currentPage);
    }

    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');

    // Load Bible data
    const loadData = async () => {
      try {
        console.log('🔄 Loading complete KJV Bible data...');
        await loadBibleData();
        const status = getBibleDataLoadingStatus();
        if (status.isReady) {
          const stats = await getBibleStats();
          console.log(`✓ Bible loaded: ${stats.books} books, ${stats.chapters} chapters, ${stats.verses} verses`);
          setBibleDataReady(true);
        }
      } catch (error) {
        console.error('✗ Failed to load Bible data:', error);
      }
    };

    loadData();

    // Splash screen timeout
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

  if (isLoading) return <SplashScreen />;
  if (showOnboarding) return <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} />;

  return (
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
    </div>
  );
}

export default App;
