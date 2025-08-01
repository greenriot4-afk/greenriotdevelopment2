import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({ onImageUploaded, disabled }: ImageUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    if (!user) return;

    try {
      setUploading(true);

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);

      onImageUploaded(urlData.publicUrl);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      {previewUrl && (
        <div className="mb-2 relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-w-full h-32 object-cover rounded-lg border"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white"
            onClick={clearPreview}
          >
            <X className="w-3 h-3" />
          </Button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-10 h-10"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Image className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};