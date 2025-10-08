import React, { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { dismissUpdate } from '../lib/version';

interface UpdatePromptProps {
  version?: string;
  releaseNotes?: string | null;
  forceUpdate?: boolean;
}

export const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  version,
  releaseNotes,
  forceUpdate = false
}) => {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isUpdateAvailable || dismissed) return null;

  const handleDismiss = () => {
    if (!forceUpdate && version) {
      dismissUpdate(version);
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideUp">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Nova versão disponível
                  {version && <span className="ml-2 text-blue-600">v{version}</span>}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {forceUpdate
                    ? 'Atualização recomendada para melhor experiência'
                    : 'Atualize para ter acesso às últimas funcionalidades'
                  }
                </p>
              </div>

              {!forceUpdate && (
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Dispensar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {releaseNotes && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 mt-2 transition-colors"
              >
                <span>O que há de novo</span>
                {showDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {showDetails && releaseNotes && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="bg-gray-50 rounded p-3 text-xs text-gray-700 max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{releaseNotes}</pre>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={updateServiceWorker}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
          >
            Atualizar Agora
          </button>

          {!forceUpdate && (
            <button
              onClick={handleDismiss}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Depois
            </button>
          )}
        </div>
      </div>
    </div>
  );
};