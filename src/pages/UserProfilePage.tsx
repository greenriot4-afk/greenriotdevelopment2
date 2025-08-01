import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, Activity } from 'lucide-react';
import { UserLikes } from '@/components/UserLikes';
import { UserComments } from '@/components/UserComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  location_name: string | null;
  created_at: string;
}

export const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [objectsCount, setObjectsCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's objects count
        const { count } = await supabase
          .from('objects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        setObjectsCount(count || 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (!userId) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Usuario no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User size={24} />
                {profile.display_name || 'Usuario'}
                {isOwnProfile && (
                  <Badge variant="secondary">Tu perfil</Badge>
                )}
              </CardTitle>
              {profile.username && (
                <p className="text-muted-foreground mt-1">@{profile.username}</p>
              )}
            </div>
            
            {!isOwnProfile && (
              <UserLikes targetUserId={userId} size="lg" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {profile.location_name && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                <span>{profile.location_name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <span>
                Miembro desde {formatDistanceToNow(new Date(profile.created_at), { 
                  locale: es 
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-muted-foreground" />
              <span>{objectsCount} anuncios publicados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <UserComments targetUserId={userId} />
    </div>
  );
};