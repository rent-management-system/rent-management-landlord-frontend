import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import TokenInitializer from '@/components/TokenInitializer';
import LoginRedirect from '@/pages/LoginRedirect';
import AuthCallbackRedirect from '@/components/AuthCallbackRedirect';
import Landlord from '@/pages/Landlord';
import { Toaster } from 'sonner'; // Assuming this is the correct Toaster for sonner
import DebugAuth from '@/components/DebugAuth';
import { TooltipProvider } from "@/components/ui/tooltip"; // Keep TooltipProvider if it's used elsewhere

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login redirect page which will handle the auth flow
    return <Navigate to="/auth-redirect" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You need to be an {requiredRole.toLowerCase()} to access this page.</p>
          <p className="text-muted-foreground mt-2">
            Current role: {user?.role.toLowerCase()}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <>
      <TokenInitializer />
      <Router>
        <Routes>
          {/* Auth redirect handler - this is where users land after login */}
          <Route path="/auth-redirect" element={<LoginRedirect />} />
          
          {/* NEW: Add the callback route that User Management sends users to */}
          <Route path="/auth/callback" element={<AuthCallbackRedirect />} />
          
          {/* Login redirect for error cases */}
          <Route path="/login" element={<LoginRedirect />} />
          
          {/* Main landlord dashboard - protected route */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requiredRole="OWNER">
                <Landlord />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect to main page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
      
      {/* Temporary debug component - remove in production */}
      {process.env.NODE_ENV === 'development' && <DebugAuth />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;