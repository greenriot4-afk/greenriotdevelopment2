import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SharedObject {
  id: string;
  type: 'abandoned' | 'donation' | 'product';
  title: string;
  description?: string;
  image_url?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  is_sold: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    username?: string;
  };
}

const SharedObjectPage = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const [object, setObject] = useState<SharedObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!objectId) {
      console.log('SharedObjectPage: No objectId provided');
      return;
    }

    console.log('SharedObjectPage: Fetching object with ID:', objectId);

    const fetchObject = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('objects')
          .select(`
            *
          `)
          .eq('id', objectId)
          .maybeSingle();

        if (error) {
          console.error('SharedObjectPage: Error fetching object:', error);
          throw error;
        }

        if (data) {
          // Fetch user profile separately
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', data.user_id)
            .maybeSingle();

          // Create object with profile data
          const objectWithProfile: SharedObject = {
            ...data,
            profiles: profileData || undefined
          } as SharedObject;

          console.log('SharedObjectPage: Object data fetched:', objectWithProfile);
          setObject(objectWithProfile);
        } else {
          setObject(null);
        }
      } catch (error) {
        console.error('SharedObjectPage: Catch block error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObject();
  }, [objectId]);

  // Meta tags para compartir en redes sociales
  useEffect(() => {
    if (object) {
      document.title = `${object.title} - GreenRiot`;
      
      // Meta description
      const metaDescription = document.querySelector('meta[name="description"]') || 
                             document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', object.description || object.title);
      if (!document.head.contains(metaDescription)) {
        document.head.appendChild(metaDescription);
      }
      
      // Open Graph meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]') || 
                     document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.setAttribute('content', object.title);
      if (!document.head.contains(ogTitle)) {
        document.head.appendChild(ogTitle);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || 
                           document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      ogDescription.setAttribute('content', object.description || object.title);
      if (!document.head.contains(ogDescription)) {
        document.head.appendChild(ogDescription);
      }
      
      const ogImage = document.querySelector('meta[property="og:image"]') || 
                     document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.setAttribute('content', object.image_url || '/lovable-uploads/991c69cf-b058-411d-b885-f70ba12f255b.png');
      if (!document.head.contains(ogImage)) {
        document.head.appendChild(ogImage);
      }
      
      const ogType = document.querySelector('meta[property="og:type"]') || 
                     document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      ogType.setAttribute('content', 'website');
      if (!document.head.contains(ogType)) {
        document.head.appendChild(ogType);
      }
    }
  }, [object]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'abandoned': return 'Objeto Abandonado';
      case 'donation': return 'Donación';
      case 'product': return 'Producto';
      default: return 'Objeto';
    }
  };

  const openInMaps = () => {
    if (object?.latitude && object?.longitude) {
      const url = `https://www.google.com/maps?q=${object.latitude},${object.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Objeto no encontrado</h1>
          <p className="text-muted-foreground">El objeto que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">GreenRiot</h1>
          <p className="text-sm text-muted-foreground mb-1">Stooping & Thrifting Circular economy App</p>
          <p className="text-xs text-muted-foreground">Save or make money. Save the planet</p>
        </div>

        {/* Object Card */}
        <Card className="mb-6">
          {object.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={object.image_url}
                alt={object.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">
                  {getTypeLabel(object.type)}
                </Badge>
                <CardTitle className="text-xl">{object.title}</CardTitle>
              </div>
              {object.price && object.type === 'product' && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    €{object.price}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {object.description && (
              <p className="text-foreground">{object.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {object.location_name && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {object.location_name}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(object.created_at), 'dd/MM/yyyy')}
              </div>
            </div>

            {object.profiles?.display_name && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Publicado por <span className="font-medium text-foreground">{object.profiles.display_name}</span>
                </p>
              </div>
            )}

          </CardContent>
        </Card>

        {/* App Download CTA */}
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="font-semibold text-foreground mb-2">¿Te interesa este objeto?</h3>
            <p className="text-muted-foreground mb-4">
              Crea una cuenta en Greenriot
            </p>
            <Button className="w-full">
              Crear cuenta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedObjectPage;