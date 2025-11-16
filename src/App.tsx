import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landlord from "./pages/Landlord";
import NotFound from "./pages/NotFound";
import AuthCallbackWithLogs from "./components/AuthCallbackRedirect";
import { useApiTest } from "./utils/apiTest"; // Import useApiTest
import PropertyDetails from "./pages/PropertyDetails";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  useApiTest(); // Call the hook here

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landlord />} />
              <Route path="/landlord" element={<Landlord />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/auth/callback" element={<AuthCallbackWithLogs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
