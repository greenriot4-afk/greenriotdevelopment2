import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MapPin, Coins, User, Wallet, Clock, Store, UserCircle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useWallet } from '@/hooks/useWallet';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ChatButton } from '@/components/ChatButton';
import { UserLikes } from '@/components/UserLikes';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthAction } from '@/hooks/useAuthAction';

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
  user_display_name?: string;
  username?: string;
  market_id?: string; // Para identificar si viene de un mercadillo
}

interface ObjectsListProps {
  objects: AbandonedObject[];
  onPurchaseCoordinates: (objectId: string, price: number) => Promise<void>;
  userLocation: { latitude: number; longitude: number } | null;
  objectType: 'abandoned' | 'donation' | 'product';
  onObjectRemoved?: (objectId: string) => void; // New prop to handle object removal
}

export const ObjectsList = ({ objects, onPurchaseCoordinates, userLocation, objectType, onObjectRemoved }: ObjectsListProps) => {
  const navigate = useNavigate();
  const { calculateDistance } = useLocation();
  const { wallet, hasEnoughBalance, deductBalance, fetchWallet } = useWallet();
  const { requireAuth, isAuthenticated } = useAuthAction();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInsufficientFundsDialog, setShowInsufficientFundsDialog] = useState(false);
  const [selectedObject, setSelectedObject] = useState<AbandonedObject | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Helper function to check if an abandoned object is free (3+ hours old)
  const isAbandonedObjectFree = (object: AbandonedObject): boolean => {
    if (objectType !== 'abandoned') return false;
    const createdAt = new Date(object.created_at);
    const now = new Date();
    const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursPassed >= 3;
  };

  // Helper function to get remaining time until object becomes free
  const getTimeUntilFree = (object: AbandonedObject): { hours: number; minutes: number } => {
    const createdAt = new Date(object.created_at);
    const freeTime = new Date(createdAt.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours
    const now = new Date();
    const msRemaining = Math.max(0, freeTime.getTime() - now.getTime());
    
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  // Helper function to get time until object gets deleted (48 hours)
  const getTimeUntilDeletion = (object: AbandonedObject): { hours: number; minutes: number } => {
    const createdAt = new Date(object.created_at);
    const deletionTime = new Date(createdAt.getTime() + (48 * 60 * 60 * 1000)); // Add 48 hours
    const now = new Date();
    const msRemaining = Math.max(0, deletionTime.getTime() - now.getTime());
    
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  // Helper function to format deletion countdown text
  const getDeletionCountdownText = (object: AbandonedObject): string => {
    const { hours, minutes } = getTimeUntilDeletion(object);
    if (hours === 0 && minutes === 0) return 'Se eliminará pronto';
    if (hours < 1) return `Se elimina en ${minutes}m`;
    if (hours < 24) return `Se elimina en ${hours}h ${minutes}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `Se elimina en ${days}d ${remainingHours}h`;
  };

  // Helper function to format countdown text
  const getCountdownText = (object: AbandonedObject): string => {
    const { hours, minutes } = getTimeUntilFree(object);
    if (hours === 0 && minutes === 0) return 'FREE NOW';
    if (hours === 0) return `FREE in ${minutes}m`;
    return `FREE in ${hours}h ${minutes}m`;
  };

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
    // Always require authentication for Google Maps functionality
    requireAuth(() => {
      // For donations, open Google Maps directly (no payment required)
      if (objectType === 'donation') {
        openGoogleMaps(object);
        return;
      }

      // For abandoned objects that are free (3+ hours old), open Google Maps directly
      if (objectType === 'abandoned' && isAbandonedObjectFree(object)) {
        openGoogleMaps(object);
        return;
      }

      setSelectedObject(object);

      // Check if user has enough balance for paid objects
      if (hasEnoughBalance(object.price_credits)) {
        setShowConfirmDialog(true);
      } else {
        setShowInsufficientFundsDialog(true);
      }
    }, 'Debes crear una cuenta para ver las coordenadas');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedObject) return;

    setPurchasing(selectedObject.id);
    setShowConfirmDialog(false);

    try {
      console.log('Starting coordinate purchase:', {
        objectId: selectedObject.id,
        amount: selectedObject.price_credits,
        objectType,
        selectedObject
      });

      // Use the new coordinate purchase function that handles seller payment and platform fee
      const response = await supabase.functions.invoke('check-subscription', {
        body: {
          objectId: selectedObject.id,
          amount: selectedObject.price_credits,
          description: `Coordenadas para: ${selectedObject.title}`,
          objectType: objectType
        }
      });

      console.log('Raw edge function response:', response);
      
      // Try to get error details from the response object
      if (response.error && response.error.context) {
        console.log('Error context:', response.error.context);
      }
      
      // If there's a response object, try to extract more details
      if (response.error && response.error.response) {
        try {
          const errorText = await response.error.response.text();
          console.log('Error response text:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            console.log('Parsed error JSON:', errorJson);
            throw new Error(errorJson.error || errorJson.message || 'Unknown error');
          } catch (parseError) {
            console.log('Could not parse error as JSON:', parseError);
            throw new Error(errorText || 'Unknown error');
          }
        } catch (textError) {
          console.log('Could not get error text:', textError);
        }
      }

      const { data, error } = response;
      
      if (error) {
        console.error('Edge function error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        
        // Try to get more details from the error
        const errorMessage = error.message || error.details || 'Error al procesar el pago';
        throw new Error(errorMessage);
      }

      if (data?.error) {
        console.error('Data error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.success) {
        console.error('Payment failed - no success flag:', data);
        throw new Error('El pago no se procesó correctamente');
      }

      const platformFee = data.platformFee;
      const sellerAmount = data.sellerAmount;
      
      toast.success(
        `¡Pagaste $${selectedObject.price_credits} por las coordenadas! ` +
        `(Vendedor recibe $${sellerAmount}, comisión $${platformFee})`
      );
      
      openGoogleMaps(selectedObject);
      
      // Force wallet refresh to update header balance
      setTimeout(() => {
        fetchWallet();
      }, 500);

      // If object was an abandoned item and was deleted, remove it from the list
      if (objectType === 'abandoned' && onObjectRemoved) {
        onObjectRemoved(selectedObject.id);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
      toast.error(errorMessage);
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

  const getButtonText = (object: AbandonedObject) => {
    if (objectType === 'donation') {
      return (
        <>
          <MapPin className="w-3 h-3 mr-1" />
          Abrir Google Maps
        </>
      );
    }

    // For abandoned objects
    if (objectType === 'abandoned') {
      const isFree = isAbandonedObjectFree(object);
      if (isFree) {
        return (
          <>
            <MapPin className="w-3 h-3 mr-1" />
            Abrir Google Maps <span className="text-red-500 font-bold">GRATIS</span>
          </>
        );
      } else {
        return (
          <>
            <MapPin className="w-3 h-3 mr-1" />
            Abrir Google Maps <span className="text-red-500 font-bold">{object.price_credits}$</span>
            <Clock className="w-3 h-3 ml-2" />
          </>
        );
      }
    }

    return (
      <>
        <MapPin className="w-3 h-3 mr-1" />
        Abrir Google Maps <span className="text-red-500 font-bold">{object.price_credits}$</span>
      </>
    );
  };

  const getDateText = (object: AbandonedObject) => {
    const date = new Date(object.created_at);
    
    if (objectType === 'abandoned') {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `Shared at ${hours}.${minutes} ${day}/${month}`;
    }
    
    return `Shared ${date.toLocaleDateString()}`;
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
          <Card 
            key={object.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/app/object/${object.id}`)}
          >
            <div className="aspect-video relative">
              <img 
                src={object.image_url} 
                alt={object.title}
                className="w-full h-full object-cover"
              />
              <FavoriteButton objectId={object.id} />
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{object.title}</CardTitle>
              {object.description && (
                <p className="text-sm text-muted-foreground">{object.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              {/* User info and likes */}
              <div className="flex items-center justify-between mb-3 p-2 bg-muted/30 rounded-lg">
                <div className="flex flex-col gap-1">
                  <Link 
                    to={`/app/profile/${object.user_id}`}
                    className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                  >
                    {object.market_id ? (
                      <Store className="w-3 h-3 text-green-600" />
                    ) : (
                      <UserCircle className="w-3 h-3 text-blue-600" />
                     )}
                     {object.user_display_name || 'Usuario'}
                   </Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {getDistanceText(object)}
                    </div>
                     <span>{getDateText(object)}</span>
                     {objectType === 'abandoned' && (
                       <span className="text-xs text-red-500 dark:text-red-400">
                         {getDeletionCountdownText(object)}
                       </span>
                     )}
                   </div>
                 </div>
                 <UserLikes targetUserId={object.user_id} size="sm" />
               </div>
              
              <div className="space-y-2">
                {/* Botones de acción */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                   {/* Solo mostrar botón de chat para donaciones y productos */}
                   {objectType !== 'abandoned' && (
                     <ChatButton 
                       userId={object.user_id}
                       size="sm"
                       variant="outline"
                       requireAuth={true}
                     />
                   )}
                  
                   {/* Solo mostrar botón de maps para abandonados */}
                   {objectType === 'abandoned' && (
                     <div className="flex flex-col gap-2 flex-1">
                       {/* Countdown display for non-free abandoned objects */}
                       {!isAbandonedObjectFree(object) && (
                         <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                           <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                             <span className="text-red-500 font-bold">FREE</span> in {getTimeUntilFree(object).hours}h {getTimeUntilFree(object).minutes}m
                           </p>
                         </div>
                       )}
                       
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchaseClick(object);
                          }}
                          disabled={object.is_sold || purchasing === object.id}
                         className="flex-1"
                       >
                         {purchasing === object.id ? (
                           'Procesando...'
                         ) : object.is_sold ? (
                           'Agotado'
                         ) : (
                           getButtonText(object)
                         )}
                       </Button>
                     </div>
                   )}
                 </div>
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
               <br /><br />
               <strong>⚠️ Advertencia:</strong> Comprar una coordenada no garantiza que el artículo siga allí!
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
               <Link to="/app/wallet" className="flex items-center gap-2">
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