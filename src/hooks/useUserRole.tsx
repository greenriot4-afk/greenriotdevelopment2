import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRoles = async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      setRoles(data?.map(r => r.role as UserRole) || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const makeCurrentUserAdmin = async (): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase.rpc('make_user_admin', {
        _user_id: user.id
      });

      if (error) throw error;

      // Refresh roles after making user admin
      await fetchUserRoles();
    } catch (error) {
      console.error('Error making user admin:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    makeCurrentUserAdmin,
    refreshRoles: fetchUserRoles
  };
};