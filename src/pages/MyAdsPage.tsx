import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductForm, Product } from '@/components/ProductForm';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const MyAdsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('user_id', user.id)
        .is('market_id', null) // Solo productos sin mercadillo
        .in('type', ['product', 'donation'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los anuncios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleCreateProduct = async (productData: Omit<Product, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('objects')
        .insert({
          ...productData,
          user_id: user.id,
          market_id: null, // Sin mercadillo
        })
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data as Product, ...prev]);
      setShowForm(false);
      toast.success('Anuncio creado exitosamente!');
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id' | 'user_id'>) => {
    if (!editingProduct || !user) return;

    try {
      const { data, error } = await supabase
        .from('objects')
        .update({
          ...productData,
          market_id: null, // Mantener sin mercadillo
        })
        .eq('id', editingProduct.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? data as Product : p));
      setEditingProduct(null);
      setShowForm(false);
      toast.success('Anuncio actualizado exitosamente!');
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const handleToggleSold = async (product: Product) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('objects')
        .update({ is_sold: !product.is_sold })
        .eq('id', product.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === product.id ? data as Product : p));
      toast.success(data.is_sold ? 'Marcado como vendido' : 'Marcado como disponible');
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este anuncio?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('objects')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Anuncio eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el anuncio');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (showForm) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancelForm}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {editingProduct ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {editingProduct ? 'Actualiza tu anuncio' : 'Publica un nuevo anuncio'}
            </p>
          </div>
        </div>

        <ProductForm
          product={editingProduct || undefined}
          marketId="" // Sin mercadillo
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Mis Anuncios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus productos y donaciones personales
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo
        </Button>
      </div>

      {/* Info Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Anuncios Personales</h3>
              <p className="text-sm text-muted-foreground">
                Publica productos y donaciones sin necesidad de crear un mercadillo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Productos</p>
                <p className="font-semibold">
                  {products.filter(p => p.type === 'product').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Donaciones</p>
                <p className="font-semibold">
                  {products.filter(p => p.type === 'donation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando anuncios...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No tienes anuncios publicados</p>
          <p className="text-sm text-muted-foreground mb-4">
            Publica productos o donaciones para que otros usuarios los vean
          </p>
          <Button onClick={() => setShowForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Publicar primer anuncio
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex">
                {/* Image */}
                <div className="w-20 h-20 bg-muted flex-shrink-0">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{product.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={product.type === 'product' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {product.type === 'product' ? (
                            <>
                              <Package className="w-2 h-2 mr-1" />
                              {product.price_credits} créditos
                            </>
                          ) : (
                            <>
                              <Heart className="w-2 h-2 mr-1" />
                              Donación
                            </>
                          )}
                        </Badge>
                        {product.is_sold && (
                          <Badge variant="outline" className="text-xs">
                            Vendido
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleToggleSold(product)}
                    >
                      {product.is_sold ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteProduct(product.id!)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAdsPage;