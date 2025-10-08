import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw, AlertCircle, X, LogOut, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBackButton = false,
  onBack
}) => {
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();
  const {
    hasPendingData,
    syncing,
    isOnline,
    syncPendingData,
    pendingMedicoes,
    lastSyncError,
    clearSyncError
  } = useOfflineSync();

  const handleSync = () => {
    if (isOnline && hasPendingData && !syncing) {
      syncPendingData();
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src="https://wanrdteafvqtcivcrtfy.supabase.co/storage/v1/object/public/medicao-photos/47397699000139/43771bee-b847-4f78-bd05-797f6ab19b6e_300ad69c-268b-4a5f-befc-fbaee3a110cc_0/logo%20(1).png"
                  alt="Logo"
                  className="h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-md text-gray-400 hover:text-primary hover:bg-accent/20 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-secondary" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                
              </div>

              {/* Sync Status */}
              {hasPendingData && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-primary-light" />
                  <span className="text-sm text-primary">
                    {pendingMedicoes.length} pendente(s)
                  </span>
                  {isOnline && (
                    <button
                      onClick={handleSync}
                      disabled={syncing}
                      className="p-1 rounded text-primary hover:bg-accent/20 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Admin Button */}
              {isAdmin() && (
                <button
                  onClick={() => navigate('/admin/user-action-logs')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-primary hover:bg-accent/20 transition-colors"
                  title="Logs de Ações"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Admin</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sair do sistema"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {lastSyncError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Erro de Sincronização
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {lastSyncError}
                </p>
              </div>
            </div>
            <button
              onClick={clearSyncError}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};