import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Favorite {
  id: string;
  user_id: string;
  object_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (objectId: string): boolean => {
    return favorites.some(fav => fav.object_id === objectId);
  };

  const toggleFavorite = async (objectId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return;
    }

    const isCurrentlyFavorite = isFavorite(objectId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('object_id', objectId);

        if (error) throw error;

        setFavorites(prev => prev.filter(fav => fav.object_id !== objectId));
        toast.success('Eliminado de favoritos');
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            object_id: objectId
          })
          .select()
          .single();

        if (error) throw error;

        setFavorites(prev => [...prev, data]);
        toast.success('Agregado a favoritos');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      if (error.code === '23505') {
        // Unique constraint violation - already exists
        toast.error('Este objeto ya está en favoritos');
      } else {
        toast.error('Error al actualizar favoritos');
      }
    }
  };

  const getFavoriteObjects = async () => {
    if (!user || favorites.length === 0) {
      return [];
    }

    try {
      const objectIds = favorites.map(fav => fav.object_id);
      
      const { data, error } = await supabase
        .from('objects')
        .select(`
          id,
          title,
          description,
          image_url,
          latitude,
          longitude,
          price_credits,
          is_sold,
          created_at,
          type,
          user_id,
          profiles!objects_user_id_fkey (
            display_name,
            username
          )
        `)
        .in('id', objectIds);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching favorite objects:', error);
      toast.error('Error al cargar objetos favoritos');
      return [];
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    getFavoriteObjects,
    refetch: fetchFavorites
  };
};