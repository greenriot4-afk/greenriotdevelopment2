import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MapPin, Coins, User, Wallet } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export interface AbandonedObject {
  id: string;
  type?: 'abandoned' | 'donation' | 'product';
  title: string;
  description?: string;
  image_url: string;
  latitude: number;
  longitude: number;
  price_credits: number;
  is_sold: boolean;
  user_id: string;
  created_at: string;
}

interface ObjectsListProps {
  objects: AbandonedObject[];
  onPurchaseCoordinates: (objectId: string, price: number) => Promise<void>;
  userLocation: { latitude: number; longitude: number } | null;
  objectType: 'abandoned' | 'donation' | 'product';
}

export const ObjectsList = ({ objects, onPurchaseCoordinates, userLocation, objectType }: ObjectsListProps) => {
  const { calculateDistance } = useLocation();
  const { wallet, hasEnoughBalance, deductBalance } = useWallet();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInsufficientFundsDialog, setShowInsufficientFundsDialog] = useState(false);
  const [selectedObject, setSelectedObject] = useState<AbandonedObject | null>(null);

  const getDistanceText = (object: AbandonedObject) => {
    if (!userLocation) return 'Unknown distance';
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      object.latitude,
      object.longitude
    );
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m away`;
    } else {
      return `${distance.toFixed(1)}km away`;
    }
  };

  const handlePurchaseClick = (object: AbandonedObject) => {
    // For donations, open Google Maps directly (no payment required)
    if (objectType === 'donation') {
      openGoogleMaps(object);
      return;
    }

    setSelectedObject(object);

    // Check if user has enough balance
    if (hasEnoughBalance(object.price_credits)) {
      setShowConfirmDialog(true);
    } else {
      setShowInsufficientFundsDialog(true);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedObject) return;

    setPurchasing(selectedObject.id);
    setShowConfirmDialog(false);

    try {
      await deductBalance(
        selectedObject.price_credits,
        `Coordenadas para: ${selectedObject.title}`,
        objectType
      );
      
      toast.success(`¡Pagaste $${selectedObject.price_credits} por las coordenadas!`);
      openGoogleMaps(selectedObject);
    } catch (error) {
      toast.error('Error al procesar el pago');
      console.error('Payment error:', error);
    } finally {
      setPurchasing(null);
      setSelectedObject(null);
    }
  };

  const openGoogleMaps = (object: AbandonedObject) => {
    const mapsUrl = `https://www.google.com/maps?q=${object.latitude},${object.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const handleDialogClose = () => {
    setShowConfirmDialog(false);
    setShowInsufficientFundsDialog(false);
    setSelectedObject(null);
  };

  const getEmptyMessage = () => {
    switch (objectType) {
      case 'abandoned': return 'No se encontraron objetos abandonos cerca.';
      case 'donation': return 'No se encontraron donaciones disponibles.';
      case 'product': return 'No se encontraron productos en venta.';
      default: return 'No se encontraron objetos.';
    }
  };

  const getButtonText = () => {
    return 'Abrir Google Maps';
  };

  if (objects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{getEmptyMessage()}</p>
        <p className="text-sm text-muted-foreground mt-2">
          ¡Sé el primero en compartir algo en tu área!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {objects.map((object) => (
          <Card key={object.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={object.image_url} 
                alt={object.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={object.is_sold ? "secondary" : "default"}>
                  {object.is_sold ? 'Sold' : 'Available'}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{object.title}</CardTitle>
              {object.description && (
                <p className="text-sm text-muted-foreground">{object.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {getDistanceText(object)}
                </div>
                {objectType !== 'donation' && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Coins className="w-3 h-3 text-yellow-500" />
                    ${object.price_credits}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  Shared {new Date(object.created_at).toLocaleDateString()}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handlePurchaseClick(object)}
                  disabled={object.is_sold || purchasing === object.id}
                  className="px-4"
                >
                  {purchasing === object.id ? (
                    'Procesando...'
                  ) : object.is_sold ? (
                    'Agotado'
                  ) : (
                    getButtonText()
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog - When user has enough balance */}
      <AlertDialog open={showConfirmDialog} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pago</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Quieres pagar ${selectedObject?.price_credits} para abrir Google Maps con las coordenadas exactas de "{selectedObject?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase}>Sí, pagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Insufficient Funds Dialog */}
      <AlertDialog open={showInsufficientFundsDialog} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Saldo Insuficiente</AlertDialogTitle>
            <AlertDialogDescription>
              Para abrir Google Maps con las coordenadas exactas debes pagar ${selectedObject?.price_credits}. 
              Tu saldo actual es: ${wallet?.balance || 0}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link to="/wallet" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Ir a Mi Wallet
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};