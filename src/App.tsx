import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MobileTabs } from "@/components/MobileTabs";
import { MobileMenu } from "@/components/MobileMenu";
import ObjectsPage from "./pages/ObjectsPage";
import WalletPage from "./pages/WalletPage";
import AccountSettings from "./pages/AccountSettings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
                  <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex-1" />
                    <h1 className="font-bold text-lg text-center flex-1">Street Finds</h1>
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
                          <Route path="/wallet" element={<WalletPage />} />
                          <Route path="/account" element={<AccountSettings />} />
                          <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
