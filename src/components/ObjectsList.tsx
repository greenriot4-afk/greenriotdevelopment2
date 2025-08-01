import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Coins, User } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

export interface AbandonedObject {
  id: string;
  title: string;
  description: string;
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
}

export const ObjectsList = ({ objects, onPurchaseCoordinates, userLocation }: ObjectsListProps) => {
  const { calculateDistance } = useLocation();
  const [purchasing, setPurchasing] = useState<string | null>(null);

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

  const handlePurchase = async (objectId: string, price: number) => {
    setPurchasing(objectId);
    try {
      await onPurchaseCoordinates(objectId, price);
    } finally {
      setPurchasing(null);
    }
  };

  if (objects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No abandoned objects found nearby.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Be the first to share something in your area!
        </p>
      </div>
    );
  }

  return (
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
              <div className="flex items-center gap-1 text-sm font-medium">
                <Coins className="w-3 h-3 text-yellow-500" />
                {object.price_credits} credits
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                Shared {new Date(object.created_at).toLocaleDateString()}
              </div>
              
              <Button
                size="sm"
                onClick={() => handlePurchase(object.id, object.price_credits)}
                disabled={object.is_sold || purchasing === object.id}
                className="px-4"
              >
                {purchasing === object.id ? (
                  'Purchasing...'
                ) : object.is_sold ? (
                  'Sold Out'
                ) : (
                  'Buy Coordinates'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};