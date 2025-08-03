import { useState, useEffect, useCallback } from 'react';
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

interface UseObjectsOptions {
  objectType: 'abandoned' | 'donation' | 'product';
  userLocation?: { latitude: number; longitude: number } | null;
  calculateDistance?: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export const useObjects = ({ objectType, userLocation, calculateDistance }: UseObjectsOptions) => {
  const [objects, setObjects] = useState<AppObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchObjects = useCallback(async (forceRefresh = false) => {
    try {
      // Cache for 30 seconds to avoid unnecessary API calls
      const now = Date.now();
      if (!forceRefresh && lastFetch && (now - lastFetch) < 30000) {
        console.log('Using cached objects, skipping fetch');
        return objects;
      }

      console.log('fetchObjects called - using simple approach', { objectType, forceRefresh });
      setLoading(true);
      
      // Simple, reliable query for objects
      const { data: objectsData, error: objectsError } = await supabase
        .from('objects')
        .select('*')
        .eq('type', objectType)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (objectsError) {
        console.error('Objects query error:', objectsError);
        throw objectsError;
      }

      console.log('Objects fetched successfully:', objectsData?.length);

      if (!objectsData || objectsData.length === 0) {
        setObjects([]);
        setLastFetch(now);
        return [];
      }

      // Transform the data with default user info (skip profiles for now)
      const enrichedObjects = objectsData.map((object) => ({
        ...object,
        type: object.type as 'abandoned' | 'donation' | 'product',
        description: object.description || undefined,
        is_sold: object.is_sold || false,
        user_display_name: 'Usuario',
        username: ''
      }));

      // Sort objects by distance if user location is available
      let sortedObjects = enrichedObjects as AppObject[];
      if (userLocation && calculateDistance) {
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
      setLastFetch(now);
      console.log('Objects loaded successfully from materialized view:', sortedObjects.length);
      return sortedObjects;
    } catch (error) {
      console.error('Error fetching objects:', error);
      toast.error('Error al cargar los objetos');
      setObjects([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [objectType, userLocation, calculateDistance, lastFetch, objects]);

  const addObject = useCallback((newObject: AppObject) => {
    setObjects(prev => [newObject, ...prev]);
    setLastFetch(0); // Reset cache to force refresh next time
  }, []);

  const updateObject = useCallback((objectId: string, updates: Partial<AppObject>) => {
    setObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, ...updates } : obj
    ));
  }, []);

  const removeObject = useCallback((objectId: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== objectId));
  }, []);

  return {
    objects,
    loading,
    fetchObjects,
    addObject,
    updateObject,
    removeObject,
    refreshObjects: () => fetchObjects(true)
  };
};