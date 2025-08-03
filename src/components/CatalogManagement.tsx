import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package, Heart, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductForm, Product } from './ProductForm';
import { useAuth } from '@/hooks/useAuth';

interface CatalogManagementProps {
  marketId: string;
}

export const CatalogManagement = ({ marketId }: CatalogManagementProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('market_id', marketId)
        .in('type', ['product', 'donation'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [marketId]);

  const handleCreateProduct = async (productData: Omit<Product, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('objects')
        .insert({
          ...productData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data as Product, ...prev]);
      setShowForm(false);
      toast.success('Producto creado exitosamente!');
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
        .update(productData)
        .eq('id', editingProduct.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? data as Product : p));
      setEditingProduct(null);
      setShowForm(false);
      toast.success('Producto actualizado exitosamente!');
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

    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este producto?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('objects')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
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
      <ProductForm
        product={editingProduct || undefined}
        marketId={marketId}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestión de Catálogo</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona productos y donaciones de tu mercadillo
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

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
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
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No hay productos en tu catálogo</p>
          <Button onClick={() => setShowForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Crear primer producto
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