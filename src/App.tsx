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
import ObjectsPage from "./pages/ObjectsPage";
import ObjectDetailPage from "./pages/ObjectDetailPage";
import WalletPage from "./pages/WalletPage";
import MarketsPage from "./pages/MarketsPage";
import AccountSettings from "./pages/AccountSettings";
import Auth from "./pages/Auth";
import MyMarketPage from "./pages/MyMarketPage";
import MyAdsPage from "./pages/MyAdsPage";
import ChatListPage from "./pages/ChatListPage";
import ChatPage from "./pages/ChatPage";
import MarketCatalogPage from "./pages/MarketCatalogPage";
import MarketDetailPage from "./pages/MarketDetailPage";
import AffiliatePage from "./pages/AffiliatePage";
import FavoritesPage from "./pages/FavoritesPage";
import TestingPage from "./pages/TestingPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import LandingPage from "./pages/LandingPage";
import AdminCommissionPage from "./pages/AdminCommissionPage";
import AdminContentPage from "./pages/AdminContentPage";
import SharedObjectPage from "./pages/SharedObjectPage";
import SharedMarketPage from "./pages/SharedMarketPage";
import NotFound from "./pages/NotFound";
import CookiesPage from "./pages/CookiesPage";
import PrivacyPage from "./pages/PrivacyPage";
import LegalPage from "./pages/LegalPage";
import { LocationPermissionDialog } from "@/components/LocationPermissionDialog";
import { useFirstLogin } from "@/hooks/useFirstLogin";
import { useAffiliateProcessor } from "@/hooks/useAffiliateProcessor";

const queryClient = new QueryClient();

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
            <img 
              src="/lovable-uploads/991c69cf-b058-411d-b885-f70ba12f255b.png" 
              alt="Greenriot" 
              className="h-8 w-auto"
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
            <Route path="affiliates" element={<ProtectedRoute><AffiliatePage /></ProtectedRoute>} />
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
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin-content" element={<SuperAdminRoute><AdminContentPage /></SuperAdminRoute>} />
                <Route path="/shared/object/:objectId" element={<SharedObjectPage />} />
                <Route path="/shared/market/:marketId" element={<SharedMarketPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/app/*" element={<AppContent />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </FavoritesProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;