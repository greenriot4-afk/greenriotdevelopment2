import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Store, Car, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MarketProfile {
  type: 'thrift_store' | 'garage_sale';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  imageFile: File | null;
  acceptsDonations: boolean;
}

export const MarketProfileUploader = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('thrift');
  const [uploadedProfiles, setUploadedProfiles] = useState<string[]>([]);
  const { user } = useAuth();

  // Estados para tienda de segunda mano
  const [thriftStore, setThriftStore] = useState<MarketProfile>({
    type: 'thrift_store',
    title: '',
    description: '',
    location: { latitude: 40.7128, longitude: -74.0060, name: 'Nueva York, NY' },
    imageFile: null,
    acceptsDonations: true
  });

  // Estados para mercadillo de garaje
  const [garageSale, setGarageSale] = useState<MarketProfile>({
    type: 'garage_sale',
    title: '',
    description: '',
    location: { latitude: 40.7128, longitude: -74.0060, name: 'Nueva York, NY' },
    imageFile: null,
    acceptsDonations: false
  });

  const generateMarketContent = (type: 'thrift_store' | 'garage_sale', imageFile: File | null) => {
    if (type === 'thrift_store') {
      return {
        title: 'Tesoros Vintage - Tienda de Segunda Mano',
        description: 'Descubre piezas únicas y vintage en nuestra tienda de segunda mano. Especialistas en muebles restaurados, ropa vintage y objetos de colección. Cada pieza tiene su historia y ahora puede formar parte de la tuya. Aceptamos donaciones y ofrecemos precios justos para toda la familia.',
        acceptsDonations: true
      };
    } else {
      return {
        title: 'Mercadillo Familiar - Venta de Garaje',
        description: 'Venta especial de garaje con artículos del hogar, juguetes, libros y mucho más. Precios increíbles en productos bien cuidados. Perfecto para encontrar tesoros escondidos a precios de oportunidad. Solo efectivo. Horario limitado - ¡No te lo pierdas!',
        acceptsDonations: false
      };
    }
  };

  const generateRandomNYCCoordinates = () => {
    const minLat = 40.4774;
    const maxLat = 40.9176;
    const minLng = -74.2591;
    const maxLng = -73.7004;
    
    const latitude = minLat + Math.random() * (maxLat - minLat);
    const longitude = minLng + Math.random() * (maxLng - minLng);
    
    const neighborhoods = [
      'Manhattan, NY', 'Brooklyn, NY', 'Queens, NY', 'Bronx, NY',
      'Staten Island, NY', 'Chelsea, NY', 'SoHo, NY', 'Williamsburg, NY'
    ];
    
    return { 
      latitude, 
      longitude, 
      name: neighborhoods[Math.floor(Math.random() * neighborhoods.length)]
    };
  };

  const uploadImageToStorage = async (file: File, fileName: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `market-profiles/${fileName}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error subiendo imagen: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleImageUpload = (type: 'thrift_store' | 'garage_sale') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    if (type === 'thrift_store') {
      setThriftStore(prev => ({ ...prev, imageFile: file }));
    } else {
      setGarageSale(prev => ({ ...prev, imageFile: file }));
    }

    toast.success('Imagen seleccionada correctamente');
  };

  const createMarketProfile = async (profileData: MarketProfile) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    if (!profileData.imageFile) {
      throw new Error('Imagen requerida');
    }

    setProgress(25);

    // Generar contenido automático
    const generatedContent = generateMarketContent(profileData.type, profileData.imageFile);
    
    setProgress(50);

    // Subir imagen
    const imageUrl = await uploadImageToStorage(
      profileData.imageFile, 
      profileData.type
    );

    setProgress(75);

    // Generar coordenadas aleatorias de NYC
    const location = generateRandomNYCCoordinates();

    // Crear mercado en la base de datos
    const { error } = await supabase
      .from('circular_markets')
      .insert({
        user_id: user.id,
        title: generatedContent.title,
        description: generatedContent.description,
        image_url: imageUrl,
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: location.name,
        accepts_donations: generatedContent.acceptsDonations,
        is_active: true
      });

    if (error) {
      throw error;
    }

    setProgress(100);
    return generatedContent.title;
  };

  const handleCreateThriftStore = async () => {
    if (!thriftStore.imageFile) {
      toast.error('Por favor selecciona una imagen para la tienda de segunda mano');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const title = await createMarketProfile(thriftStore);
      setUploadedProfiles(prev => [...prev, `Tienda de Segunda Mano: ${title}`]);
      toast.success('¡Perfil de tienda de segunda mano creado exitosamente!');
      
      // Reset form
      setThriftStore(prev => ({ ...prev, imageFile: null }));
      // Reset file input
      const fileInput = document.getElementById('thrift-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error creating thrift store:', error);
      toast.error(`Error al crear tienda de segunda mano: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCreateGarageSale = async () => {
    if (!garageSale.imageFile) {
      toast.error('Por favor selecciona una imagen para el mercadillo de garaje');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const title = await createMarketProfile(garageSale);
      setUploadedProfiles(prev => [...prev, `Mercadillo de Garaje: ${title}`]);
      toast.success('¡Perfil de mercadillo de garaje creado exitosamente!');
      
      // Reset form
      setGarageSale(prev => ({ ...prev, imageFile: null }));
      // Reset file input
      const fileInput = document.getElementById('garage-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error creating garage sale:', error);
      toast.error(`Error al crear mercadillo de garaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Creador de Perfiles de Mercado
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sube imágenes para crear perfiles diferenciados de tiendas de segunda mano y mercadillos de garaje.
            El sistema generará automáticamente títulos y descripciones apropiadas para cada tipo.
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="thrift" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Tienda de Segunda Mano
              </TabsTrigger>
              <TabsTrigger value="garage" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Mercadillo de Garaje
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thrift" className="space-y-4">
              <Card className="p-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <Store className="w-8 h-8 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        Tienda de Segunda Mano (Thrift Store)
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                        Sube una imagen que represente una tienda de segunda mano profesional. 
                        Se generará automáticamente un perfil con enfoque en sostenibilidad, productos vintage y acepta donaciones.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="thrift-image" className="text-sm font-medium">
                            Imagen de la Tienda
                          </Label>
                          <Input
                            id="thrift-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload('thrift_store')}
                            disabled={loading}
                            className="mt-1"
                          />
                          {thriftStore.imageFile && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Imagen seleccionada: {thriftStore.imageFile.name}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleCreateThriftStore}
                          disabled={loading || !thriftStore.imageFile}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {loading ? 'Creando Perfil...' : 'Crear Tienda de Segunda Mano'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="garage" className="space-y-4">
              <Card className="p-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <Car className="w-8 h-8 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                        Mercadillo de Garaje (Garage Sale)
                      </h3>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                        Sube una imagen que represente un mercadillo de garaje familiar.
                        Se generará automáticamente un perfil casual con precios de oportunidad y enfoque temporal.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="garage-image" className="text-sm font-medium">
                            Imagen del Mercadillo
                          </Label>
                          <Input
                            id="garage-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload('garage_sale')}
                            disabled={loading}
                            className="mt-1"
                          />
                          {garageSale.imageFile && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Imagen seleccionada: {garageSale.imageFile.name}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleCreateGarageSale}
                          disabled={loading || !garageSale.imageFile}
                          className="w-full"
                          variant="outline"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {loading ? 'Creando Perfil...' : 'Crear Mercadillo de Garaje'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {loading && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creando perfil...</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {uploadedProfiles.length > 0 && (
            <Card className="p-4 mt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Perfiles Creados ({uploadedProfiles.length})
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {uploadedProfiles.map((profile, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {profile}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4 mt-4 border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20">
            <CardContent className="p-0">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                Información Importante
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Las imágenes se suben a tu cuenta personal y se generan coordenadas aleatorias de NYC</p>
                <p>• Los títulos y descripciones se generan automáticamente según el tipo de mercado</p>
                <p>• Las tiendas de segunda mano aceptan donaciones por defecto</p>
                <p>• Los mercadillos de garaje son solo de venta sin donaciones</p>
                <p>• Máximo 5MB por imagen, formatos soportados: JPG, PNG, WebP</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};