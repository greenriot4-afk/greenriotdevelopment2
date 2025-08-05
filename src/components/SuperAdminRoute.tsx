import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando permisos de superadministrador...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Only allow access to specific superadmin
  if (user.email !== 'inigoloperena@gmail.com') {
    return <Navigate to="/app/abandons" replace />;
  }

  return <>{children}</>;
};