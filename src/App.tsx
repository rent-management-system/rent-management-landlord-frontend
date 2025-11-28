import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
// Temporarily disable useApiTest to prevent potential performance impact
// import { useApiTest } from "./utils/apiTest";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Lazy load components
const Landlord = lazy(() => import('./pages/Landlord'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const AuthCallbackWithLogs = lazy(() => import('./components/AuthCallbackRedirect'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Configure React Query with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

const App = () => {
  // Temporarily disabled for performance testing
  // useApiTest();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Landlord />} />
                <Route path="/landlord" element={<Landlord />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/properties/:id" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PropertyDetails />
                  </Suspense>
                } />
                <Route path="/auth/callback" element={<AuthCallbackWithLogs />} />
                <Route path="/payment/success" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PaymentSuccess />
                  </Suspense>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
