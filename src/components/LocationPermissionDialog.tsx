import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X } from 'lucide-react';

interface LocationPermissionDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  isLoading: boolean;
}

export const LocationPermissionDialog: React.FC<LocationPermissionDialogProps> = ({
  isOpen,
  onAccept,
  onDecline,
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          
          <DialogTitle className="text-xl">
            Share Location
          </DialogTitle>
          
          <DialogDescription className="text-center space-y-2">
            <p>
              Para ofrecerte la mejor experiencia, necesitamos acceso a tu ubicación para:
            </p>
            <ul className="text-sm space-y-1 mt-3">
              <li className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                Calcular distancias a objetos cercanos
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Mostrar contenido relevante en tu zona
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={onAccept}
            disabled={isLoading}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isLoading ? 'Getting location...' : 'Share Location'}
          </Button>
          
          <Button
            onClick={onDecline}
            variant="ghost"
            disabled={isLoading}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Ahora no
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Puedes cambiar esta configuración más tarde en tu perfil
        </p>
      </DialogContent>
    </Dialog>
  );
};