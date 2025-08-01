import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { useState } from 'react';
import { toast } from 'sonner';

export interface PhotoWithLocation {
  image: string;
  latitude: number;
  longitude: number;
}

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);

  const capturePhotoWithLocation = async (): Promise<PhotoWithLocation | null> => {
    setIsLoading(true);
    try {
      // Request permissions and capture photo
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 80,
        width: 1024,
        height: 1024,
      });

      if (!photo.dataUrl) {
        toast.error('Failed to capture photo');
        return null;
      }

      // Get current location
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        image: photo.dataUrl,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error('Error capturing photo with location:', error);
      toast.error('Failed to capture photo or get location');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    capturePhotoWithLocation,
    isLoading,
  };
};