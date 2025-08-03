import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload, X, Image, ImagePlus, MapPin } from 'lucide-react';
import { useCamera, PhotoWithLocation } from '@/hooks/useCamera';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';
import { CircularMarket } from '@/components/MarketsList';

interface EditMarketFormProps {
  market: CircularMarket;
  onSubmit: (data: {
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    locationName: string;
    acceptsDonations: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export const EditMarketForm = ({ market, onSubmit, onCancel }: EditMarketFormProps) => {
  const [title, setTitle] = useState(market.title);
  const [description, setDescription] = useState(market.description || '');
  const [acceptsDonations, setAcceptsDonations] = useState(market.accepts_donations);
  const [photo, setPhoto] = useState<PhotoWithLocation | null>({
    image: market.image_url || '',
    latitude: market.latitude,
    longitude: market.longitude
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  
  const { capturePhotoWithLocation, selectFromGallery, isLoading: isCameraLoading } = useCamera();
  const { userLocation, getCurrentLocation, isLoading: locationLoading } = useLocation();

  const handleCapturePhoto = async () => {
    const photoData = await capturePhotoWithLocation();
    if (photoData) {
      setPhoto(photoData);
      setShowImageOptions(false);
      toast.success('Foto capturada con ubicación!');
    }
  };

  const handleSelectFromGallery = async () => {
    const photoData = await selectFromGallery();
    if (photoData) {
      setPhoto(photoData);
      setShowImageOptions(false);
      toast.success('Imagen seleccionada con ubicación!');
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!useCurrentLocation) {
      const location = await getCurrentLocation();
      if (location) {
        setUseCurrentLocation(true);
        toast.success('Ubicación actual obtenida');
      }
    } else {
      setUseCurrentLocation(false);
    }
  };

  const getLocationData = () => {
    if (useCurrentLocation && userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };
    }
    if (photo) {
      return {
        latitude: photo.latitude,
        longitude: photo.longitude
      };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Por favor ingresa un título');
      return;
    }

    const locationData = getLocationData();
    if (!locationData) {
      toast.error('Por favor captura una foto con ubicación o usa tu ubicación actual');
      return;
    }

    if (!photo) {
      toast.error('Por favor selecciona una imagen del mercadillo');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        image: photo.image,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        locationName: 'Mercadillo',
        acceptsDonations,
      });
      
      toast.success('¡Mercadillo actualizado exitosamente!');
    } catch (error) {
      toast.error('Error al actualizar el mercadillo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Editar Mercadillo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portada Mercadillo */}
          <div className="space-y-2">
            <Label>Portada mercadillo *</Label>
            
            {!showImageOptions ? (
              <Button
                type="button"
                onClick={() => setShowImageOptions(true)}
                disabled={isCameraLoading}
                className="w-full"
                variant="outline"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Cambiar portada
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={handleSelectFromGallery}
                    disabled={isCameraLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    Galería
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={isCameraLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Cámara
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowImageOptions(false)}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            )}
            
            {photo && (
              <div className="space-y-2">
                <img 
                  src={photo.image} 
                  alt="Portada del mercadillo" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  Ubicación: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* Localización mercadillo */}
          <div className="space-y-2">
            <Label>Localización del Mercadillo *</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCurrentLocation"
                checked={useCurrentLocation}
                onCheckedChange={(checked) => setUseCurrentLocation(!!checked)}
              />
              <Label htmlFor="useCurrentLocation" className="text-sm">
                Usar mi ubicación actual
              </Label>
            </div>
            {useCurrentLocation && userLocation && (
              <div className="p-2 bg-muted rounded text-sm">
                <MapPin className="w-3 h-3 inline mr-1" />
                {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
              </div>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Mercadillo de Barrio Norte"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu mercadillo, horarios, tipo de productos..."
              rows={3}
            />
          </div>

          {/* Checkbox trabajamos con donaciones */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptsDonations"
              checked={acceptsDonations}
              onCheckedChange={(checked) => setAcceptsDonations(!!checked)}
            />
            <Label htmlFor="acceptsDonations" className="text-sm">
              Trabajamos con donaciones
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting || !photo || !title.trim()}
            >
              {isSubmitting ? (
                'Actualizando...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};