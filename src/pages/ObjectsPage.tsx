import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ObjectsList } from '@/components/ObjectsList';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AppObject {
  id: string;
  type: 'abandoned' | 'donation' | 'product';
  title: string;
  description?: string;
  image_url: string;
  latitude: number;
  longitude: number;
  price_credits: number;
  is_sold: boolean;
  user_id: string;
  created_at: string;
}

const ObjectsPage = () => {
  const { type } = useParams<{ type: 'abandons' | 'donations' | 'products' }>();
  const [objects, setObjects] = useState<AppObject[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userLocation, getCurrentLocation, isLoading: locationLoading } = useLocation();
  const { user } = useAuth();

  const objectType = type === 'abandons' ? 'abandoned' : type === 'donations' ? 'donation' : 'product';
  
  const getTitle = () => {
    switch (type) {
      case 'abandons': return 'Objetos Abandonados';
      case 'donations': return 'Donaciones';
      case 'products': return 'Productos';
      default: return 'Objetos';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'abandons': return 'Descubre objetos abandonados en tu área';
      case 'donations': return 'Encuentra donaciones disponibles';
      case 'products': return 'Explora productos en venta';
      default: return '';
    }
  };

  const fetchObjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('type', objectType)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObjects((data || []) as AppObject[]);
    } catch (error) {
      console.error('Error fetching objects:', error);
      toast.error('Error al cargar los objetos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type && user) {
      fetchObjects();
    }
  }, [type, objectType, user]);

  const handleUploadObject = async (data: {
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    price: number;
  }) => {
    try {
      if (!user) {
        toast.error('Debes iniciar sesión para publicar objetos');
        return;
      }

      const { data: newObject, error } = await supabase
        .from('objects')
        .insert({
          user_id: user.id,
          type: objectType,
          title: data.title,
          description: data.description,
          image_url: data.image,
          latitude: data.latitude,
          longitude: data.longitude,
          price_credits: data.price,
          is_sold: false
        })
        .select()
        .single();

      if (error) throw error;

      setObjects(prev => [newObject as AppObject, ...prev]);
      setShowUpload(false);
      toast.success('¡Objeto publicado exitosamente!');
    } catch (error) {
      console.error('Error uploading object:', error);
      toast.error('Error al publicar el objeto');
    }
  };

  const handlePurchaseCoordinates = async (objectId: string, price: number) => {
    // This would integrate with the wallet system
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
      toast.success(
        `Coordenadas adquiridas! Ubicación: ${object.latitude.toFixed(6)}, ${object.longitude.toFixed(6)}`,
        { duration: 10000 }
      );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-8">Cargando objetos...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{getTitle()}</h1>
            <p className="text-muted-foreground">{getDescription()}</p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Publicar
          </Button>
        </div>

        {/* Location Status */}
        <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {userLocation ? 'Ubicación activada' : 'Ubicación desactivada'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="ml-auto"
          >
            {locationLoading ? 'Obteniendo...' : userLocation ? 'Actualizar' : 'Activar ubicación'}
          </Button>
        </div>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="mb-6 p-4 border rounded-lg bg-card">
          <PhotoUpload 
            onUpload={handleUploadObject} 
            objectType={objectType}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Objects List */}
      {!userLocation ? (
        <div className="text-center py-8">
          <MapPin className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Activa tu ubicación para ver las distancias a los objetos
          </p>
          <Button onClick={getCurrentLocation} disabled={locationLoading}>
            {locationLoading ? 'Obteniendo ubicación...' : 'Activar ubicación'}
          </Button>
        </div>
      ) : (
        <ObjectsList
          objects={objects}
          onPurchaseCoordinates={handlePurchaseCoordinates}
          userLocation={userLocation}
          objectType={objectType}
        />
      )}
    </div>
  );
};

export default ObjectsPage;