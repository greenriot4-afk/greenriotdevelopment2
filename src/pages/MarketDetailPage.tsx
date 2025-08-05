import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Heart, Store, User, Phone, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import ShareButton from '@/components/ShareButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CircularMarket } from '@/components/MarketsList';
import { ChatButton } from '@/components/ChatButton';

const MarketDetailPage = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const { user } = useAuth();
  const { calculateDistance } = useLocation();
  const navigate = useNavigate();
  
  const [market, setMarket] = useState<CircularMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!marketId) return;

    const fetchMarketDetail = async () => {
      try {
        setLoading(true);
        
        const { data: marketData, error: marketError } = await supabase
          .from('circular_markets')
          .select('*')
          .eq('id', marketId)
          .eq('is_active', true)
          .single();

        if (marketError) throw marketError;
        
        setMarket(marketData as CircularMarket);

        // Get user location for distance calculation - only for authenticated users
        if (user && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            () => {
              // Ignore geolocation errors
            },
            {
              timeout: 10000,
              maximumAge: 300000,
              enableHighAccuracy: false
            }
          );
        }
      } catch (error) {
        console.error('Error fetching market detail:', error);
        toast.error('Error al cargar el mercadillo');
        navigate('/app/markets');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketDetail();
  }, [marketId]);

  const getDistanceText = () => {
    if (!userLocation || !market) return 'Distancia desconocida';
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      market.latitude,
      market.longitude
    );
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  };

  const openGoogleMaps = () => {
    if (!market) return;
    const mapsUrl = `https://www.google.com/maps?q=${market.latitude},${market.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">Cargando mercadillo...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Mercadillo no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/markets')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Detalle del Mercadillo</h1>
          <p className="text-sm text-muted-foreground">Información completa</p>
        </div>
      </div>

      {/* Market Image */}
      {market.image_url && (
        <Card className="mb-4 overflow-hidden">
          <div className="aspect-video relative">
            <img 
              src={market.image_url} 
              alt={market.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90">
                <Store className="w-3 h-3 mr-1" />
                Mercadillo
              </Badge>
            </div>
            {market.accepts_donations && (
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="bg-green-500">
                  <Heart className="w-3 h-3 mr-1" />
                  Donaciones
                </Badge>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Market Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">{market.title}</CardTitle>
          {market.description && (
            <p className="text-sm text-muted-foreground">{market.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{market.location_name || 'Ubicación'}</p>
              <p className="text-muted-foreground text-xs">
                Distancia: {getDistanceText()}
              </p>
            </div>
          </div>

          {/* Creation Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Creado {new Date(market.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {market.accepts_donations && (
              <Badge variant="outline" className="text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Acepta donaciones
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Store className="w-3 h-3 mr-1" />
              Segunda mano
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={openGoogleMaps}
          className="w-full"
          size="lg"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Open in Google Maps
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/app/market-catalog/${market.id}`)}
            size="sm"
          >
            <Store className="w-4 h-4" />
          </Button>

          <ChatButton
            userId={market.user_id}
            size="sm"
            variant="outline"
          />

          <ShareButton 
            type="market" 
            id={market.id} 
            title={market.title} 
            description={market.description}
            imageUrl={market.image_url}
            size="sm"
          />
        </div>
      </div>

      {/* Additional Info */}
      <Card className="mt-4 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Store className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Sobre este mercadillo
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Los mercadillos circulares son espacios donde puedes encontrar productos de segunda mano y donar artículos que ya no uses. ¡Ayudemos al planeta reutilizando!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketDetailPage;