import { useState, useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MobileTabs } from "@/components/MobileTabs";
import { MobileMenu } from "@/components/MobileMenu";
import { HeaderWallet } from "@/components/HeaderWallet";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ObjectsPage from "./ObjectsPage";
import ObjectDetailPage from "./ObjectDetailPage";
import MarketsPage from "./MarketsPage";
import MarketDetailPage from "./MarketDetailPage";
import MarketCatalogPage from "./MarketCatalogPage";
import { UserProfilePage } from "./UserProfilePage";
import { Routes, Route } from 'react-router-dom';

interface SharedObject {
  id: string;
  type: 'abandoned' | 'donation' | 'product';
  title: string;
  description?: string;
  image_url?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  is_sold: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    username?: string;
  };
}

// Component to handle meta tags for sharing
const SharedObjectMeta = ({ objectId }: { objectId: string }) => {
  const [object, setObject] = useState<SharedObject | null>(null);

  useEffect(() => {
    if (!objectId) return;

    const fetchObject = async () => {
      try {
        const { data, error } = await supabase
          .from('objects')
          .select(`
            *
          `)
          .eq('id', objectId)
          .maybeSingle();

        if (error || !data) return;

        // Fetch user profile separately
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', data.user_id)
          .maybeSingle();

        const objectWithProfile: SharedObject = {
          ...data,
          profiles: profileData || undefined
        } as SharedObject;

        setObject(objectWithProfile);
      } catch (error) {
        console.error('Error fetching object for meta tags:', error);
      }
    };

    fetchObject();
  }, [objectId]);

  useEffect(() => {
    if (object) {
      // Clear existing meta tags first
      const existingMetas = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
      existingMetas.forEach(meta => meta.remove());

      document.title = `${object.title} - GreenRiot`;
      
      // Convert relative URLs to absolute URLs
      let imageUrl = object.image_url || '/lovable-uploads/991c69cf-b058-411d-b885-f70ba12f255b.png';
      if (imageUrl.startsWith('/')) {
        imageUrl = `${window.location.origin}${imageUrl}`;
      }

      // Basic meta description
      const metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', object.description || object.title);
      document.head.appendChild(metaDescription);
      
      // Open Graph meta tags (Facebook, WhatsApp, etc.)
      const ogTags = [
        { property: 'og:title', content: object.title },
        { property: 'og:description', content: object.description || object.title },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:secure_url', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: object.title },
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
        { name: 'twitter:title', content: object.title },
        { name: 'twitter:description', content: object.description || object.title },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: object.title },
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
        { property: 'og:image:type', content: 'image/jpeg' },
        { name: 'telegram:channel', content: '@greenriot' },
        { property: 'article:author', content: object.profiles?.display_name || 'Usuario GreenRiot' },
        { property: 'article:published_time', content: object.created_at },
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
  }, [object]);

  return null;
};

// Main shared object app component
const SharedObjectApp = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Check if we should redirect to the object detail view
    if (objectId && location.pathname === `/shared/object/${objectId}`) {
      // Set a flag to redirect after the app is mounted
      setShouldRedirect(true);
    }
  }, [objectId, location.pathname]);

  // If we should redirect, navigate to the object detail page
  if (shouldRedirect && objectId) {
    return <Navigate to={`/shared/object/${objectId}/app/object/${objectId}`} replace />;
  }

  return (
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
          {/* Public routes */}
          <Route path="abandons" element={<ObjectsPage />} />
          <Route path="donations" element={<ObjectsPage />} />
          <Route path="products" element={<ObjectsPage />} />
          <Route path="object/:objectId" element={<ObjectDetailPage />} />
          <Route path="markets" element={<MarketsPage />} />
          <Route path="market-detail/:marketId" element={<MarketDetailPage />} />
          <Route path="market-catalog/:marketId" element={<MarketCatalogPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          
          {/* Default redirect to the shared object */}
          <Route path="*" element={objectId ? <Navigate to={`object/${objectId}`} replace /> : <Navigate to="abandons" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const SharedObjectPage = () => {
  const { objectId } = useParams<{ objectId: string }>();

  return (
    <AuthProvider>
      <LanguageProvider>
        <SubscriptionProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              
              {/* Add meta tags for sharing */}
              {objectId && <SharedObjectMeta objectId={objectId} />}
              
              <Routes>
                {/* Route for the shared object with full app navigation */}
                <Route path="/app/*" element={<SharedObjectApp />} />
                
                {/* Default route - redirect to app view */}
                <Route path="*" element={objectId ? <Navigate to={`/shared/object/${objectId}/app/object/${objectId}`} replace /> : <Navigate to="/app/abandons" replace />} />
              </Routes>
            </TooltipProvider>
          </FavoritesProvider>
        </SubscriptionProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default SharedObjectPage;