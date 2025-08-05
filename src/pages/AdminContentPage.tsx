import { useAuth } from '@/hooks/useAuth';
import { SampleDataManager } from '@/components/SampleDataManager';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';

const AdminContentPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex-1 p-4 max-w-6xl mx-auto w-full">
      {/* Warning Card */}
      <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <AlertTriangle className="w-5 h-5" />
            Herramienta de Administración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
            <p className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Esta herramienta está diseñada para mejorar la demostración de la aplicación.
            </p>
            <p>• Los datos se cargarán con tu usuario actual</p>
            <p>• Las imágenes son generadas automáticamente para la demostración</p>
            <p>• Puedes eliminar todos los datos en cualquier momento</p>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Manager */}
      <SampleDataManager />
    </div>
  );
};

export default AdminContentPage;