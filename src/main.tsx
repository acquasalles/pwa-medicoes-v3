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

// Ensure splash screen is shown for minimum time
const timeElapsed = Date.now() - startTime;
const remainingTime = Math.max(0, minDisplayTime - timeElapsed);

setTimeout(() => {
  // Additional delay to ensure React app is fully rendered
  requestAnimationFrame(() => {
    setTimeout(removeSplashScreen, 100);
  });
}, remainingTime);

// Ensure splash screen is shown for minimum time
const timeElapsed = Date.now() - startTime;
const remainingTime = Math.max(0, minDisplayTime - timeElapsed);

setTimeout(() => {
  // Additional delay to ensure React app is fully rendered
  requestAnimationFrame(() => {
    setTimeout(removeSplashScreen, 100);
  });
}, remainingTime);
