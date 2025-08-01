import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/context/FavoritesContext';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  objectId: string;
  className?: string;
}

export const FavoriteButton = ({ objectId, className }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(objectId);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 left-2 z-10 bg-black/30 hover:bg-black/50 text-white border-0",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(objectId);
      }}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isLiked && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
};