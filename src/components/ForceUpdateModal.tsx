import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { performUpdate } from '../utils/updateManager';

interface ForceUpdateModalProps {
  version: string;
  releaseNotes?: string | null;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({ version, releaseNotes }) => {
  const [updating, setUpdating] = useState(false);
  const [updateStep, setUpdateStep] = useState<string>('');

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await performUpdate((step) => {
        setUpdateStep(step);
      });
    } catch (error) {
      console.error('Error during update:', error);
      setUpdating(false);
      alert('Erro ao atualizar. Por favor, feche e abra o aplicativo novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Atualização Necessária
          </h2>

          <p className="text-gray-600">
            Uma nova versão crítica do aplicativo está disponível
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Nova versão:</span>
            <span className="text-lg font-bold text-blue-600">v{version}</span>
          </div>
        </div>

        {releaseNotes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              O que há de novo:
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{releaseNotes}</pre>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {updating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Atualizando...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Atualizar Agora</span>
              </>
            )}
          </button>

          {updating && updateStep && (
            <div className="text-center text-sm text-gray-600 animate-pulse">
              {updateStep}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Esta atualização é obrigatória para continuar usando o aplicativo.
            Seus dados serão preservados durante a atualização.
          </p>
        </div>
      </div>
    </div>
  );
};
