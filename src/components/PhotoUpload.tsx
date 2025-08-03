import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Upload, Image } from 'lucide-react';
import { useCamera, PhotoWithLocation } from '@/hooks/useCamera';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhotoUploadProps {
  onUpload: (data: {
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    price: number;
  }) => Promise<void>;
  objectType: 'abandoned' | 'donation' | 'product';
  onCancel?: () => void;
}

export const PhotoUpload = ({ onUpload, objectType, onCancel }: PhotoUploadProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(objectType === 'donation' ? 0 : 50);
  const [photo, setPhoto] = useState<PhotoWithLocation | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { capturePhotoWithLocation, isLoading: isCameraLoading } = useCamera();
  const { userLocation, getCurrentLocation } = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is authenticated
  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Debes iniciar sesión para publicar objetos</p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="mt-4">
              Cerrar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // For abandoned items, only camera is allowed
  const allowGallery = objectType !== 'abandoned';

  const handleCapturePhoto = async () => {
    const photoData = await capturePhotoWithLocation();
    if (photoData) {
      setPhoto(photoData);
      toast.success('Foto capturada con ubicación!');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    // For non-abandoned items, we need to get current location if not available
    if (!userLocation) {
      toast.error('Necesitamos tu ubicación para publicar. Por favor activa la ubicación.');
      await getCurrentLocation();
      return;
    }

    try {
      setUploadingImage(true);

      // Upload image to Supabase storage
      const timestamp = Date.now();
      const fileName = `${user?.id}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);

      // Create photo data with current location
      const photoData: PhotoWithLocation = {
        image: urlData.publicUrl,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };

      setPhoto(photoData);
      toast.success('Imagen subida correctamente!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo) {
      toast.error('Por favor captura o sube una foto primero');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Por favor ingresa un título');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload({
        title: title.trim(),
        description: description.trim(),
        image: photo.image,
        latitude: photo.latitude,
        longitude: photo.longitude,
        price,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice(50);
      setPhoto(null);
      toast.success('¡Objeto publicado exitosamente!');
    } catch (error) {
      toast.error('Error al publicar el objeto');
    } finally {
      setIsUploading(false);
    }
  };

  const getTitle = () => {
    switch (objectType) {
      case 'abandoned': return 'Compartir Objeto Abandono';
      case 'donation': return 'Publicar Donación';
      case 'product': return 'Vender Producto';
      default: return 'Publicar Objeto';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Capture/Upload */}
          <div className="space-y-2">
            <div className={`grid ${allowGallery ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              <Button
                type="button"
                onClick={handleCapturePhoto}
                disabled={isCameraLoading || uploadingImage}
                className="w-full"
                variant="outline"
              >
                {isCameraLoading ? (
                  'Capturando...'
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Cámara
                  </>
                )}
              </Button>
              
              {allowGallery && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isCameraLoading || uploadingImage}
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCameraLoading || uploadingImage}
                    className="w-full"
                    variant="outline"
                  >
                    {uploadingImage ? (
                      'Subiendo...'
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Galería
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            
            {photo && (
              <div className="space-y-2">
                <img 
                  src={photo.image} 
                  alt="Captured object" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  Ubicación: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej., Carrito de Compras Oxidado"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el objeto y su condición..."
              rows={3}
            />
          </div>

          {/* Price - only for abandoned and product */}
          {objectType !== 'donation' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {objectType === 'product' ? 'Precio ($)' : 'Precio de Coordenadas ($)'}
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={1000}
              />
            </div>
          )}

          <div className="flex gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isUploading || !photo || uploadingImage}
            >
            {isUploading ? (
              'Publicando...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Publicar
              </>
            )}
          </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};