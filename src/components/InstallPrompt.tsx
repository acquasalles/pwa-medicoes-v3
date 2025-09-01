import React from 'react';
import { Download, X, Smartphone, Zap, WifiOff } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export const InstallPrompt: React.FC = () => {
  const { 
    isInstallable, 
    shouldShowPrompt, 
    handleInstallClick, 
    dismissPrompt,
    isFirstVisit 
  } = useInstallPrompt();

  // Don't render if conditions are not met
  if (!shouldShowPrompt) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  // Show automatic install prompt if available
  if (isInstallable) {
    return (
      <div className="fixed inset-x-4 bottom-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-50 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Instalar App</h3>
              <p className="text-xs text-gray-500">Acesso rápido e offline</p>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-3 h-3 text-green-600" />
            </div>
            <span>Acesso instantâneo sem abrir o navegador</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-3 h-3 text-blue-600" />
            </div>
            <span>Funciona offline e salva dados localmente</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-3 h-3 text-purple-600" />
            </div>
            <span>Não ocupa espaço, é apenas um atalho inteligente</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Instalar Agora
          </button>
          <button
            onClick={dismissPrompt}
            className="px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Depois
          </button>
        </div>
        
        {isFirstVisit && (
          <p className="text-xs text-center text-gray-500 mt-3">
            ✨ Primeira visita? Instale para a melhor experiência!
          </p>
        )}
      </div>
    );
  }
  
  // Show manual instructions for mobile browsers without install prompt
  return (
    <div className="fixed inset-x-4 bottom-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Instalar como App</h3>
            <p className="text-xs text-gray-500">Para uma experiência completa</p>
          </div>
        </div>
        <button
          onClick={dismissPrompt}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Instale o Sistema de Medições para acesso rápido e funcionalidade offline
            </p>
          </div>
          <button
            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
              <p>1. Toque no ícone <strong>Compartilhar</strong> (□↑) no Safari</p>
              <p>2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></p>
              <p>3. Confirme tocando em <strong>"Adicionar"</strong></p>
            </div>
          </div>
        )}
        {isAndroid && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900 mb-3">
              📱 Para instalar no Android:
          >
            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
              <p>1. Toque no menu do navegador (⋮)</p>
              <p>2. Selecione <strong>"Adicionar à tela inicial"</strong></p>
              <p>3. Confirme tocando em <strong>"Adicionar"</strong></p>
            </div>
            <X className="w-4 h-4" />
        )}
        {!isIOS && !isAndroid && (
          <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            <p>Use o menu do seu navegador para adicionar à tela inicial</p>
          </div>
        )}
      </div>
      <div className="mb-6">
      {/* Benefits */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Zap className="w-3 h-3 text-green-500" />
          <span>Acesso instantâneo</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <WifiOff className="w-3 h-3 text-blue-500" />
          <span>Funciona offline</span>
        </div>
      </div>
        {isIOS && (
      {/* Action Button */}
      <button
        onClick={dismissPrompt}
        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        Entendi
      </button>
      
      {isFirstVisit && (
        <p className="text-xs text-center text-gray-500 mt-3">
          ✨ Primeira visita? Instale para a melhor experiência!
        </p>
      )}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900 mb-3">
};