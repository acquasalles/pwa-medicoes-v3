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
  const [hasSeenPrompt, setHasSeenPrompt] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    console.log('🔍 PWA: Checking install capabilities...');
    
    // Check if user has seen the install prompt before
    const checkFirstVisit = () => {
      const hasSeenInstallPrompt = localStorage.getItem('pwa_install_prompt_seen');
      const firstVisitKey = 'pwa_first_visit_checked';
      const hasCheckedFirstVisit = localStorage.getItem(firstVisitKey);
      
      if (!hasCheckedFirstVisit) {
        // Mark that we've checked for first visit
        localStorage.setItem(firstVisitKey, 'true');
        setIsFirstVisit(true);
        console.log('🎉 PWA: First visit detected');
      }
      
      if (hasSeenInstallPrompt === 'true') {
        setHasSeenPrompt(true);
        console.log('ℹ️ PWA: User has already seen install prompt');
      } else {
        console.log('✨ PWA: User has not seen install prompt yet');
      }
    };

    checkFirstVisit();

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
      // Mark prompt as seen since app is now installed
      localStorage.setItem('pwa_install_prompt_seen', 'true');
      setHasSeenPrompt(true);
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
      // Mark prompt as seen since app is already installed
      localStorage.setItem('pwa_install_prompt_seen', 'true');
      setHasSeenPrompt(true);
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
      
      // Mark prompt as seen regardless of outcome
      localStorage.setItem('pwa_install_prompt_seen', 'true');
      setHasSeenPrompt(true);
    } catch (error) {
      console.error('❌ PWA: Install error:', error);
    }
  };

  const dismissPrompt = () => {
    console.log('👋 PWA: User dismissed install prompt');
    localStorage.setItem('pwa_install_prompt_seen', 'true');
    setHasSeenPrompt(true);
  };

  const shouldShowPrompt = () => {
    // Don't show if user has already seen the prompt
    if (hasSeenPrompt) return false;
    
    // Don't show if app is already installed
    if (isInstalled) return false;
    
    // Check if we're on mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Show on first visit for mobile users, or if installable prompt is available
    return isMobile && (isFirstVisit || isInstallable);
  };
  return {
    isInstallable,
    isInstalled,
    hasSeenPrompt,
    isFirstVisit,
    shouldShowPrompt: shouldShowPrompt(),
    handleInstallClick,
    dismissPrompt
  };
};