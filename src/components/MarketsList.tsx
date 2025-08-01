import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Store, User } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { ChatButton } from '@/components/ChatButton';

export interface CircularMarket {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  accepts_donations: boolean;
  is_active: boolean;
  user_id: string;
  created_at: string;
}

interface MarketsListProps {
  markets: CircularMarket[];
  onMarketClick: (marketId: string) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

export const MarketsList = ({ markets, onMarketClick, userLocation }: MarketsListProps) => {
  const { calculateDistance } = useLocation();

  const getDistanceText = (market: CircularMarket) => {
    if (!userLocation) return 'Distancia desconocida';
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      market.latitude,
      market.longitude
    );
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  };

  // Sort markets by distance if user location is available
  const sortedMarkets = userLocation 
    ? [...markets].sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      })
    : markets;

  if (markets.length === 0) {
    return (
      <div className="text-center py-8">
        <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No hay mercadillos circulares disponibles.</p>
        <p className="text-sm text-muted-foreground mt-2">
          ¡Sé el primero en crear uno en tu área!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMarkets.map((market) => (
        <Card key={market.id} className="overflow-hidden">
          {market.image_url && (
            <div className="aspect-video relative">
              <img 
                src={market.image_url} 
                alt={market.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-white/90">
                  <Store className="w-3 h-3 mr-1" />
                  Mercadillo
                </Badge>
              </div>
              {market.accepts_donations && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="bg-green-500">
                    <Heart className="w-3 h-3 mr-1" />
                    Donaciones
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{market.title}</CardTitle>
            {market.location_name && (
              <p className="text-sm text-muted-foreground">{market.location_name}</p>
            )}
            {market.description && (
              <p className="text-sm text-muted-foreground">{market.description}</p>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {getDistanceText(market)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                Creado {new Date(market.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {market.accepts_donations && (
                  <Badge variant="outline" className="text-xs">
                    <Heart className="w-2 h-2 mr-1" />
                    Acepta donaciones
                  </Badge>
                )}
              </div>
              
              <ChatButton 
                userId={market.user_id}
                size="sm"
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};