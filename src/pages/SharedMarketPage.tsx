import { useState, useEffect } from 'react';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/hooks/useLanguage';
import { SubscriptionProvider } from '@/hooks/useSubscription';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Navbar from '@/components/Navbar';
import { MobileTabs } from '@/components/MobileTabs';
import ObjectsPage from '@/pages/ObjectsPage';
import ObjectDetailPage from '@/pages/ObjectDetailPage';
import MarketsPage from '@/pages/MarketsPage';
import MarketDetailPage from '@/pages/MarketDetailPage';
import MarketCatalogPage from '@/pages/MarketCatalogPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { supabase } from '@/integrations/supabase/client';

interface SharedMarket {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  location_name?: string;
  latitude: number;
  longitude: number;
  created_at: string;
  is_active: boolean;
  accepts_donations: boolean;
  user_id: string;
  profiles?: {
    display_name?: string;
    username?: string;
  };
}

// Meta tags component for shared market
const SharedMarketMeta = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const [market, setMarket] = useState<SharedMarket | null>(null);

  useEffect(() => {
    if (!marketId) return;

    const fetchMarket = async () => {
      try {
        const { data, error } = await supabase
          .from('circular_markets')
          .select(`
            *
          `)
          .eq('id', marketId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Fetch user profile separately
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', data.user_id)
            .maybeSingle();

          const marketWithProfile: SharedMarket = {
            ...data,
            profiles: profileData || undefined
          } as SharedMarket;

          setMarket(marketWithProfile);
        }
      } catch (error) {
        console.error('SharedMarketMeta: Error fetching market:', error);
      }
    };

    fetchMarket();
  }, [marketId]);

  // Meta tags para compartir en redes sociales
  useEffect(() => {
    if (market) {
      // Clear existing meta tags first
      const existingMetas = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
      existingMetas.forEach(meta => meta.remove());

      document.title = `${market.title} - GreenRiot`;
      
      // Convert relative URLs to absolute URLs
      let imageUrl = market.image_url || '/lovable-uploads/991c69cf-b058-411d-b885-f70ba12f255b.png';
      if (imageUrl.startsWith('/')) {
        imageUrl = `${window.location.origin}${imageUrl}`;
      }
      
      // Basic meta description
      const metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', market.description || market.title);
      document.head.appendChild(metaDescription);
      
      // Open Graph meta tags (Facebook, WhatsApp, etc.)
      const ogTags = [
        { property: 'og:title', content: market.title },
        { property: 'og:description', content: market.description || market.title },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:secure_url', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: market.title },
        { property: 'og:url', content: window.location.href },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: 'GreenRiot' },
        { property: 'og:locale', content: 'es_ES' }
      ];

      ogTags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      });

      // Twitter Card meta tags
      const twitterTags = [
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: market.title },
        { name: 'twitter:description', content: market.description || market.title },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: market.title },
        { name: 'twitter:site', content: '@GreenRiot' },
        { name: 'twitter:creator', content: '@GreenRiot' }
      ];

      twitterTags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', tag.name);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      });

      // Additional meta for better compatibility
      const additionalMetas = [
        { property: 'article:author', content: market.profiles?.display_name || 'Usuario GreenRiot' },
        { property: 'article:published_time', content: market.created_at },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#10b981' }
      ];

      additionalMetas.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.property) {
          meta.setAttribute('property', tag.property);
        } else {
          meta.setAttribute('name', tag.name);
        }
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      });
    }
  }, [market]);

  return null;
};

// Main app component for shared market
const SharedMarketApp = () => {
  const { marketId } = useParams<{ marketId: string }>();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          {/* Public routes */}
          <Route path="abandons" element={<ObjectsPage />} />
          <Route path="donations" element={<ObjectsPage />} />
          <Route path="products" element={<ObjectsPage />} />
          <Route path="object/:objectId" element={<ObjectDetailPage />} />
          <Route path="markets" element={<MarketsPage />} />
          <Route path="market-detail/:marketId" element={<MarketDetailPage />} />
          <Route path="market-catalog/:marketId" element={<MarketCatalogPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          
          {/* Default redirect to the shared market */}
          <Route index element={marketId ? <Navigate to={`market-detail/${marketId}`} replace /> : <Navigate to="markets" replace />} />
          <Route path="*" element={marketId ? <Navigate to={`market-detail/${marketId}`} replace /> : <Navigate to="markets" replace />} />
        </Routes>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileTabs />
      </div>
    </div>
  );
};

// Main SharedMarketPage component
const SharedMarketPage = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <FavoritesProvider>
              <TooltipProvider>
                {marketId && <SharedMarketMeta />}
                <SharedMarketApp />
              </TooltipProvider>
            </FavoritesProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default SharedMarketPage;