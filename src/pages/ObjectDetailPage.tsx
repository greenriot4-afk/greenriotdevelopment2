import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ChatButton } from "@/components/ChatButton";
import { useLocation } from "@/hooks/useLocation";
import { useWallet } from "@/hooks/useWallet";
import { useAuthAction } from "@/hooks/useAuthAction";
import { useLanguage } from "@/hooks/useLanguage";

interface ObjectDetail {
  id: string;
  type: 'abandoned' | 'donation' | 'product';
  title: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  price_credits: number;
  is_sold: boolean;
  user_id: string;
  created_at: string;
  user_display_name?: string;
  username?: string;
}

export default function ObjectDetailPage() {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const [object, setObject] = useState<ObjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { calculateDistance, userLocation } = useLocation();
  const { hasEnoughBalance, deductBalance } = useWallet();
  const { requireAuth, isAuthenticated } = useAuthAction();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchObject = async () => {
      if (!objectId) return;

      try {
        const { data, error } = await supabase
          .from('objects')
          .select(`
            *,
            profiles!inner(display_name, username)
          `)
          .eq('id', objectId)
          .single();

        if (error) throw error;

        setObject({
          ...data,
          user_display_name: (data.profiles as any)?.display_name,
          username: (data.profiles as any)?.username,
          type: data.type as 'abandoned' | 'donation' | 'product'
        });
      } catch (error) {
        console.error('Error fetching object:', error);
        toast.error(t('object.errorLoading'));
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchObject();
  }, [objectId, navigate]);

  const handlePurchaseCoordinates = async () => {
    if (!object) return;

    await requireAuth(() => {
      // El requireAuth se encarga de mostrar el modal de auth si es necesario
    });

    if (!hasEnoughBalance(object.price_credits)) {
      toast.error(t('object.insufficientBalance'));
      return;
    }

    setPurchasing(true);
    try {
      const result = await supabase.functions.invoke('create-coordinate-payment-checkout', {
        body: {
          amount: object.price_credits,
          description: `Coordenadas de ${object.title}`,
          objectType: object.type,
          currency: 'USD',
          objectId: object.id
        }
      });

      if (result.error) throw result.error;

      // Redirect to Stripe checkout
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.success(t('object.coordinatesAcquired'));
      }
    } catch (error) {
      console.error('Error purchasing coordinates:', error);
      toast.error(t('object.paymentError'));
    } finally {
      setPurchasing(false);
    }
  };

  const getDistanceText = () => {
    if (!object || !userLocation) return '';
    const distance = calculateDistance(
      userLocation.latitude, userLocation.longitude,
      object.latitude, object.longitude
    );
    return distance ? `${distance.toFixed(1)}km` : '';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t('object.timeAgo.minutes')}`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} ${t('object.timeAgo.hours')}`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ${t('object.timeAgo.days')}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('object.loading')}</p>
        </div>
      </div>
    );
  }

  if (!object) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">{t('object.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header con botón de volver */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold line-clamp-1">{object.title}</h1>
      </div>

      <Card className="overflow-hidden">
        {/* Imagen principal */}
        <div className="aspect-video relative overflow-hidden">
          <img
            src={object.image_url}
            alt={object.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <FavoriteButton objectId={object.id} />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Título y descripción */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{object.title}</h2>
            {object.description && (
              <p className="text-muted-foreground leading-relaxed">
                {object.description}
              </p>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {object.user_display_name || object.username || t('object.user')}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(object.created_at)}
                </div>
                {getDistanceText() && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {getDistanceText()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Precio y acciones */}
          <div className="space-y-4">
            {object.type !== 'donation' && (
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {object.type === 'product' ? t('object.price') : t('object.coordinatesPrice')}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ${object.price_credits}
                  </p>
                </div>
                {object.type === 'abandoned' && (
                  <Button
                    onClick={handlePurchaseCoordinates}
                    disabled={purchasing || !isAuthenticated}
                    className="min-w-32"
                  >
                    {purchasing ? t('object.purchasing') : t('object.viewLocation')}
                  </Button>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              <div className="flex-1">
                <ChatButton 
                  userId={object.user_id}
                  username={object.user_display_name || object.username}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}