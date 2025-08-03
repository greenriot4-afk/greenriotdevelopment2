import { useState, useEffect, useRef } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ObjectsList } from '@/components/ObjectsList';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { MapPin } from 'lucide-react';
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
  user_display_name?: string;
  username?: string;
}

const ObjectsPage = () => {
  const routerLocation = useRouterLocation();
  const [objects, setObjects] = useState<AppObject[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userLocation, getCurrentLocation, isLoading: locationLoading, calculateDistance } = useLocation();
  const { user } = useAuth();
  
  // Simple cache to prevent duplicate requests
  const lastFetchRef = useRef<{ type: string; timestamp: number } | null>(null);
  const CACHE_DURATION = 30000; // 30 seconds

  // Get the type from the current pathname
  const getTypeFromPath = (pathname: string): 'abandons' | 'donations' | 'products' => {
    if (pathname.includes('/abandons')) return 'abandons';
    if (pathname.includes('/donations')) return 'donations';
    if (pathname.includes('/products')) return 'products';
    return 'abandons'; // default fallback
  };

  const type = getTypeFromPath(routerLocation.pathname);
  const objectType = type === 'abandons' ? 'abandoned' : type === 'donations' ? 'donation' : 'product';
  
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

  const fetchObjects = async () => {
    try {
      console.log('fetchObjects called', { type, objectType, user: !!user });
      setLoading(true);
      
      // Optimized query with limit to prevent timeouts
      console.log('About to query objects with limit:', { objectType });
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('type', objectType)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(50); // Limit results to prevent timeouts

      console.log('fetchObjects result', { data: data?.length, error });
      
      if (error) {
        console.error('Supabase query error:', error);
        // Handle timeout errors more gracefully
        if (error.code === '57014') {
          toast.error('La consulta está tardando más de lo esperado. Reintentando...');
          return; // Exit early, don't set empty array
        }
        throw error;
      }

      // Get unique user IDs to batch profile queries
      const userIds = [...new Set((data || []).map(obj => obj.user_id))];
      
      // Batch fetch profiles for all users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', userIds);

      if (profileError) {
        console.warn('Error fetching profiles:', profileError);
      }

      // Create a map for quick profile lookup
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Transform objects with profile data
      const transformedObjects = (data || []).map(object => {
        const profile = profileMap.get(object.user_id);
        return {
          ...object,
          type: object.type as 'abandoned' | 'donation' | 'product',
          description: object.description || undefined,
          is_sold: object.is_sold || false,
          user_display_name: profile?.display_name || 'Usuario',
          username: profile?.username || ''
        };
      });

      // Sort objects by distance if user location is available
      let sortedObjects = transformedObjects as AppObject[];
      if (userLocation) {
        sortedObjects = transformedObjects.sort((a, b) => {
          const distanceA = calculateDistance(
            userLocation.latitude, userLocation.longitude,
            a.latitude, a.longitude
          );
          const distanceB = calculateDistance(
            userLocation.latitude, userLocation.longitude,
            b.latitude, b.longitude
          );
          return distanceA - distanceB;
        });
      }

      setObjects(sortedObjects);
      console.log('Objects loaded successfully:', sortedObjects.length);
    } catch (error: any) {
      console.error('Error fetching objects:', error);
      
      // Provide user-friendly error messages
      if (error?.code === '57014') {
        toast.error('La consulta tardó demasiado. Por favor, inténtalo de nuevo.');
      } else if (error?.message?.includes('timeout')) {
        toast.error('Conexión lenta. Inténtalo de nuevo.');
      } else {
        toast.error('No se pudieron cargar los objetos en este momento.');
      }
      
      // Don't clear existing objects on timeout - keep what we have
      if (error?.code !== '57014' && objects.length === 0) {
        setObjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered', { type, objectType, user: !!user });
    
    // Check cache to prevent duplicate requests
    const now = Date.now();
    const lastFetch = lastFetchRef.current;
    
    if (lastFetch && 
        lastFetch.type === objectType && 
        (now - lastFetch.timestamp) < CACHE_DURATION) {
      console.log('Using cached data, skipping fetch');
      setLoading(false);
      return;
    }
    
    if (type && objectType) {
      // Update cache reference
      lastFetchRef.current = { type: objectType, timestamp: now };
      fetchObjects();
    } else {
      console.log('Missing dependencies for fetchObjects', { type, objectType });
      setLoading(false);
    }
  }, [type, objectType]); // Remove userLocation dependency to prevent excessive re-fetching

  // Separate effect for sorting when location changes
  useEffect(() => {
    if (userLocation && objects.length > 0) {
      console.log('Re-sorting objects by distance');
      const sortedObjects = [...objects].sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          a.latitude, a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          b.latitude, b.longitude
        );
        return distanceA - distanceB;
      });
      setObjects(sortedObjects);
    }
  }, [userLocation, calculateDistance]); // Only re-sort, don't re-fetch

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

      // Invalidate cache when new object is added
      lastFetchRef.current = null;
      
      setObjects(prev => [newObject as AppObject, ...prev]);
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

  const handleObjectRemoved = (objectId: string) => {
    // Remove the object from the local state immediately
    setObjects(prevObjects => prevObjects.filter(obj => obj.id !== objectId));
    toast.success('El anuncio ha sido eliminado tras la compra exitosa');
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
        onObjectRemoved={handleObjectRemoved}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onUpload={handleFloatingUpload} />
    </div>
  );
};

export default ObjectsPage;