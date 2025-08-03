import { useState, useEffect } from 'react';
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
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { userLocation, getCurrentLocation, isLoading: locationLoading, calculateDistance } = useLocation();
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

  const fetchObjects = async (forceRefresh = false) => {
    try {
      // Cache for 30 seconds to avoid unnecessary API calls
      const now = Date.now();
      if (!forceRefresh && lastFetch && (now - lastFetch) < 30000) {
        console.log('Using cached objects, skipping fetch');
        return;
      }

      console.log('fetchObjects called', { type, objectType, user: !!user, forceRefresh });
      setLoading(true);
      
      console.log('About to query objects with:', { objectType });
      
      // First get objects
      const { data: objectsData, error: objectsError } = await supabase
        .from('objects')
        .select('*')
        .eq('type', objectType)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(50); // Limit results for better performance

      if (objectsError) {
        console.error('Supabase query error:', objectsError);
        throw objectsError;
      }

      console.log('Objects fetched:', objectsData?.length);

      // Get unique user IDs
      const userIds = [...new Set(objectsData?.map(obj => obj.user_id) || [])];
      
      // Fetch all profiles in one query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }

      console.log('Profiles fetched:', profilesData?.length);

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Transform the data to match expected interface
      const enrichedObjects = (objectsData || []).map((object) => {
        const profile = profilesMap.get(object.user_id);
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
      let sortedObjects = enrichedObjects as AppObject[];
      if (userLocation) {
        sortedObjects = enrichedObjects.sort((a, b) => {
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
      setLastFetch(now); // Update cache timestamp
      console.log('Objects loaded successfully:', sortedObjects.length);
    } catch (error) {
      console.error('Error fetching objects:', error);
      toast.error('Error al cargar los objetos');
      setObjects([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered', { type, objectType, user: !!user });
    if (type && objectType) {
      fetchObjects();
    } else {
      console.log('Missing dependencies for fetchObjects', { type, objectType });
      setLoading(false);
    }
  }, [type, objectType, userLocation]); // Add userLocation dependency to re-sort when location changes

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

      // Force refresh to get the latest objects
      fetchObjects(true);
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