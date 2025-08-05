import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Store, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ObjectsList, AbandonedObject } from '@/components/ObjectsList';
import { CircularMarket } from '@/components/MarketsList';

const MarketCatalogPage = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [market, setMarket] = useState<CircularMarket | null>(null);
  const [products, setProducts] = useState<AbandonedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!marketId) return;

    const fetchMarketData = async () => {
      try {
        setLoading(true);
        
        // Fetch market details
        const { data: marketData, error: marketError } = await supabase
          .from('circular_markets')
          .select('*')
          .eq('id', marketId)
          .eq('is_active', true)
          .single();

        if (marketError) throw marketError;
        
        setMarket(marketData as CircularMarket);
        setIsOwner(user?.id === marketData.user_id);

        // Fetch market products
        const { data: productsData, error: productsError } = await supabase
          .from('objects')
          .select('*')
          .eq('market_id', marketId)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        
        const formattedProducts = (productsData || []).map(product => ({
          ...product,
          type: product.type as 'abandoned' | 'donation' | 'product'
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching market data:', error);
        toast.error('Error al cargar el catálogo');
        navigate('/app/markets');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [marketId, user]);

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">Cargando catálogo...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Mercadillo no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/markets')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Catálogo</h1>
          <p className="text-sm text-muted-foreground">{market.title}</p>
        </div>
        {isOwner && (
          <Button
            size="sm"
            onClick={() => toast.info('Función de agregar productos próximamente')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        )}
      </div>

      {/* Market Image */}
      {market.image_url && (
        <Card className="mb-4 overflow-hidden">
          <div className="aspect-video relative">
            <img 
              src={market.image_url} 
              alt={market.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90">
                <Store className="w-3 h-3 mr-1" />
                Market
              </Badge>
            </div>
            {market.accepts_donations && (
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="bg-green-500">
                  Accepts donations
                </Badge>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Market Info */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            {market.title}
          </CardTitle>
          {market.location_name && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {market.location_name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {market.description && (
            <p className="text-sm text-muted-foreground mb-2">{market.description}</p>
          )}
          {market.accepts_donations && (
            <Badge variant="outline" className="text-xs">
              Acepta donaciones
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      {products.length === 0 ? (
        <div className="text-center py-8">
          <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No hay productos en este catálogo</p>
          {isOwner && (
            <p className="text-sm text-muted-foreground mt-2">
              ¡Sé el primero en agregar productos!
            </p>
          )}
        </div>
      ) : (
        <ObjectsList
          objects={products}
          onPurchaseCoordinates={async () => {}}
          userLocation={null}
          objectType="product"
        />
      )}
    </div>
  );
};

export default MarketCatalogPage;