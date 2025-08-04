import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { useState } from 'react';
import { toast } from 'sonner';

export interface PhotoWithLocation {
  image: string;
  latitude: number;
  longitude: number;
}

// Updated hook to include selectFromGallery function
export const useCamera = (): {
  capturePhotoWithLocation: () => Promise<PhotoWithLocation | null>;
  selectFromGallery: () => Promise<PhotoWithLocation | null>;
  isLoading: boolean;
} => {
  const [isLoading, setIsLoading] = useState(false);

  // Web camera capture function using native browser APIs
  const captureWebPhoto = async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      // Create video element
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Create camera UI overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;

      video.style.cssText = `
        max-width: 90vw;
        max-height: 70vh;
        border-radius: 8px;
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 16px;
        margin-top: 20px;
      `;

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capturar Foto';
      captureBtn.style.cssText = `
        padding: 12px 24px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
      `;

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.style.cssText = `
        padding: 12px 24px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
      `;

      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(cancelBtn);
      overlay.appendChild(video);
      overlay.appendChild(buttonContainer);
      document.body.appendChild(overlay);

      // Get camera stream with better error handling
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1024 },
          height: { ideal: 1024 }
        } 
      })
      .then(stream => {
        video.srcObject = stream;
        video.play();

        // Add instructions
        const instructions = document.createElement('div');
        instructions.textContent = 'Posiciona el objeto en el centro y presiona "Capturar Foto"';
        instructions.style.cssText = `
          color: white;
          text-align: center;
          margin-bottom: 10px;
          font-size: 16px;
        `;
        overlay.insertBefore(instructions, video);

        // Capture photo
        captureBtn.onclick = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // Stop camera and cleanup
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(overlay);
          resolve(dataUrl);
        };

        // Cancel
        cancelBtn.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(overlay);
          resolve(null);
        };
      })
      .catch(error => {
        document.body.removeChild(overlay);
        console.error('Camera access error:', error);
        if (error.name === 'NotAllowedError') {
          reject(new Error('Permisos de cámara denegados. Actívalos en la configuración del navegador.'));
        } else if (error.name === 'NotFoundError') {
          reject(new Error('No se encontró ninguna cámara en este dispositivo.'));
        } else {
          reject(new Error('Error al acceder a la cámara: ' + error.message));
        }
      });
    });
  };

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
        // Web platform - use custom web camera implementation
        console.log('Using web camera API...');
        
        try {
          // Check if camera is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera not available in this browser');
          }

          // Use our custom web camera function
          const photoDataUrl = await captureWebPhoto();
          if (!photoDataUrl) {
            console.log('User cancelled photo capture');
            setIsLoading(false);
            return null;
          }

          photo = { dataUrl: photoDataUrl };
        } catch (webError) {
          console.error('Web camera error:', webError);
          toast.error('Error al acceder a la cámara. Verifica los permisos del navegador.');
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

  const selectFromGallery = async (): Promise<PhotoWithLocation | null> => {
    setIsLoading(true);
    try {
      console.log('Starting gallery selection with location...');
      
      // Check if we're running in a Capacitor environment
      const { Capacitor } = await import('@capacitor/core');
      const isNative = Capacitor.isNativePlatform();
      
      let photo;
      let position;

      if (isNative) {
        // Native platform - request permissions first
        console.log('Requesting camera permissions for gallery...');
        
        try {
          // Request camera permissions for gallery access
          const cameraPermissions = await Camera.requestPermissions({ permissions: ['photos'] });
          console.log('Gallery permissions:', cameraPermissions);
          
          if (cameraPermissions.photos === 'denied') {
            toast.error('Se necesitan permisos de galería. Actívalos en configuración.');
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

          // Select from gallery
          console.log('Selecting from gallery...');
          photo = await Camera.getPhoto({
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Photos,
            quality: 80,
            width: 1024,
            height: 1024,
          });

        } catch (cameraError) {
          console.error('Gallery error:', cameraError);
          toast.error('Error al acceder a la galería. Verifica los permisos.');
          setIsLoading(false);
          return null;
        }
      } else {
        // Web platform - use file input
        try {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          
          const photoDataUrl = await new Promise<string | null>((resolve) => {
            fileInput.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  resolve(reader.result as string);
                };
                reader.readAsDataURL(file);
              } else {
                resolve(null);
              }
            };
            fileInput.click();
          });

          if (!photoDataUrl) {
            console.log('User cancelled gallery selection');
            setIsLoading(false);
            return null;
          }

          photo = { dataUrl: photoDataUrl };
        } catch (webError) {
          console.error('Web gallery error:', webError);
          toast.error('Error al acceder a la galería.');
          setIsLoading(false);
          return null;
        }
      }

      if (!photo || !photo.dataUrl) {
        console.error('No photo data received from gallery');
        toast.error('No se pudo seleccionar la imagen');
        setIsLoading(false);
        return null;
      }

      console.log('Photo selected successfully, getting location...');

      // Get current location with extended timeout
      try {
        if (isNative) {
          position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
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

      console.log('Photo from gallery with location selected successfully');
      setIsLoading(false);
      return result;
    } catch (error: any) {
      console.error('Error selecting from gallery with location:', error);
      
      let errorMessage = 'Error al seleccionar imagen de galería';
      
      if (error.message?.includes('permissions')) {
        errorMessage = 'Se necesitan permisos de galería y ubicación';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Inténtalo en un lugar con mejor señal GPS';
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  return {
    capturePhotoWithLocation,
    selectFromGallery,
    isLoading,
  } as const;
};