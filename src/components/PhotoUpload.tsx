import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Upload } from 'lucide-react';
import { useCamera, PhotoWithLocation } from '@/hooks/useCamera';
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
  
  const { capturePhotoWithLocation, isLoading: isCameraLoading } = useCamera();

  const handleCapturePhoto = async () => {
    const photoData = await capturePhotoWithLocation();
    if (photoData) {
      setPhoto(photoData);
      toast.success('Photo captured with location!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo) {
      toast.error('Please capture a photo first');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title');
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
      toast.success('Object uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload object');
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
          {/* Photo Capture */}
          <div className="space-y-2">
            <Button
              type="button"
              onClick={handleCapturePhoto}
              disabled={isCameraLoading}
              className="w-full"
              variant="outline"
            >
              {isCameraLoading ? (
                'Capturing...'
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo & Location
                </>
              )}
            </Button>
            
            {photo && (
              <div className="space-y-2">
                <img 
                  src={photo.image} 
                  alt="Captured object" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  Location captured: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rusty Shopping Cart"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the object and its condition..."
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
              disabled={isUploading || !photo}
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