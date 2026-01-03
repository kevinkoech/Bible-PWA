import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const dismissed = localStorage.getItem('install_prompt_dismissed');
      const dismissedTime = localStorage.getItem('install_prompt_dismissed_time');
      if (dismissed && dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) return;
      }

      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('install_prompt_dismissed');
      localStorage.removeItem('install_prompt_dismissed_time');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowPrompt(false);
    } catch (err) {
      console.error(err);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install_prompt_dismissed', 'true');
    localStorage.setItem('install_prompt_dismissed_time', Date.now().toString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="border-2 shadow-lg rounded-lg bg-white p-4 animate-slide-in">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
          📱 Install Daily Word
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Install the app for quick access, offline reading, and a native experience
        </p>

        <ul className="text-sm text-gray-700 mb-4 space-y-1">
          <li>✅ Works completely offline</li>
          <li>✅ Fast access from home screen</li>
          <li>✅ No app store required</li>
        </ul>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={handleInstall}
        >
          Install App
        </button>
      </div>
    </div>
  );
}
