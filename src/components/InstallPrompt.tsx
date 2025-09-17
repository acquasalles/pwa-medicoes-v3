import React from 'react';
import { X, Smartphone, Zap, Wifi, Download } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export const InstallPrompt: React.FC = () => {
  const {
    isInstallable,
    showManualInstructions,
    shouldShowPrompt,
    isFirstVisit,
    installApp,
    dismissPrompt,
  } = useInstallPrompt();

  console.log('🎨 InstallPrompt render:', { shouldShowPrompt, isInstallable, showManualInstructions, isFirstVisit });
  
  // Debug: Force show prompt for testing
  const forceShow = true; // Set to false after testing
  
  if (!shouldShowPrompt) {
    console.log('❌ InstallPrompt: Not rendering - shouldShowPrompt is false');
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  console.log('✅ InstallPrompt: Rendering prompt', { isIOS, isAndroid, isInstallable, showManualInstructions });
  
  // Debug: Log if component is actually being returned
  console.log('🎯 InstallPrompt: About to return JSX component');
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end install-prompt animate-slide-up"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.8)', // Red background for debugging
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
    >
      <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto animate-slide-up shadow-2xl">
        <div className="bg-yellow-200 p-2 mb-4 rounded">
          <strong>DEBUG: InstallPrompt is visible!</strong>
          <br />isInstallable: {isInstallable.toString()}
          <br />showManualInstructions: {showManualInstructions.toString()}
          <br />isFirstVisit: {isFirstVisit.toString()}
          <br />isIOS: {isIOS.toString()}
          <br />isAndroid: {isAndroid.toString()}
        </div>
        
        <button
          onClick={dismissPrompt}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="text-white" size={32} />
          </div>
          
          {isFirstVisit ? (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Bem-vindo! 👋
              </h3>
              <p className="text-gray-600 text-sm">
                Para uma melhor experiência, instale nosso app
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Instalar App
              </h3>
              <p className="text-gray-600 text-sm">
                Tenha acesso rápido e offline
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="text-green-600" size={16} />
            </div>
            <span>Acesso instantâneo sem abrir navegador</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Wifi className="text-blue-600" size={16} />
            </div>
            <span>Funciona offline e salva dados localmente</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Download className="text-purple-600" size={16} />
            </div>
            <span>Não ocupa espaço - apenas um atalho inteligente</span>
          </div>
        </div>

        {isInstallable ? (
          <div className="space-y-3">
            <button
              onClick={installApp}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Instalar Agora
            </button>
            <button
              onClick={dismissPrompt}
              className="w-full text-gray-500 font-medium py-2 hover:text-gray-700 transition-colors"
            >
              Agora não
            </button>
          </div>
        ) : showManualInstructions ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              {isIOS ? (
                <div>
                  <p className="font-medium text-gray-800 mb-2">Para instalar no iOS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Toque no ícone de compartilhar (□↗) no Safari</li>
                    <li>Role para baixo e toque em "Adicionar à Tela Inicial"</li>
                    <li>Toque em "Adicionar" no canto superior direito</li>
                  </ol>
                </div>
              ) : isAndroid ? (
                <div>
                  <p className="font-medium text-gray-800 mb-2">Para instalar no Android:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Toque no menu (⋮) do navegador</li>
                    <li>Toque em "Adicionar à tela inicial" ou "Instalar app"</li>
                    <li>Confirme tocando em "Adicionar" ou "Instalar"</li>
                  </ol>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-800 mb-2">Para instalar:</p>
                  <p className="text-gray-600">
                    Use o menu do seu navegador e procure por "Adicionar à tela inicial" ou "Instalar app"
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={dismissPrompt}
              className="w-full text-gray-500 font-medium py-2 hover:text-gray-700 transition-colors"
            >
              Entendi, obrigado
            </button>
          </div>
        ) : (
          <button
            onClick={dismissPrompt}
            className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
};