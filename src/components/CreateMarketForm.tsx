import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Camera, MapPin, Upload, Store } from 'lucide-react';
import { useCamera, PhotoWithLocation } from '@/hooks/useCamera';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

interface CreateMarketFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    locationName: string;
    acceptsDonations: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
}

export const CreateMarketForm = ({ onSubmit, onCancel }: CreateMarketFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [acceptsDonations, setAcceptsDonations] = useState(false);
  const [photo, setPhoto] = useState<PhotoWithLocation | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { capturePhotoWithLocation, isLoading: isCameraLoading } = useCamera();
  const { userLocation, getCurrentLocation, isLoading: locationLoading } = useLocation();

  const handleCapturePhoto = async () => {
    const photoData = await capturePhotoWithLocation();
    if (photoData) {
      setPhoto(photoData);
      toast.success('Foto capturada con ubicación!');
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
      toast.error('Por favor captura una foto del mercadillo');
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
        locationName: locationName.trim() || 'Mercadillo',
        acceptsDonations,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocationName('');
      setAcceptsDonations(false);
      setPhoto(null);
      setUseCurrentLocation(false);
      toast.success('¡Mercadillo creado exitosamente!');
    } catch (error) {
      toast.error('Error al crear el mercadillo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Crear Mercadillo Circular
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Capture */}
          <div className="space-y-2">
            <Label>Foto del Mercadillo *</Label>
            <Button
              type="button"
              onClick={handleCapturePhoto}
              disabled={isCameraLoading}
              className="w-full"
              variant="outline"
            >
              {isCameraLoading ? (
                'Capturando...'
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar Foto & Ubicación
                </>
              )}
            </Button>
            
            {photo && (
              <div className="space-y-2">
                <img 
                  src={photo.image} 
                  alt="Foto del mercadillo" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  Ubicación: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* Alternative Location */}
          <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useCurrentLocation"
              checked={useCurrentLocation}
              onCheckedChange={(checked) => setUseCurrentLocation(!!checked)}
            />
            <Label htmlFor="useCurrentLocation" className="text-sm">
              Usar mi ubicación actual (sobrescribe la ubicación de la foto)
            </Label>
          </div>
            {useCurrentLocation && userLocation && (
              <div className="p-2 bg-muted rounded text-sm">
                <MapPin className="w-3 h-3 inline mr-1" />
                {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
              </div>
            )}
          </div>

          {/* Title */}
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

          {/* Location Name */}
          <div className="space-y-2">
            <Label htmlFor="locationName">Nombre del Lugar</Label>
            <Input
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ej: Plaza Central, Garaje de Maria"
            />
          </div>

          {/* Description */}
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

          {/* Accepts Donations */}
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
              disabled={isSubmitting || !photo || !title.trim()}
            >
              {isSubmitting ? (
                'Creando...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Crear Mercadillo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};