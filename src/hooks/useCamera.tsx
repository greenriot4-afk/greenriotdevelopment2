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
      console.log('Starting photo capture with location...');
      
      // Check if we're running in a Capacitor environment
      const { Capacitor } = await import('@capacitor/core');
      const isNative = Capacitor.isNativePlatform();
      
      console.log('Platform detected:', isNative ? 'Native' : 'Web');

      let photo;
      let position;

      if (isNative) {
        // Native platform - request permissions first
        console.log('Requesting camera permissions...');
        
        try {
          // Request camera permissions
          const cameraPermissions = await Camera.requestPermissions({ permissions: ['camera'] });
          console.log('Camera permissions:', cameraPermissions);
          
          if (cameraPermissions.camera === 'denied') {
            toast.error('Se necesitan permisos de cámara. Actívalos en configuración.');
            setIsLoading(false);
            return null;
          }

          // Request location permissions
          const locationPermissions = await Geolocation.requestPermissions();
          console.log('Location permissions:', locationPermissions);
          
          if (locationPermissions.location === 'denied') {
            toast.error('Se necesitan permisos de ubicación. Actívalos en configuración.');
            setIsLoading(false);
            return null;
          }

          // Capture photo
          console.log('Capturing photo...');
          photo = await Camera.getPhoto({
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera,
            quality: 80,
            width: 1024,
            height: 1024,
          });

        } catch (cameraError) {
          console.error('Camera error:', cameraError);
          toast.error('Error al acceder a la cámara. Verifica los permisos.');
          setIsLoading(false);
          return null;
        }
      } else {
        // Web platform - use browser APIs with fallback
        console.log('Using web camera API...');
        
        try {
          // Check if camera is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera not available in this browser');
          }

          // For web, we need to implement our own camera capture
          // For now, fallback to file input
          toast.error('Para capturar fotos, usa el botón "Galería" en navegadores web.');
          setIsLoading(false);
          return null;
        } catch (webError) {
          console.error('Web camera error:', webError);
          toast.error('La cámara no está disponible en este navegador. Usa el botón "Galería".');
          setIsLoading(false);
          return null;
        }
      }

      if (!photo || !photo.dataUrl) {
        console.error('No photo data received');
        toast.error('No se pudo capturar la foto');
        setIsLoading(false);
        return null;
      }

      console.log('Photo captured successfully, getting location...');

      // Get current location with extended timeout
      try {
        if (isNative) {
          position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000, // Increased timeout
          });
        } else {
          // Web geolocation API
          position = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation not supported'));
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ coords: pos.coords }),
              (err) => reject(err),
              {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
              }
            );
          });
        }
      } catch (locationError) {
        console.error('Location error:', locationError);
        toast.error('No se pudo obtener la ubicación. Verifica los permisos GPS.');
        setIsLoading(false);
        return null;
      }

      const result = {
        image: photo.dataUrl,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      console.log('Photo with location captured successfully');
      setIsLoading(false);
      return result;
    } catch (error: any) {
      console.error('Error capturing photo with location:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error al capturar foto con ubicación';
      
      if (error.message?.includes('permissions')) {
        errorMessage = 'Se necesitan permisos de cámara y ubicación';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Inténtalo en un lugar con mejor señal GPS';
      } else if (error.message?.includes('not available')) {
        errorMessage = 'Cámara no disponible en este dispositivo';
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  return {
    capturePhotoWithLocation,
    isLoading,
  };
};