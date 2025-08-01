import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFirstLogin = () => {
  const { user } = useAuth();
  const { getCurrentLocation } = useLocation();
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    // Only show location dialog for authenticated users
    if (!user) return;

    const checkFirstLogin = async () => {
      try {
        // Check if user has location data in their profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('latitude, longitude')
          .eq('user_id', user.id)
          .maybeSingle();

        // If no location data, this is likely their first login
        if (!profile?.latitude || !profile?.longitude) {
          setShowLocationDialog(true);
        }
      } catch (error) {
        console.error('Error checking first login:', error);
      }
    };

    checkFirstLogin();
  }, [user]);

  const handleLocationAccept = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation(true);
      if (location) {
        toast.success('¡Ubicación configurada correctamente!');
        setShowLocationDialog(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('No se pudo obtener la ubicación');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationDecline = () => {
    setShowLocationDialog(false);
    toast.info('Puedes configurar tu ubicación más tarde en tu perfil');
  };

  return {
    showLocationDialog,
    isGettingLocation,
    handleLocationAccept,
    handleLocationDecline,
  };
};