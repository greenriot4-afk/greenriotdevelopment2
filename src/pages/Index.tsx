import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ObjectsList, AbandonedObject } from '@/components/ObjectsList';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { Camera, List, MapPin, Wallet, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [objects, setObjects] = useState<AbandonedObject[]>([]);
  const [userCredits, setUserCredits] = useState(100); // Mock wallet balance
  const { userLocation, getCurrentLocation, isLoading: locationLoading } = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada correctamente');
  };

  // Mock data for demonstration
  useEffect(() => {
    // Sample objects for testing
    const mockObjects: AbandonedObject[] = [
      {
        id: '1',
        title: 'Rusty Shopping Cart',
        description: 'Old shopping cart left in parking lot, shows signs of weathering',
        image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&q=80',
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        price_credits: 50,
        is_sold: false,
        user_id: 'other-user',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Abandoned Couch',
        description: 'Weathered outdoor furniture, appears to have been there for months',
        image_url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=500&q=80',
        latitude: 40.7128 + (Math.random() - 0.5) * 0.02,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.02,
        price_credits: 75,
        is_sold: false,
        user_id: 'other-user',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    setObjects(mockObjects);
  }, []);

  const handleUploadObject = async (data: {
    title: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    price: number;
  }) => {
    // In a real app, this would upload to Supabase
    const newObject: AbandonedObject = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      image_url: data.image,
      latitude: data.latitude,
      longitude: data.longitude,
      price_credits: data.price,
      is_sold: false,
      user_id: 'current-user',
      created_at: new Date().toISOString(),
    };
    
    setObjects(prev => [newObject, ...prev]);
  };

  const handlePurchaseCoordinates = async (objectId: string, price: number) => {
    if (userCredits < price) {
      toast.error('Insufficient credits');
      return;
    }

    // In a real app, this would create a purchase record in Supabase
    setUserCredits(prev => prev - price);
    
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
      toast.success(
        `Coordinates purchased! Location: ${object.latitude.toFixed(6)}, ${object.longitude.toFixed(6)}`,
        { duration: 10000 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold">Street Finds Swap</h1>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                className="h-8 w-8 p-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover and share abandoned objects
          </p>
          {user && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Bienvenido, {user.email}
            </p>
          )}
          
          {/* Wallet & Location */}
          <div className="flex items-center justify-between mt-4 p-3 bg-card rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{userCredits} credits</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={locationLoading}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {locationLoading ? 'Getting...' : userLocation ? 'Update' : 'Get Location'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Share
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="mt-6">
            {!userLocation ? (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Please enable location to see distances to objects
                </p>
                <Button onClick={getCurrentLocation} disabled={locationLoading}>
                  {locationLoading ? 'Getting Location...' : 'Get My Location'}
                </Button>
              </div>
            ) : (
              <ObjectsList
                objects={objects}
                onPurchaseCoordinates={handlePurchaseCoordinates}
                userLocation={userLocation}
              />
            )}
          </TabsContent>
          
          <TabsContent value="share" className="mt-6">
            <PhotoUpload onUpload={handleUploadObject} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
