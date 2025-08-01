import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, Navigation, User, AtSign } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user } = useAuth();
  const { userLocation, getCurrentLocation, updateSavedLocation, isLoading } = useLocation();
  const [customLatitude, setCustomLatitude] = useState(userLocation?.latitude?.toString() || "");
  const [customLongitude, setCustomLongitude] = useState(userLocation?.longitude?.toString() || "");
  const [locationName, setLocationName] = useState(userLocation?.address || "");
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setCustomLatitude(userLocation.latitude.toString());
      setCustomLongitude(userLocation.longitude.toString());
      setLocationName(userLocation.address || "");
    }
  }, [userLocation]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setDisplayName(data.display_name || '');
          setUsername(data.username || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error al cargar el perfil');
      }
    };

    fetchProfile();
  }, [user]);

  const handleCurrentLocation = async () => {
    const location = await getCurrentLocation(true);
    if (location) {
      setCustomLatitude(location.latitude.toString());
      setCustomLongitude(location.longitude.toString());
    }
  };

  const handleSaveCustomLocation = async () => {
    const lat = parseFloat(customLatitude);
    const lng = parseFloat(customLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Por favor ingresa coordenadas válidas');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Las coordenadas están fuera del rango válido');
      return;
    }

    await updateSavedLocation(lat, lng, locationName || 'Ubicación personalizada');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setProfileLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: username.trim().toLowerCase()
        })
        .eq('user_id', user.id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Este nombre de usuario ya está en uso');
          return;
        }
        throw error;
      }

      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 max-w-md mx-auto w-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Configuración de Cuenta</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tu perfil, ubicación y preferencias de la aplicación
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil de Usuario
            </CardTitle>
            <CardDescription>
              Configura tu nombre de usuario para los chats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre de mostrar
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Nombre de usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="usuario123"
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">
                  Solo letras, números y guiones bajos. Será usado para los chats.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={profileLoading || !displayName.trim() || !username.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                {profileLoading ? 'Guardando...' : 'Guardar Perfil'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tu Ubicación
            </CardTitle>
            <CardDescription>
              Tu ubicación se usa para calcular distancias a los objetos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userLocation ? (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Ubicación actual:</p>
                <p className="text-xs text-muted-foreground">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </p>
                {userLocation.address && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {userLocation.address}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No se ha configurado una ubicación
                </p>
              </div>
            )}

            <Button
              onClick={handleCurrentLocation}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isLoading ? 'Obteniendo...' : 'Usar Ubicación Actual'}
            </Button>
          </CardContent>
        </Card>

        {/* Custom Location Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación Personalizada</CardTitle>
            <CardDescription>
              Puedes establecer manualmente tu ubicación si lo prefieres
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Nombre de la ubicación (opcional)</Label>
              <Input
                id="locationName"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Ej: Mi casa, Oficina, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={customLatitude}
                  onChange={(e) => setCustomLatitude(e.target.value)}
                  placeholder="40.7128"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={customLongitude}
                  onChange={(e) => setCustomLongitude(e.target.value)}
                  placeholder="-74.0060"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveCustomLocation}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Ubicación
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  ¿Por qué necesitamos tu ubicación?
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Tu ubicación se guarda en tu perfil para calcular automáticamente las distancias a los objetos sin pedirla cada vez. Puedes actualizarla cuando quieras.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}