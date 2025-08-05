import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Store, User } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useLanguage } from '@/hooks/useLanguage';
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
  const { t } = useLanguage();

  const getDistanceText = (market: CircularMarket) => {
    if (!userLocation) return t('markets.distance');
    
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
        <p className="text-muted-foreground">{t('markets.noMarketsAvailable')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('markets.circularMarketsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMarkets.map((market) => (
        <Card 
          key={market.id} 
          className="overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => window.location.href = `/market-detail/${market.id}`}
        >
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
                  {t('markets.market')}
                </Badge>
              </div>
              {market.accepts_donations && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="bg-green-500">
                    <Heart className="w-3 h-3 mr-1" />
                    {t('markets.acceptsDonations')}
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
                {t('markets.created')} {new Date(market.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div></div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    const mapsUrl = `https://www.google.com/maps?q=${market.latitude},${market.longitude}`;
                    window.open(mapsUrl, '_blank');
                  }}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {t('markets.openInMaps')}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/market-catalog/${market.id}`;
                  }}
                >
                  <Store className="w-3 h-3 mr-1" />
                  {t('markets.viewCatalog')}
                </Button>
                
                <ChatButton 
                  userId={market.user_id}
                  size="sm"
                  variant="outline"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};