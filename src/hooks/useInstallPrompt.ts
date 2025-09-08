import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  showManualInstructions: boolean;
  shouldShowPrompt: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  hasSeenPrompt: boolean;
  isFirstVisit: boolean;
  beforeInstallPromptFired: boolean;
}

export const useInstallPrompt = () => {
  // Device detection
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);

  // Check if already installed
  const checkIfInstalled = useCallback(() => {
    const isStandalone = window.navigator.standalone === true;
    const isInWebAppiOS = window.matchMedia('(display-mode: standalone)').matches && isIOS;
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
    const installed = isStandalone || isInWebAppiOS || isInWebAppChrome;
    
    console.log('📱 PWA Installation Check:', {
      isStandalone,
      isInWebAppiOS,
      isInWebAppChrome,
      installed
    });
    
    return installed;
  }, [isIOS]);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => checkIfInstalled());
  const [beforeInstallPromptFired, setBeforeInstallPromptFired] = useState(false);

  // Prompt visibility logic
  const hasSeenPrompt = localStorage.getItem('pwa-prompt-seen') === 'true';
  const isFirstVisit = !localStorage.getItem('pwa-first-visit');
  
  useEffect(() => {
    if (isFirstVisit) {
      localStorage.setItem('pwa-first-visit', 'true');
    }
  }, [isFirstVisit]);

  const showManualInstructions = isMobile && !isInstalled && !isInstallable;
  const shouldShowPrompt = !hasSeenPrompt && !isInstalled && (isInstallable || showManualInstructions);

  // Log debug information
  console.log('📋 PWA: Manual instructions available for mobile device');
  console.log('🔍 PWA shouldShowPrompt debug:', {
    hasSeenPrompt,
    isInstalled,
    isFirstVisit,
    isInstallable,
    showManualInstructions,
    beforeInstallPromptFired
  });
  console.log('📱 PWA: Mobile detection:', {
    isMobile,
    userAgent: userAgent.substring(0, 50) + '...'
  });
  console.log('🎯 PWA: Final decision:', {
    shouldShow: shouldShowPrompt,
    isFirstVisit,
    isInstallable,
    showManualInstructions
  });

  useEffect(() => {
    // Check PWA criteria
    const checkPWACriteria = () => {
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
      
      console.log('🔧 PWA Criteria Check:', {
        isHTTPS,
        hasServiceWorker,
        hasManifest,
        url: window.location.href
      });
    };

    checkPWACriteria();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🚀 PWA: beforeinstallprompt event fired!');
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsInstallable(true);
      setBeforeInstallPromptFired(true);
      
      console.log('📋 PWA: Install prompt available', {
        platforms: event.platforms,
        userChoice: 'available'
      });
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA: App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Wait for beforeinstallprompt with extended timeout
    let timeoutId: NodeJS.Timeout;
    
    const waitForInstallPrompt = () => {
      timeoutId = setTimeout(() => {
        if (!beforeInstallPromptFired) {
          console.log('⏰ PWA: beforeinstallprompt timeout - event not fired after 5 seconds');
          console.log('🔍 PWA: Checking install criteria...');
          
          // Manual installability check
          const hasRequiredManifestFields = true; // We know our manifest is complete
          const hasServiceWorker = 'serviceWorker' in navigator;
          const isSecureContext = window.isSecureContext;
          
          console.log('📋 PWA Install Criteria:', {
            hasRequiredManifestFields,
            hasServiceWorker,
            isSecureContext,
            beforeInstallPromptFired,
            reason: beforeInstallPromptFired ? 'Event fired' : 'Waiting for criteria or browser decision'
          });
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Start waiting for the install prompt
    waitForInstallPrompt();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [beforeInstallPromptFired]);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('❌ PWA: No deferred prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`🎯 PWA: User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('✅ PWA: User accepted the install prompt');
      } else {
        console.log('❌ PWA: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('❌ PWA: Error during installation:', error);
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem('pwa-prompt-seen', 'true');
    console.log('📋 PWA: Prompt dismissed by user');
  }, []);

  const state: InstallPromptState = {
    isInstallable,
    isInstalled,
    showManualInstructions,
    shouldShowPrompt,
    isIOS,
    isAndroid,
    isMobile,
    hasSeenPrompt,
    isFirstVisit,
    beforeInstallPromptFired
  };

  console.log('🎨 InstallPrompt render:', {
    shouldShowPrompt,
    isInstallable,
    showManualInstructions,
    isFirstVisit
  });
  console.log('✅ InstallPrompt: Rendering prompt', {
    isIOS,
    isAndroid,
    isInstallable,
    showManualInstructions
  });

  return {
    ...state,
    installApp,
    dismissPrompt
  };
};