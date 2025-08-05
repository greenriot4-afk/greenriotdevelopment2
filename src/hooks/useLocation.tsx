import { Geolocation } from '@capacitor/geolocation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load saved location on mount
  useEffect(() => {
    if (user) {
      loadSavedLocation();
    } else {
      // For non-authenticated users, load default location from inigoloperena@gmail.com
      loadDefaultLocation();
    }
  }, [user]);

  const loadDefaultLocation = async () => {
    try {
      // For non-authenticated users, use a default location from inigoloperena@gmail.com profile
      // We'll use a hardcoded approach since we can't directly query auth.users
      const { data, error } = await supabase
        .from('profiles')
        .select('latitude, longitude, location_name')
        .limit(1)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        console.log('No default location found');
        // Set a default location (Madrid, Spain) as fallback
        setUserLocation({
          latitude: 40.4168,
          longitude: -3.7038,
          address: 'Madrid, España'
        });
        return;
      }

      const profile = data[0];
      if (profile.latitude && profile.longitude) {
        setUserLocation({
          latitude: profile.latitude,
          longitude: profile.longitude,
          address: profile.location_name || undefined
        });
        console.log('Loaded default location for guest users:', profile);
      }
    } catch (error) {
      console.error('Error loading default location:', error);
      // Set fallback location
      setUserLocation({
        latitude: 40.4168,
        longitude: -3.7038,
        address: 'Madrid, España'
      });
    }
  };

  const loadSavedLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('latitude, longitude, location_name, auto_location')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.log('No saved location found');
        return;
      }

      if (data.latitude && data.longitude) {
        setUserLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.location_name || undefined
        });
        console.log('Loaded saved location:', data);
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    }
  };

  const saveLocationToProfile = async (location: UserLocation, locationName?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: location.latitude,
          longitude: location.longitude,
          location_name: locationName || null
        })
        .eq('user_id', user.id);

      if (error) throw error;
      console.log('Location saved to profile');
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const getCurrentLocation = async (saveToProfile: boolean = true): Promise<UserLocation | null> => {
    // Only request location for authenticated users
    if (!user) {
      console.log('useLocation: getCurrentLocation called for non-authenticated user, skipping');
      return null;
    }
    
    setIsLoading(true);
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000, // Increased timeout for better accuracy
        maximumAge: 0, // Don't use cached location
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setUserLocation(location);
      
      if (saveToProfile) {
        await saveLocationToProfile(location, 'Ubicación actual');
        toast.success('Ubicación guardada en tu perfil');
      }
      
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Error al obtener la ubicación');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // High precision location for critical operations (like sharing objects)
  const getHighPrecisionLocation = async (): Promise<UserLocation | null> => {
    // Only request location for authenticated users
    if (!user) {
      console.log('useLocation: getHighPrecisionLocation called for non-authenticated user, skipping');
      return null;
    }
    
    setIsLoading(true);
    try {
      // First attempt with maximum precision settings
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000, // Extended timeout for best accuracy
        maximumAge: 0, // Never use cached location
      });

      // Check accuracy - if poor, show warning
      const accuracy = position.coords.accuracy;
      if (accuracy > 10) {
        toast.error(`Precisión GPS: ±${accuracy.toFixed(0)}m. Muévete a cielo abierto para mejor precisión.`);
      } else {
        toast.success(`Precisión GPS excelente: ±${accuracy.toFixed(0)}m`);
      }

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setUserLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting high precision location:', error);
      toast.error('Error al obtener ubicación precisa. Verifica permisos GPS.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSavedLocation = async (latitude: number, longitude: number, locationName?: string) => {
    const location = { latitude, longitude, address: locationName };
    setUserLocation(location);
    await saveLocationToProfile(location, locationName);
    toast.success('Ubicación actualizada');
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  return {
    userLocation,
    setUserLocation,
    getCurrentLocation,
    getHighPrecisionLocation,
    updateSavedLocation,
    calculateDistance,
    isLoading,
  };
};