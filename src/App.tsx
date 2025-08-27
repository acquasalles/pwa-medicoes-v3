import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { SelectionPage } from './pages/SelectionPage';
import { MedicoesPage } from './pages/MedicoesPage';
import { UpdatePrompt } from './components/UpdatePrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import { useAuth } from './contexts/AuthContext';

// Protected Routes Component
const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" aria-label="Loading"></div>
          <p className="text-primary mb-2">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AppRoutes />;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route
          path="/selecao"
          element={<SelectionPage />}
        />
        <Route
          path="/medicoes"
          element={<MedicoesPage />}
        />
        <Route path="/" element={<Navigate to="/selecao" replace />} />
      </Routes>
      
      {/* PWA Components */}
      <UpdatePrompt />
      <OfflineIndicator />
      <InstallPrompt />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ProtectedRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;