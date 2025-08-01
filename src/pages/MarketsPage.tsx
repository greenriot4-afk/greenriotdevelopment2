import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreateMarketForm } from '@/components/CreateMarketForm';
import { MarketsList, CircularMarket } from '@/components/MarketsList';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { MapPin, Plus, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MarketsPage = () => {
  const [markets, setMarkets] = useState<CircularMarket[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userLocation, getCurrentLocation, isLoading: locationLoading } = useLocation();
  const { user } = useAuth();
  const { subscribed, createSubscription, loading: subscriptionLoading } = useSubscription();

  const fetchMarkets = async () => {
    try {
      console.log('fetchMarkets called');
      setLoading(true);
      const { data, error } = await supabase
        .from('circular_markets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('fetchMarkets result', { data: data?.length, error });
      if (error) throw error;
      setMarkets((data || []) as CircularMarket[]);
    } catch (error) {
      console.error('Error fetching markets:', error);
      toast.error('Error al cargar los mercadillos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleCreateMarket = async (data: {
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    locationName: string;
    acceptsDonations: boolean;
  }) => {
    try {
      if (!user) {
        toast.error('Debes iniciar sesión para crear un mercadillo');
        return;
      }

      if (!subscribed) {
        toast.error('Necesitas una suscripción Premium para crear mercadillos');
        return;
      }

      const { data: newMarket, error } = await supabase
        .from('circular_markets')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          image_url: data.image,
          latitude: data.latitude,
          longitude: data.longitude,
          location_name: data.locationName,
          accepts_donations: data.acceptsDonations,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setMarkets(prev => [newMarket as CircularMarket, ...prev]);
      setShowCreateForm(false);
      toast.success('¡Mercadillo creado exitosamente!');
    } catch (error) {
      console.error('Error creating market:', error);
      toast.error('Error al crear el mercadillo');
    }
  };

  const handleMarketClick = (marketId: string) => {
    const market = markets.find(m => m.id === marketId);
    if (market) {
      const mapsUrl = `https://www.google.com/maps?q=${market.latitude},${market.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">Cargando mercadillos...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-md mx-auto w-full">
      {/* Content Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">Mercadillos Circulares</h2>
            <p className="text-sm text-muted-foreground">
              Tiendas de segunda mano y garages sales cerca de ti
            </p>
          </div>
          {!subscribed ? (
            <Button 
              onClick={createSubscription} 
              className="flex items-center gap-2"
              size="sm"
              disabled={subscriptionLoading}
            >
              <Crown className="w-4 h-4" />
              {subscriptionLoading ? 'Cargando...' : 'Create circular market $19/month'}
            </Button>
          ) : (
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)} 
              className="flex items-center gap-2"
              size="sm"
              data-create-market
            >
              <Plus className="w-4 h-4" />
              Crear
            </Button>
          )}
        </div>

        {/* Location Status */}
        <div className="flex items-center gap-2 p-3 bg-card rounded-lg border text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {userLocation ? 'Ubicación activada' : 'Ubicación desactivada'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => getCurrentLocation()}
            disabled={locationLoading}
            className="ml-auto text-xs h-7"
          >
            {locationLoading ? 'Obteniendo...' : userLocation ? 'Actualizar' : 'Activar'}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-4 p-3 border rounded-lg bg-card">
          <CreateMarketForm 
            onSubmit={handleCreateMarket} 
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Markets List */}
      {!userLocation ? (
        <div className="text-center py-6">
          <MapPin className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4 text-sm">
            Activa tu ubicación para ver las distancias a los mercadillos
          </p>
          <Button onClick={() => getCurrentLocation()} disabled={locationLoading} size="sm">
            {locationLoading ? 'Obteniendo ubicación...' : 'Activar ubicación'}
          </Button>
        </div>
      ) : (
        <MarketsList
          markets={markets}
          onMarketClick={handleMarketClick}
          userLocation={userLocation}
        />
      )}
    </div>
  );
};

export default MarketsPage;