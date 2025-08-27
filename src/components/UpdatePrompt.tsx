import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useServiceWorker } from '../hooks/useServiceWorker';

export const UpdatePrompt: React.FC = () => {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <RefreshCw className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            Nova versão disponível
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Atualize para ter acesso às últimas funcionalidades
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={updateServiceWorker}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          Atualizar
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors"
        >
          Depois
        </button>
      </div>
    </div>
  );
};