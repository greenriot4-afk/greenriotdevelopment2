import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Edit, Trash2, Store, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CircularMarket } from '@/components/MarketsList';
import { CatalogManagement } from '@/components/CatalogManagement';
import { EditMarketForm } from '@/components/EditMarketForm';

const MyMarketPage = () => {
  const [market, setMarket] = useState<CircularMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUserMarket = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circular_markets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No market found
          navigate('/app/markets');
          toast.error('No tienes un mercadillo creado');
          return;
        }
        throw error;
      }

      setMarket(data as CircularMarket);
    } catch (error) {
      console.error('Error fetching user market:', error);
      toast.error('Error al cargar tu mercadillo');
      navigate('/app/markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMarket();
  }, [user]);

  const handleToggleActive = async (isActive: boolean) => {
    if (!market || !user) return;

    try {
      const { error } = await supabase
        .from('circular_markets')
        .update({ is_active: isActive })
        .eq('id', market.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMarket(prev => prev ? { ...prev, is_active: isActive } : null);
      toast.success(isActive ? 'Mercadillo activado' : 'Mercadillo desactivado');
    } catch (error) {
      console.error('Error updating market status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleToggleDonations = async (acceptsDonations: boolean) => {
    if (!market || !user) return;

    try {
      const { error } = await supabase
        .from('circular_markets')
        .update({ accepts_donations: acceptsDonations })
        .eq('id', market.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMarket(prev => prev ? { ...prev, accepts_donations: acceptsDonations } : null);
      toast.success(acceptsDonations ? 'Donaciones activadas' : 'Donaciones desactivadas');
    } catch (error) {
      console.error('Error updating donations setting:', error);
      toast.error('Error al actualizar las donaciones');
    }
  };

  const handleDeleteMarket = async () => {
    if (!market || !user) return;

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar tu mercadillo? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('circular_markets')
        .delete()
        .eq('id', market.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Mercadillo eliminado correctamente');
      navigate('/app/markets');
    } catch (error) {
      console.error('Error deleting market:', error);
      toast.error('Error al eliminar el mercadillo');
    }
  };

  const handleEditMarket = async (data: {
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    locationName: string;
    acceptsDonations: boolean;
  }) => {
    if (!market || !user) return;

    try {
      const { data: updatedMarket, error } = await supabase
        .from('circular_markets')
        .update({
          title: data.title,
          description: data.description,
          image_url: data.image,
          latitude: data.latitude,
          longitude: data.longitude,
          location_name: data.locationName,
          accepts_donations: data.acceptsDonations,
        })
        .eq('id', market.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setMarket(updatedMarket as CircularMarket);
      setShowEditForm(false);
      toast.success('Mercadillo actualizado exitosamente!');
    } catch (error) {
      console.error('Error updating market:', error);
      throw error;
    }
  };

  const openInMaps = () => {
    if (!market) return;
    const mapsUrl = `https://www.google.com/maps?q=${market.latitude},${market.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">Cargando tu mercadillo...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontró tu mercadillo</p>
        </div>
      </div>
    );
  }

  // Si estamos editando, mostrar el formulario
  if (showEditForm) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEditForm(false)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Editar Mercadillo</h1>
            <p className="text-sm text-muted-foreground">Actualiza la información de tu mercadillo</p>
          </div>
        </div>

        <EditMarketForm
          market={market}
          onSubmit={handleEditMarket}
          onCancel={() => setShowEditForm(false)}
        />
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
          <h1 className="text-xl font-semibold">Mi Mercadillo</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu mercadillo circular</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Catálogo
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4 mt-4">
          {/* Market Info Card */}
          <Card className="overflow-hidden">
            {market.image_url && (
              <div className="aspect-video relative">
                <img 
                  src={market.image_url} 
                  alt={market.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant={market.is_active ? "default" : "secondary"}>
                    {market.is_active ? 'Activo' : 'Inactivo'}
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
            )}
            
            <CardHeader>
              <CardTitle>{market.title}</CardTitle>
              {market.description && (
                <p className="text-sm text-muted-foreground">{market.description}</p>
              )}
              {market.location_name && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {market.location_name}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={openInMaps}
                className="w-full mb-3"
              >
                <MapPin className="w-3 h-3 mr-2" />
                View in Google Maps
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Creado {new Date(market.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="space-y-4">
            {/* Active Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Estado del mercadillo</h3>
                    <p className="text-sm text-muted-foreground">
                      {market.is_active ? 'Visible para otros usuarios' : 'Oculto para otros usuarios'}
                    </p>
                  </div>
                  <Switch
                    checked={market.is_active}
                    onCheckedChange={handleToggleActive}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Donations */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Trabajamos donaciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Pon en tu descripción de qué forma trabajas las donaciones: qué tipo de objetos aceptas, en qué estado... ¡Haz tu donaciones también! Son un buen reclamo para traer clientes a tu mercadillo.
                    </p>
                  </div>
                  <Switch
                    checked={market.accepts_donations}
                    onCheckedChange={handleToggleDonations}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowEditForm(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar información
              </Button>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteMarket}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar mercadillo
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="mt-4">
          <CatalogManagement marketId={market.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyMarketPage;