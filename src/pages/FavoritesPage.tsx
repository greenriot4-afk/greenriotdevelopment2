import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useLocation } from '@/hooks/useLocation';
import { ObjectsList, AbandonedObject } from '@/components/ObjectsList';

const FavoritesPage = () => {
  const { getFavoriteObjects, loading } = useFavorites();
  const { userLocation } = useLocation();
  const [favoriteObjects, setFavoriteObjects] = useState<AbandonedObject[]>([]);
  const [objectsLoading, setObjectsLoading] = useState(true);

  useEffect(() => {
    const loadFavoriteObjects = async () => {
      setObjectsLoading(true);
      try {
        const objects = await getFavoriteObjects();
        // Transform the data to match AbandonedObject interface
        const transformedObjects = objects.map((obj: any) => ({
          id: obj.id,
          title: obj.title,
          description: obj.description,
          image_url: obj.image_url,
          latitude: obj.latitude,
          longitude: obj.longitude,
          price_credits: obj.price_credits,
          is_sold: obj.is_sold,
          user_id: obj.user_id,
          created_at: obj.created_at,
          type: obj.type,
          user_display_name: obj.profiles?.display_name || obj.profiles?.username || 'Usuario',
          username: obj.profiles?.username
        }));
        setFavoriteObjects(transformedObjects);
      } catch (error) {
        console.error('Error loading favorite objects:', error);
      } finally {
        setObjectsLoading(false);
      }
    };

    if (!loading) {
      loadFavoriteObjects();
    }
  }, [loading, getFavoriteObjects]);

  const handlePurchaseCoordinates = async (objectId: string, price: number) => {
    // This function is required by ObjectsList but not really used for favorites
    // Could implement coordinate purchase logic here if needed
    console.log('Purchase coordinates:', objectId, price);
  };

  if (loading || objectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold">Mis Favoritos</h1>
        </div>
        <p className="text-muted-foreground">
          Aquí tienes todos los anuncios que has marcado como favoritos
        </p>
      </div>

      {favoriteObjects.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes favoritos aún</h3>
          <p className="text-muted-foreground">
            Marca anuncios como favoritos tocando el corazón en las fotos
          </p>
        </div>
      ) : (
        <ObjectsList
          objects={favoriteObjects}
          onPurchaseCoordinates={handlePurchaseCoordinates}
          userLocation={userLocation}
          objectType="abandoned" // Default type for display purposes
        />
      )}
    </div>
  );
};

export default FavoritesPage;