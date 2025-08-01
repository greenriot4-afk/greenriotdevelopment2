import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MobileTabs } from "@/components/MobileTabs";
import { MobileMenu } from "@/components/MobileMenu";
import ObjectsPage from "./pages/ObjectsPage";
import WalletPage from "./pages/WalletPage";
import MarketsPage from "./pages/MarketsPage";
import AccountSettings from "./pages/AccountSettings";
import Auth from "./pages/Auth";
import MyMarketPage from "./pages/MyMarketPage";
import ChatListPage from "./pages/ChatListPage";
import ChatPage from "./pages/ChatPage";
import MarketCatalogPage from "./pages/MarketCatalogPage";
import MarketDetailPage from "./pages/MarketDetailPage";
import AffiliatePage from "./pages/AffiliatePage";
import TestingPage from "./pages/TestingPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col bg-background">
                  {/* Header */}
                  <header className="flex items-center justify-between h-14 px-4 border-b bg-primary backdrop-blur">
                    <div className="flex-1" />
                    <div className="flex items-center justify-center flex-1">
                      <img 
                        src="/lovable-uploads/d8b5b7dc-f65c-45cf-acee-55fb29fdba7c.png" 
                        alt="Greenriot" 
                        className="h-8 w-auto"
                      />
                    </div>
                    <div className="flex-1 flex justify-end">
                      <MobileMenu />
                    </div>
                  </header>

                  {/* Mobile Navigation Tabs */}
                  <MobileTabs />

                  {/* Main Content */}
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Navigate to="/abandons" replace />} />
                          <Route path="/abandons" element={<ObjectsPage />} />
                          <Route path="/donations" element={<ObjectsPage />} />
                          <Route path="/products" element={<ObjectsPage />} />
                          <Route path="/markets" element={<MarketsPage />} />
                          <Route path="/wallet" element={<WalletPage />} />
                          <Route path="/account" element={<AccountSettings />} />
                          <Route path="/my-market" element={<MyMarketPage />} />
                          <Route path="/market-detail/:marketId" element={<MarketDetailPage />} />
                          <Route path="/market-catalog/:marketId" element={<MarketCatalogPage />} />
                          <Route path="/chat" element={<ChatListPage />} />
                          <Route path="/chat/:conversationId" element={<ChatPage />} />
                          <Route path="/affiliates" element={<AffiliatePage />} />
                  <Route path="/testing" element={<TestingPage />} />
                  <Route path="/profile/:userId" element={<UserProfilePage />} />
                          <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </AuthProvider>
</LanguageProvider>
</QueryClientProvider>
);

export default App;
