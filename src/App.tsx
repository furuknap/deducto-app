import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TemplateCredentialsWarning } from "@/components/TemplateCredentialsWarning";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { registerServiceWorker } from "./utils/serviceWorkerUtils";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { OfflineProvider } from "./context/OfflineContext";
import ServiceWorkerUpdateNotification from "./components/ServiceWorkerUpdateNotification";
import InstallPWA from "./components/InstallPWA";
import LoadingSpinner from "./components/LoadingSpinner";

// Configure query client with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages for better performance
// Add prefetch comments to help bundler optimize chunks
// @ts-expect-error - These comments are for the bundler
const Index = lazy(() => import(/* webpackPrefetch: true */ "./pages/Index"));
// @ts-expect-error - These comments are for the bundler
const Dashboard = lazy(
  () => import(/* webpackPrefetch: true */ "./pages/Dashboard")
);
// @ts-expect-error - These comments are for the bundler
const Categories = lazy(
  () => import(/* webpackPrefetch: true */ "./pages/Categories")
);
const NotFound = lazy(() => import("./pages/NotFound"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));

// Custom loading component for route transitions
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner size="large" message="Loading page..." />
  </div>
);

const App = () => {
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const registerSW = async () => {
      const registration = await registerServiceWorker();
      setSwRegistration(registration);
    };

    registerSW();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <OfflineProvider>
            <TooltipProvider>
              <ServiceWorkerUpdateNotification registration={swRegistration} />
              <InstallPWA />
              <Toaster />
              <Sonner />
              <TemplateCredentialsWarning />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                    <Route
                      path="/update-password"
                      element={<UpdatePassword />}
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </OfflineProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
