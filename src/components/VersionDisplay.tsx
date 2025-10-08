import React, { useState } from 'react';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getInstalledVersion } from '../lib/version';
import { formatBytes, getAppCacheSize } from '../utils/updateManager';

interface VersionDisplayProps {
  currentVersion: string;
  updateAvailable?: boolean;
  latestVersion?: string;
  onVersionClick?: () => void;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  currentVersion,
  updateAvailable = false,
  latestVersion,
  onVersionClick,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>('calculando...');

  const installedInfo = getInstalledVersion();

  const handleClick = async () => {
    setShowDetails(!showDetails);
    onVersionClick?.();

    if (!showDetails) {
      const size = await getAppCacheSize();
      setCacheSize(formatBytes(size));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={handleClick}
        className="w-full text-center group hover:bg-gray-50 rounded-lg p-3 transition-colors"
      >
        <div className="flex items-center justify-center space-x-2">
          {updateAvailable ? (
            <AlertCircle className="w-4 h-4 text-orange-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}

          <span className="text-sm text-gray-600 group-hover:text-gray-900">
            Versão {currentVersion}
          </span>

          {updateAvailable && latestVersion && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
              v{latestVersion} disponível
            </span>
          )}

          <Info className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </button>

      {showDetails && (
        <div className="mt-3 bg-gray-50 rounded-lg p-4 space-y-3 text-sm animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Versão instalada:</span>
            <span className="font-semibold text-gray-900">v{currentVersion}</span>
          </div>

          {installedInfo && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Instalada em:</span>
              <span className="font-mono text-xs text-gray-700">
                {formatDate(installedInfo.installDate)}
              </span>
            </div>
          )}

          {installedInfo?.lastCheck && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Última verificação:</span>
              <span className="font-mono text-xs text-gray-700">
                {formatDate(installedInfo.lastCheck)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cache do app:</span>
            <span className="font-mono text-xs text-gray-700">{cacheSize}</span>
          </div>

          {updateAvailable && latestVersion && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">
                  Nova versão {latestVersion} disponível para download
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Sistema de Medições PWA
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
