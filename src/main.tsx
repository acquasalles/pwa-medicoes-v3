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

// Ensure splash screen is removed
const ensureSplashRemoval = () => {
  // Force remove splash screen after maximum time if something goes wrong
  setTimeout(() => {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      console.log('Force removing splash screen after timeout');
      removeSplashScreen();
    }
  }, 5000); // Force remove after 5 seconds max
};

// Start the force removal timer
ensureSplashRemoval();

// Mount React app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

