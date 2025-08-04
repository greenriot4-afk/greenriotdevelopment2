import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Recycle, Users, ShoppingBag, MapPin, Leaf, Heart, TrendingUp, Star, Gift } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Funcionalidades Principales</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Greenriot te ofrece todas las herramientas necesarias para participar activamente en la economía circular.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Objetos Abandonados</h3>
                <p className="text-muted-foreground">
                  Descubre y rescata objetos abandonados en tu área. Geolocalización en tiempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Gift className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Donaciones</h3>
                <p className="text-muted-foreground">
                  Dona objetos que ya no necesitas y ayuda a otros miembros de la comunidad.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <ShoppingBag className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Productos</h3>
                <p className="text-muted-foreground">
                  Compra y vende productos de segunda mano de calidad certificada.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Mercados Circulares</h3>
                <p className="text-muted-foreground">
                  Conecta con mercados locales especializados en economía circular.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Greenriot</h3>
              <p className="text-muted-foreground mb-4">
                Construyendo un futuro circular y sostenible, una comunidad a la vez.
              </p>
              <div className="flex space-x-4">
                <Badge variant="outline">🌱 Sostenible</Badge>
                <Badge variant="outline">♻️ Circular</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/abandons" className="hover:text-foreground transition-colors">Objetos Abandonados</Link></li>
                <li><Link to="/markets" className="hover:text-foreground transition-colors">Mercados</Link></li>
                <li><Link to="/wallet" className="hover:text-foreground transition-colors">Wallet</Link></li>
                <li><Link to="/affiliate" className="hover:text-foreground transition-colors">Afiliados</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Comunidad</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/chat" className="hover:text-foreground transition-colors">Chat</Link></li>
                <li><Link to="/favorites" className="hover:text-foreground transition-colors">Favoritos</Link></li>
                <li><Link to="/account" className="hover:text-foreground transition-colors">Mi Cuenta</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Impacto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>+50k usuarios activos</li>
                <li>85% reducción residuos</li>
                <li>€500 ahorro promedio</li>
                <li>Crecimiento sostenible</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Greenriot. Todos los derechos reservados. Creando un futuro circular.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}