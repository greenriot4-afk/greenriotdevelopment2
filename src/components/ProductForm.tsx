import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, X, Image, ImagePlus } from 'lucide-react';
import { useCamera, PhotoWithLocation } from '@/hooks/useCamera';
import { toast } from 'sonner';

export interface Product {
  id?: string;
  title: string;
  description?: string;
  type: 'product' | 'donation';
  price_credits?: number;
  image_url: string;
  latitude: number;
  longitude: number;
  market_id: string;
  user_id: string;
  is_sold?: boolean;
}

interface ProductFormProps {
  product?: Product;
  marketId: string;
  onSubmit: (productData: Omit<Product, 'id' | 'user_id'>) => Promise<void>;
  onCancel: () => void;
}

export const ProductForm = ({ product, marketId, onSubmit, onCancel }: ProductFormProps) => {
  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [type, setType] = useState<'product' | 'donation'>(product?.type || 'product');
  const [priceCredits, setPriceCredits] = useState(product?.price_credits?.toString() || '');
  const [photo, setPhoto] = useState<PhotoWithLocation | null>(
    product ? {
      image: product.image_url,
      latitude: product.latitude,
      longitude: product.longitude
    } : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  
  const { capturePhotoWithLocation, selectFromGallery, isLoading: isCameraLoading } = useCamera();

  const handleCapturePhoto = async () => {
    const photoData = await capturePhotoWithLocation();
    if (photoData) {
      setPhoto(photoData);
      setShowImageOptions(false);
      toast.success('Foto capturada!');
    }
  };

  const handleSelectFromGallery = async () => {
    const photoData = await selectFromGallery();
    if (photoData) {
      setPhoto(photoData);
      setShowImageOptions(false);
      toast.success('Imagen seleccionada!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Por favor ingresa un título');
      return;
    }

    if (!photo) {
      toast.error('Por favor agrega una imagen');
      return;
    }

    if (type === 'product' && (!priceCredits || parseInt(priceCredits) <= 0)) {
      toast.error('Por favor ingresa un precio válido para el producto');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        type,
        price_credits: type === 'product' ? parseInt(priceCredits) : 0,
        image_url: photo.image,
        latitude: photo.latitude,
        longitude: photo.longitude,
        market_id: marketId,
      });
      
      // Reset form if it's a new product
      if (!product) {
        setTitle('');
        setDescription('');
        setType('product');
        setPriceCredits('');
        setPhoto(null);
      }
      
      toast.success(product ? 'Producto actualizado!' : 'Producto creado!');
    } catch (error) {
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {product ? 'Editar' : 'Nuevo'} {type === 'product' ? 'Producto' : 'Donación'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={type} onValueChange={(value: 'product' | 'donation') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Producto</SelectItem>
                <SelectItem value="donation">Donación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen *</Label>
            
            {!showImageOptions ? (
              <Button
                type="button"
                onClick={() => setShowImageOptions(true)}
                disabled={isCameraLoading}
                className="w-full"
                variant="outline"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                {photo ? 'Cambiar imagen' : 'Agregar imagen'}
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
                <div className="relative">
                  <img 
                    src={photo.image} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setPhoto(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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
              placeholder="Ej: Silla vintage, Ropa de bebé..."
              required
            />
          </div>

          {/* Precio (solo para productos) */}
          {type === 'product' && (
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={priceCredits}
                onChange={(e) => setPriceCredits(e.target.value)}
                placeholder="Ej: 5"
                required
              />
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el estado, características, etc..."
              rows={3}
            />
          </div>

          {/* Botones */}
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
                'Guardando...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {product ? 'Actualizar' : 'Crear'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};