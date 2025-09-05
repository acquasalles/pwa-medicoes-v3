import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove splash screen after app loads
const removeSplashScreen = () => {
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    // Add fade out animation
    splashScreen.classList.add('splash-fade-out');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      splashScreen.remove();
    }, 500);
  }
};

// Remove splash screen after a minimum display time and when app is ready
const minDisplayTime = 1500; // 1.5 seconds minimum display
const startTime = Date.now();


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register Service Worker manually
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'classic'
      })
      .then((registration) => {
        console.log('✅ PWA: Service Worker registered successfully:', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 PWA: Service Worker update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('📱 PWA: New Service Worker installed, update available');
                // Trigger update prompt if needed
                window.dispatchEvent(new Event('sw-update-available'));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ PWA: Service Worker registration failed:', error);
      });
    } catch (error) {
      console.error('❌ PWA: Service Worker not supported in this environment:', error);
    }
  });
}

// Ensure splash screen is shown for minimum time
const timeElapsed = Date.now() - startTime;
const remainingTime = Math.max(0, minDisplayTime - timeElapsed);

setTimeout(() => {
  // Additional delay to ensure React app is fully rendered
  requestAnimationFrame(() => {
    setTimeout(removeSplashScreen, 100);
  });
}, remainingTime);



