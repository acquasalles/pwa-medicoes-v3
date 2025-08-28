import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('🔍 PWA: Checking install capabilities...');
    
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('📱 PWA: Install prompt available');
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA: App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    // Check if app is already installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      return isStandalone || isInWebAppiOS || isInWebAppChrome;
    };
    
    if (checkInstallStatus()) {
      console.log('✅ PWA: Already running as installed app');
      setIsInstalled(true);
    } else {
      console.log('🌐 PWA: Running in browser mode');
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Debug: Log current state
    console.log('📊 PWA Install Status:', {
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      minimal: window.matchMedia('(display-mode: minimal-ui)').matches,
      iOS: (window.navigator as any).standalone === true,
      userAgent: navigator.userAgent.slice(0, 80),
      installed: checkInstallStatus()
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('🚀 PWA: Install button clicked');
    if (!installPrompt) return;
    
    try {
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
      
      console.log('📝 PWA: Install prompt result:', outcome);
      
      if (outcome === 'accepted') {
        console.log('✅ PWA: User accepted installation');
        setIsInstallable(false);
        setInstallPrompt(null);
      } else {
        console.log('❌ PWA: User dismissed installation');
      }
    } catch (error) {
      console.error('❌ PWA: Install error:', error);
    }
  };

  return {
    isInstallable,
    isInstalled,
    handleInstallClick
  };
};