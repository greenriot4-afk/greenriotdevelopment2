import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Use role-based access control instead of hardcoded email
  if (!isAdmin()) {
    return <Navigate to="/app/abandons" replace />;
  }

  return <>{children}</>;
};