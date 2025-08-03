import { useState, useEffect } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ObjectsList } from '@/components/ObjectsList';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useObjects } from '@/hooks/useObjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ObjectsPage = () => {
  const routerLocation = useRouterLocation();
  const [showUpload, setShowUpload] = useState(false);
  const { userLocation, calculateDistance } = useLocation();
  const { user } = useAuth();

  // Get the type from the current pathname
  const getTypeFromPath = (pathname: string): 'abandons' | 'donations' | 'products' => {
    if (pathname.includes('/abandons')) return 'abandons';
    if (pathname.includes('/donations')) return 'donations';
    if (pathname.includes('/products')) return 'products';
    return 'abandons'; // default fallback
  };

  const type = getTypeFromPath(routerLocation.pathname);
  const objectType = type === 'abandons' ? 'abandoned' : type === 'donations' ? 'donation' : 'product';
  
  // Use the optimized hook with materialized view
  const { objects, loading, refreshObjects } = useObjects({
    objectType,
    userLocation,
    calculateDistance
  });

  // Trigger initial load and refresh when type changes
  useEffect(() => {
    console.log('ObjectsPage: triggering refresh for type:', objectType);
    refreshObjects();
  }, [objectType, refreshObjects]);

  const getTitle = () => {
    switch (type) {
      case 'abandons': return 'Objetos Abandonos';
      case 'donations': return 'Donaciones';
      case 'products': return 'Productos';
      default: return 'Objetos';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'abandons': return 'Descubre objetos abandonos en tu área';
      case 'donations': return 'Encuentra donaciones disponibles';
      case 'products': return 'Explora productos en venta';
      default: return '';
    }
  };

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

      const { error } = await supabase
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
        });

      if (error) throw error;

      // Refresh the materialized view and force refresh objects
      await supabase.rpc('refresh_objects_view');
      refreshObjects();
      setShowUpload(false);
      toast.success('¡Objeto publicado exitosamente!');
    } catch (error) {
      console.error('Error uploading object:', error);
      toast.error('Error al publicar el objeto');
    }
  };

  const handlePurchaseCoordinates = async (objectId: string, price: number) => {
    // Open Google Maps with the object's coordinates
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
      const mapsUrl = `https://www.google.com/maps?q=${object.latitude},${object.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleFloatingUpload = (objectType: 'abandoned' | 'donation' | 'product') => {
    setShowUpload(true);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-8">Cargando objetos...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-md mx-auto w-full">
      {/* Content Header */}
      <div className="mb-4">
        <div className="mb-3">
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
          <p className="text-sm text-muted-foreground">{getDescription()}</p>
        </div>
      </div>

      {/* Upload Form - Only shown when FAB is clicked */}
      {showUpload && (
        <div className="mb-4 p-3 border rounded-lg bg-card">
          <PhotoUpload 
            onUpload={handleUploadObject} 
            objectType={objectType}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Objects List */}
      <ObjectsList
        objects={objects}
        onPurchaseCoordinates={handlePurchaseCoordinates}
        userLocation={userLocation}
        objectType={objectType}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onUpload={handleFloatingUpload} />
    </div>
  );
};

export default ObjectsPage;