import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Store, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

const SharedMarketPage = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const [market, setMarket] = useState<SharedMarket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketId) {
      console.log('SharedMarketPage: No marketId provided');
      return;
    }

    console.log('SharedMarketPage: Fetching market with ID:', marketId);

    const fetchMarket = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('circular_markets')
          .select(`
            *
          `)
          .eq('id', marketId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('SharedMarketPage: Error fetching market:', error);
          throw error;
        }

        if (data) {
          // Fetch user profile separately
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', data.user_id)
            .maybeSingle();

          // Create object with profile data
          const marketWithProfile: SharedMarket = {
            ...data,
            profiles: profileData || undefined
          } as SharedMarket;

          console.log('SharedMarketPage: Market data fetched:', marketWithProfile);
          setMarket(marketWithProfile);
        } else {
          setMarket(null);
        }
      } catch (error) {
        console.error('SharedMarketPage: Catch block error:', error);
      } finally {
        setLoading(false);
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

      console.log('Setting meta tags with image URL:', imageUrl);
      
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

      // WhatsApp specific (uses Open Graph but sometimes needs help)
      const whatsappMeta = document.createElement('meta');
      whatsappMeta.setAttribute('property', 'og:image:type');
      whatsappMeta.setAttribute('content', 'image/jpeg');
      document.head.appendChild(whatsappMeta);

      // Telegram specific
      const telegramMeta = document.createElement('meta');
      telegramMeta.setAttribute('name', 'telegram:channel');
      telegramMeta.setAttribute('content', '@greenriot');
      document.head.appendChild(telegramMeta);

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

      console.log('Meta tags set for market:', market.title);
    }
  }, [market]);

  const openInMaps = () => {
    if (market?.latitude && market?.longitude) {
      const url = `https://www.google.com/maps?q=${market.latitude},${market.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Mercadillo no encontrado</h1>
          <p className="text-muted-foreground">El mercadillo que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">GreenRiot</h1>
          <p className="text-sm text-muted-foreground mb-1">Stooping & Thrifting Circular economy App</p>
          <p className="text-xs text-muted-foreground">Save or make money. Save the planet</p>
        </div>

        {/* Market Card */}
        <Card className="mb-6">
          {market.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={market.image_url}
                alt={market.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">
                  <Store className="w-3 h-3 mr-1" />
                  Mercadillo Circular
                </Badge>
                <CardTitle className="text-xl">{market.title}</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {market.description && (
              <p className="text-foreground">{market.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {market.location_name && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {market.location_name}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(market.created_at), 'dd/MM/yyyy')}
              </div>
            </div>

            {market.accepts_donations && (
              <Badge variant="outline" className="text-xs">
                Acepta donaciones
              </Badge>
            )}

            {market.profiles?.display_name && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Creado por <span className="font-medium text-foreground">{market.profiles.display_name}</span>
                </p>
              </div>
            )}

          </CardContent>
        </Card>

        {/* App Download CTA */}
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="font-semibold text-foreground mb-2">¿Te interesa este mercadillo?</h3>
            <p className="text-muted-foreground mb-4">
              Crea una cuenta en Greenriot
            </p>
            <Button className="w-full">
              Crear cuenta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedMarketPage;