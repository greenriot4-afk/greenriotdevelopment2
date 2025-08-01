import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { useUserLikes } from '@/hooks/useUserLikes';
import { cn } from '@/lib/utils';

interface UserLikesProps {
  targetUserId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserLikes = ({ targetUserId, size = 'md', className }: UserLikesProps) => {
  const { stats, loading, toggleLike } = useUserLikes(targetUserId);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toggleLike('like')}
        disabled={loading}
        className={cn(
          sizeClasses[size],
          'transition-colors',
          stats.userLike?.like_type === 'like' 
            ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
            : 'hover:bg-green-50 hover:border-green-200 hover:text-green-600'
        )}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={iconSize[size]} />
        ) : (
          <>
            <ThumbsUp 
              className={cn(
                stats.userLike?.like_type === 'like' ? 'fill-current' : ''
              )} 
              size={iconSize[size]} 
            />
            <span className="ml-1">{stats.likes}</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => toggleLike('dislike')}
        disabled={loading}
        className={cn(
          sizeClasses[size],
          'transition-colors',
          stats.userLike?.like_type === 'dislike' 
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
            : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
        )}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={iconSize[size]} />
        ) : (
          <>
            <ThumbsDown 
              className={cn(
                stats.userLike?.like_type === 'dislike' ? 'fill-current' : ''
              )} 
              size={iconSize[size]} 
            />
            <span className="ml-1">{stats.dislikes}</span>
          </>
        )}
      </Button>
    </div>
  );
};