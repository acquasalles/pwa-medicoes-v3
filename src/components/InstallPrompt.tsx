import React from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, handleInstallClick } = useInstallPrompt();
  const [dismissed, setDismissed] = React.useState(false);
  const [showManualInstructions, setShowManualInstructions] = React.useState(false);

  // Show manual instructions if PWA is installable but no prompt event
  React.useEffect(() => {
    const checkIfPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isPWA = (window.navigator as any).standalone === true;
      
      // Only show manual instructions if not in PWA mode and on mobile
      if (!isStandalone && !isMinimalUI && !isPWA && (isIOS || isAndroid) && !dismissed) {
        setShowManualInstructions(true);
      } else {
        setShowManualInstructions(false);
      }
    };
    
    checkIfPWA();
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(checkIfPWA);
    
    return () => {
      mediaQuery.removeListener(checkIfPWA);
    };
  }, [dismissed]);

  // Don't show anything if dismissed or if running as PWA
  const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                        window.matchMedia('(display-mode: minimal-ui)').matches ||
                        (window.navigator as any).standalone === true;
                        
  if (dismissed || isRunningAsPWA) return null;
  
  // If we have the install prompt, show the automatic version
  if (isInstallable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Instalar App
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Instale o Sistema de Medições para acesso rápido e funcionalidade offline
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-primary hover:bg-primary-light text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors"
          >
            Depois
          </button>
        </div>
      </div>
    );
  }
  
  // Show manual instructions for mobile browsers
  if (showManualInstructions) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Instalar como App
            </p>
            <div className="text-sm text-gray-600 mt-1">
              {isIOS && (
                <div>
                  <p className="mb-1">Para instalar no iOS:</p>
                  <p>1. Toque no ícone <strong>Compartilhar</strong> (□↑)</p>
                  <p>2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></p>
                </div>
              )}
              {isAndroid && (
                <div>
                  <p className="mb-1">Para instalar no Android:</p>
                  <p>1. Toque no menu do navegador (⋮)</p>
                  <p>2. Selecione <strong>"Adicionar à tela inicial"</strong></p>
                </div>
              )}
              {!isIOS && !isAndroid && (
                <p>Use o menu do seu navegador para adicionar à tela inicial</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setDismissed(true)}
            className="flex-1 bg-primary hover:bg-primary-light text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    );
  }

  return null;
};