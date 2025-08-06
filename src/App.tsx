import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { FavoritesProvider } from "@/context/FavoritesContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SuperAdminRoute } from "@/components/SuperAdminRoute";
import { MobileTabs } from "@/components/MobileTabs";
import { MobileMenu } from "@/components/MobileMenu";
import { HeaderWallet } from "@/components/HeaderWallet";
import { LocationPermissionDialog } from "@/components/LocationPermissionDialog";
import { useFirstLogin } from "@/hooks/useFirstLogin";
import { useAffiliateProcessor } from "@/hooks/useAffiliateProcessor";
import { OptimizedImage } from "@/components/OptimizedImage";
import { preloadCriticalImages } from "@/utils/imageOptimization";

// Lazy load components for better performance
const ObjectsPage = React.lazy(() => import("./pages/ObjectsPage"));
const ObjectDetailPage = React.lazy(() => import("./pages/ObjectDetailPage"));
const WalletPage = React.lazy(() => import("./pages/WalletPage"));
const MarketsPage = React.lazy(() => import("./pages/MarketsPage"));
const AccountSettings = React.lazy(() => import("./pages/AccountSettings"));
const Auth = React.lazy(() => import("./pages/Auth"));
const MyMarketPage = React.lazy(() => import("./pages/MyMarketPage"));
const MyAdsPage = React.lazy(() => import("./pages/MyAdsPage"));
const ChatListPage = React.lazy(() => import("./pages/ChatListPage"));
const ChatPage = React.lazy(() => import("./pages/ChatPage"));
const MarketCatalogPage = React.lazy(() => import("./pages/MarketCatalogPage"));
const MarketDetailPage = React.lazy(() => import("./pages/MarketDetailPage"));
const AffiliatePage = React.lazy(() => import("./pages/AffiliatePage"));
const FavoritesPage = React.lazy(() => import("./pages/FavoritesPage"));
const TestingPage = React.lazy(() => import("./pages/TestingPage"));
const UserProfilePage = React.lazy(() => import("./pages/UserProfilePage").then(module => ({ default: module.UserProfilePage })));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const AdminCommissionPage = React.lazy(() => import("./pages/AdminCommissionPage"));
const AdminContentPage = React.lazy(() => import("./pages/AdminContentPage"));
const SharedObjectPage = React.lazy(() => import("./pages/SharedObjectPage"));
const SharedMarketPage = React.lazy(() => import("./pages/SharedMarketPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const CookiesPage = React.lazy(() => import("./pages/CookiesPage"));
const PrivacyPage = React.lazy(() => import("./pages/PrivacyPage"));
const LegalPage = React.lazy(() => import("./pages/LegalPage"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

// Preload critical images for better performance
if (typeof window !== 'undefined') {
  preloadCriticalImages([
    '/lovable-uploads/991c69cf-b058-411d-b885-f70ba12f255b.png', // Logo
    '/lovable-uploads/fed4e95f-7ec0-41bc-b194-9781cdc063de.png', // Navbar logo
    '/lovable-uploads/879e7bbc-f480-4a92-828d-077abd67eb7e.png', // Tab icons
    '/lovable-uploads/1c4d7d84-8efb-46de-9f25-d9f67e6b3572.png',
    '/lovable-uploads/6245700a-9f69-4791-b47e-aa1bd715be37.png',
    '/lovable-uploads/db565d88-e9c2-492d-bf27-7c312a6cd298.png'
  ]);
}

const AppContent = () => {
  const { showLocationDialog, isGettingLocation, handleLocationAccept, handleLocationDecline } = useFirstLogin();
  useAffiliateProcessor(); // Process pending affiliate referrals

  return (
    <>
      <LocationPermissionDialog
        isOpen={showLocationDialog}
        onAccept={handleLocationAccept}
        onDecline={handleLocationDecline}
        isLoading={isGettingLocation}
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-4 border-b bg-primary backdrop-blur">
          <div className="flex items-center">
            <OptimizedImage 
              src="/lovable-uploads/991c69cf-b058-411d-b885-f70ba12f255b.png" 
              alt="Greenriot" 
              className="h-8 w-auto"
              quality="high"
              loading="eager"
              width={32}
              height={32}
            />
          </div>
          <div className="flex items-center gap-3">
            <HeaderWallet />
            <MobileMenu />
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <MobileTabs />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Rutas públicas - no requieren autenticación */}
              <Route path="abandons" element={<ObjectsPage />} />
              <Route path="donations" element={<ObjectsPage />} />
              <Route path="products" element={<ObjectsPage />} />
              <Route path="object/:objectId" element={<ObjectDetailPage />} />
              <Route path="markets" element={<MarketsPage />} />
              <Route path="market-detail/:marketId" element={<MarketDetailPage />} />
              <Route path="market-catalog/:marketId" element={<MarketCatalogPage />} />
              <Route path="profile/:userId" element={<UserProfilePage />} />
              
              {/* Rutas protegidas - requieren autenticación */}
              <Route path="affiliates" element={<AffiliatePage />} />
              <Route path="wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
              <Route path="my-market" element={<ProtectedRoute><MyMarketPage /></ProtectedRoute>} />
              <Route path="my-ads" element={<ProtectedRoute><MyAdsPage /></ProtectedRoute>} />
              <Route path="chat" element={<ProtectedRoute><ChatListPage /></ProtectedRoute>} />
              <Route path="chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="testing" element={<ProtectedRoute><TestingPage /></ProtectedRoute>} />
              <Route path="admin-commission" element={<SuperAdminRoute><AdminCommissionPage /></SuperAdminRoute>} />
              <Route path="admin-content" element={<SuperAdminRoute><AdminContentPage /></SuperAdminRoute>} />
              <Route path="*" element={<Navigate to="/app/abandons" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin-content" element={<SuperAdminRoute><AdminContentPage /></SuperAdminRoute>} />
                  <Route path="/shared/object/:objectId/*" element={<SharedObjectPage />} />
                  <Route path="/shared/market/:marketId/*" element={<SharedMarketPage />} />
                  <Route path="/cookies" element={<CookiesPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/app/*" element={<AppContent />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            </TooltipProvider>
          </FavoritesProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;