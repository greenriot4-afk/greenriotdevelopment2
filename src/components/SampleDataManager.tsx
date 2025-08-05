import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Database, MapPin, Package, Heart, Store, Trash2, CheckCircle, AlertCircle, Shield, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface SampleDataItem {
  type: 'abandoned' | 'donation' | 'product' | 'market';
  title: string;
  description: string;
  imageFile?: File;
  imagePath?: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  price?: number;
  acceptsDonations?: boolean; // Para mercados
}

const SAMPLE_DATA: SampleDataItem[] = [
  // Objetos abandonados
  {
    type: 'abandoned',
    title: 'Bicicleta de montaña',
    description: 'Bicicleta azul encontrada en el parque. Parece en buen estado pero necesita una revisión.',
    location: { latitude: 40.4168, longitude: -3.7038, name: 'Retiro, Madrid' },
    price: 3
  },
  {
    type: 'abandoned',
    title: 'Silla de oficina',
    description: 'Silla ergonómica abandonada cerca de la estación. Funciona bien.',
    location: { latitude: 41.3851, longitude: 2.1734, name: 'Barcelona Centro' },
    price: 2
  },
  {
    type: 'abandoned',
    title: 'Mesa de madera',
    description: 'Mesa pequeña de madera maciza. Tiene algunos arañazos pero es sólida.',
    location: { latitude: 39.4699, longitude: -0.3763, name: 'Valencia Centro' },
    price: 4
  },
  
  // Donaciones
  {
    type: 'donation',
    title: 'Ropa de bebé',
    description: 'Lote de ropa para bebés de 0-12 meses en excelente estado. Todo lavado y organizado.',
    location: { latitude: 40.4168, longitude: -3.7038, name: 'Chamberí, Madrid' },
    price: 0
  },
  {
    type: 'donation',
    title: 'Libros de texto universitarios',
    description: 'Colección de libros de ingeniería informática. Años 2020-2023.',
    location: { latitude: 41.3851, longitude: 2.1734, name: 'Eixample, Barcelona' },
    price: 0
  },
  {
    type: 'donation',
    title: 'Juguetes educativos',
    description: 'Lote de juguetes Montessori para niños de 3-6 años. Madera natural.',
    location: { latitude: 43.2627, longitude: -2.9253, name: 'Bilbao Centro' },
    price: 0
  },

  // Productos
  {
    type: 'product',
    title: 'iPhone 12 128GB',
    description: 'iPhone 12 en perfecto estado, con caja original y accesorios. Libre.',
    location: { latitude: 40.4168, longitude: -3.7038, name: 'Malasaña, Madrid' },
    price: 450
  },
  {
    type: 'product',
    title: 'Bicicleta eléctrica',
    description: 'E-bike Xiaomi con 2 años de uso. Batería en excelente estado. Incluye casco.',
    location: { latitude: 41.3851, longitude: 2.1734, name: 'Gràcia, Barcelona' },
    price: 800
  },
  {
    type: 'product',
    title: 'Sofá de 3 plazas',
    description: 'Sofá cómodo en color gris, perfecto para salón. Recogida en domicilio.',
    location: { latitude: 37.3891, longitude: -5.9845, name: 'Sevilla Centro' },
    price: 200
  },

  // Mercados circulares
  {
    type: 'market',
    title: 'Mercado Verde Retiro',
    description: 'Mercado de segunda mano enfocado en sostenibilidad. Productos eco-friendly y vintage.',
    location: { latitude: 40.4152, longitude: -3.6844, name: 'Parque del Retiro, Madrid' },
    acceptsDonations: true
  },
  {
    type: 'market',
    title: 'Mercat de Gràcia',
    description: 'Mercadillo local con productos artesanales y de segunda mano. Ambiente familiar.',
    location: { latitude: 41.4036, longitude: 2.1565, name: 'Plaza de la Vila de Gràcia, Barcelona' },
    acceptsDonations: false
  },
  {
    type: 'market',
    title: 'Mercado Solidario Valencia',
    description: 'Espacio dedicado a la economía circular y el intercambio comunitario.',
    location: { latitude: 39.4699, longitude: -0.3763, name: 'Ciudad de las Artes, Valencia' },
    acceptsDonations: true
  }
];

export const SampleDataManager = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('load');
  const [uploadedItems, setUploadedItems] = useState<string[]>([]);
  const { user } = useAuth();
  const { isAdmin, makeCurrentUserAdmin, loading: roleLoading } = useUserRole();

  const uploadImageToSupabase = async (file: File, fileName: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `sample-data/${fileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const loadSampleData = async () => {
    if (!user) {
      toast.error('Debes estar autenticado para cargar datos de muestra');
      return;
    }

    setLoading(true);
    setProgress(0);
    setUploadedItems([]);

    try {
      const totalItems = SAMPLE_DATA.length;
      
      for (let i = 0; i < SAMPLE_DATA.length; i++) {
        const item = SAMPLE_DATA[i];
        
        // Simular imagen (en un caso real, usarías las imágenes reales del usuario)
        const imageUrl = `https://picsum.photos/400/300?random=${i + 1}`;
        
        if (item.type === 'market') {
          // Crear mercado circular
          const { error } = await supabase
            .from('circular_markets')
            .insert({
              user_id: user.id,
              title: item.title,
              description: item.description,
              image_url: imageUrl,
              latitude: item.location.latitude,
              longitude: item.location.longitude,
              location_name: item.location.name,
              accepts_donations: item.acceptsDonations || false,
              is_active: true
            });

          if (error) throw error;
        } else {
          // Crear objeto (abandoned, donation, product)
          const { error } = await supabase
            .from('objects')
            .insert({
              user_id: user.id,
              type: item.type,
              title: item.title,
              description: item.description,
              image_url: imageUrl,
              latitude: item.location.latitude,
              longitude: item.location.longitude,
              price_credits: item.price || 0,
              is_sold: false
            });

          if (error) throw error;
        }

        setUploadedItems(prev => [...prev, `${item.type}: ${item.title}`]);
        setProgress(((i + 1) / totalItems) * 100);
        
        // Pequeña pausa para mostrar el progreso
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`¡${totalItems} elementos de muestra cargados exitosamente!`);
    } catch (error) {
      console.error('Error loading sample data:', error);
      toast.error('Error al cargar los datos de muestra');
    } finally {
      setLoading(false);
    }
  };

  const clearAbandonedObjects = async () => {
    if (!user) {
      toast.error('Debes estar autenticado');
      return;
    }

    const isGlobalDelete = isAdmin();
    const confirmMessage = isGlobalDelete 
      ? '¿Estás seguro de que quieres eliminar TODOS los objetos abandonados de TODOS los usuarios? Esta acción no se puede deshacer.'
      : '¿Estás seguro de que quieres eliminar TODOS los objetos abandonados de tu usuario? Esta acción no se puede deshacer.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      console.log('Admin delete - User:', user?.id, 'IsAdmin:', isGlobalDelete);
      
      // Si es admin, eliminar todos los objetos abandonados, sino solo los del usuario
      const query = supabase
        .from('objects')
        .delete()
        .eq('type', 'abandoned');

      if (!isGlobalDelete) {
        query.eq('user_id', user.id);
      }

      console.log('Executing delete query for abandoned objects, global:', isGlobalDelete);
      const { data, error, count } = await query;
      console.log('Delete result:', { data, error, count });

      if (error) throw error;

      const message = isGlobalDelete 
        ? `Todos los objetos abandonados han sido eliminados (todos los usuarios) - ${count || 0} elementos`
        : `Todos los objetos abandonados han sido eliminados (tu usuario) - ${count || 0} elementos`;
      
      toast.success(message);
      setUploadedItems(prev => prev.filter(item => !item.startsWith('abandoned:')));
    } catch (error) {
      console.error('Error clearing abandoned objects:', error);
      toast.error('Error al eliminar los objetos abandonados: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!user) {
      toast.error('Debes estar autenticado');
      return;
    }

    const isGlobalDelete = isAdmin();
    const confirmMessage = isGlobalDelete 
      ? '¿Estás seguro de que quieres eliminar TODOS los datos de TODOS los usuarios? Esta acción no se puede deshacer.'
      : '¿Estás seguro de que quieres eliminar TODOS tus datos? Esta acción no se puede deshacer.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      // Eliminar objetos
      const objectsQuery = supabase.from('objects').delete();
      if (!isGlobalDelete) {
        objectsQuery.eq('user_id', user.id);
      }
      
      const { error: objectsError } = await objectsQuery;
      if (objectsError) throw objectsError;

      // Eliminar mercados
      const marketsQuery = supabase.from('circular_markets').delete();
      if (!isGlobalDelete) {
        marketsQuery.eq('user_id', user.id);
      }
      
      const { error: marketsError } = await marketsQuery;
      if (marketsError) throw marketsError;

      const message = isGlobalDelete 
        ? 'Todos los datos han sido eliminados (todos los usuarios)'
        : 'Todos tus datos han sido eliminados';
      
      toast.success(message);
      setUploadedItems([]);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Error al eliminar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    try {
      await makeCurrentUserAdmin();
      toast.success('¡Ahora eres administrador! Puedes gestionar contenido de todos los usuarios.');
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Error al otorgar permisos de administrador');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'abandoned': return <MapPin className="w-4 h-4" />;
      case 'donation': return <Heart className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'market': return <Store className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      abandoned: 'destructive',
      donation: 'default',
      product: 'secondary',
      market: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'default'}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gestor de Contenido de Muestra
            {isAdmin() && (
              <Badge variant="destructive" className="ml-2">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Admin privileges card */}
          {!isAdmin() && (
            <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Permisos de Administrador
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Actualmente solo puedes gestionar tu propio contenido. Obtén permisos de admin para gestionar contenido de todos los usuarios.
                    </p>
                  </div>
                  <Button 
                    onClick={handleMakeAdmin}
                    disabled={loading || roleLoading}
                    size="sm"
                    className="ml-4"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    Hacer Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="load">Cargar Datos</TabsTrigger>
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            </TabsList>

            <TabsContent value="load" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Cargar Contenido Realista
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Carga {SAMPLE_DATA.length} elementos de muestra con contenido realista para mejorar la apariencia de la app.
                  </p>
                  <Button 
                    onClick={loadSampleData} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Cargando...' : 'Cargar Datos de Muestra'}
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Eliminar Abandonados
                    {isAdmin() && <Badge variant="outline" className="text-xs">Global</Badge>}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isAdmin() 
                      ? 'Elimina TODOS los objetos abandonados de TODOS los usuarios.'
                      : 'Elimina únicamente los objetos abandonados de tu usuario.'
                    }
                  </p>
                  <Button 
                    onClick={clearAbandonedObjects} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? 'Eliminando...' : 'Eliminar Abandonados'}
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Eliminar Todos los Datos
                    {isAdmin() && <Badge variant="destructive" className="text-xs">Global</Badge>}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isAdmin() 
                      ? 'Elimina TODOS los objetos y mercados de TODOS los usuarios.'
                      : 'Elimina todos los objetos y mercados creados por tu usuario.'
                    }
                  </p>
                  <Button 
                    onClick={clearAllData} 
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    {loading ? 'Eliminando...' : 'Eliminar Todos los Datos'}
                  </Button>
                </Card>
              </div>

              {loading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progreso</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {uploadedItems.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Elementos Cargados ({uploadedItems.length})
                  </h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {uploadedItems.map((item, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="font-semibold">Vista Previa del Contenido ({SAMPLE_DATA.length} elementos)</h3>
                
                {['abandoned', 'donation', 'product', 'market'].map(type => {
                  const items = SAMPLE_DATA.filter(item => item.type === type);
                  return (
                    <Card key={type} className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        {getTypeBadge(type)}
                        <span>({items.length} elementos)</span>
                      </h4>
                      <div className="grid gap-2">
                        {items.map((item, index) => (
                          <div key={index} className="border rounded p-3 text-sm">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-muted-foreground">{item.description}</div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.location.name}
                              </span>
                              {item.price !== undefined && (
                                <span>{item.price > 0 ? `$${item.price}` : 'Gratis'}</span>
                              )}
                              {item.acceptsDonations !== undefined && (
                                <span>{item.acceptsDonations ? 'Acepta donaciones' : 'Solo venta'}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};