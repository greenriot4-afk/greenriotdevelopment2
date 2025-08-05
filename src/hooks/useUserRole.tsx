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
      console.log('useUserRole: No user found');
      setRoles([]);
      setLoading(false);
      return;
    }

    console.log('useUserRole: Fetching roles for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log('useUserRole: Query result:', { data, error });

      if (error) throw error;

      const userRoles = data?.map(r => r.role as UserRole) || [];
      console.log('useUserRole: User roles:', userRoles);
      setRoles(userRoles);
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
    const adminStatus = hasRole('admin');
    console.log('useUserRole: isAdmin check:', adminStatus, 'roles:', roles);
    return adminStatus;
  };

  const makeCurrentUserAdmin = async (): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    console.log('useUserRole: Making user admin:', user.id);

    try {
      const { error } = await supabase.rpc('make_user_admin', {
        _user_id: user.id
      });

      console.log('useUserRole: make_user_admin result:', { error });

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