import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Save, Navigation, User, AtSign, Crown, CreditCard, Share2 } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { AffiliateSection } from "@/components/AffiliateSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user } = useAuth();
  const { userLocation, getCurrentLocation, updateSavedLocation, isLoading } = useLocation();
  const { subscribed, subscriptionTier, subscriptionEnd, createSubscription, manageSubscription } = useSubscription();
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

    // Enhanced input validation using database function
    const sanitizedDisplayName = displayName.trim();
    const sanitizedUsername = username.trim().toLowerCase();
    
    // Client-side validation
    if (!sanitizedDisplayName || sanitizedDisplayName.length > 100) {
      toast.error('El nombre de mostrar debe tener entre 1 y 100 caracteres');
      return;
    }
    
    if (!sanitizedUsername || sanitizedUsername.length > 50) {
      toast.error('El nombre de usuario debe tener entre 1 y 50 caracteres');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
      toast.error('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
      return;
    }

    try {
      setProfileLoading(true);

      // Use database validation function
      const { data: isValid, error: validationError } = await supabase
        .rpc('validate_profile_input', {
          p_display_name: sanitizedDisplayName,
          p_username: sanitizedUsername
        });

      if (validationError) {
        toast.error('Error de validación: ' + validationError.message);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: sanitizedDisplayName,
          username: sanitizedUsername
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
          <h2 className="text-xl font-semibold mb-2">Mi Cuenta</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tu perfil, ubicación, suscripción y programa de afiliados
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="subscription">Premium</TabsTrigger>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
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
                  {isLoading ? 'Obteniendo...' : 'Actualizar Ubicación'}
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
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6 mt-6">
            {/* Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Suscripción Premium
                </CardTitle>
                <CardDescription>
                  Gestiona tu suscripción para crear mercadillos circulares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscribed ? (
                  <>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-green-600" />
                        <p className="font-medium text-green-900">Suscripción Activa</p>
                      </div>
                      <p className="text-sm text-green-700">Plan: {subscriptionTier}</p>
                      {subscriptionEnd && (
                        <p className="text-sm text-green-700">
                          Renueva: {new Date(subscriptionEnd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={manageSubscription}
                      variant="outline"
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Gestionar Suscripción
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-900">Premium - $19/mes</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Crea y gestiona mercadillos circulares ilimitados
                      </p>
                    </div>
                    <Button
                      onClick={createSubscription}
                      className="w-full"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Suscribirse a Premium
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates" className="mt-6">
            <AffiliateSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}