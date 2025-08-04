import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Recycle, Users, ShoppingBag, MapPin, Leaf, Heart, TrendingUp, Star, Gift } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6 animate-fade-in">
            🌱 Economía Circular
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-6 animate-fade-in">
            Greenriot
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in delay-100">
            Únete al movimiento de economía circular. Rescata objetos abandonados, dona lo que no uses y crea un futuro más sostenible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-200">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/auth">
                Comenzar Ahora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/abandons">
                Explorar Objetos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Circular Economy Explanation */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Qué es la Economía Circular?</h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            La economía circular es un modelo que busca eliminar los residuos y el consumo continuo de recursos. 
            En lugar de seguir el patrón tradicional de "tomar, hacer, desechar", creamos un sistema donde los 
            productos mantienen su valor el mayor tiempo posible.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Recycle className="h-12 w-12 text-primary mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-3">Reutilizar</h3>
                <p className="text-muted-foreground">
                  Da nueva vida a objetos abandonados y productos que otros ya no necesitan.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-secondary hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-secondary mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-3">Compartir</h3>
                <p className="text-muted-foreground">
                  Conecta con tu comunidad para donar, intercambiar y colaborar.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-accent hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Leaf className="h-12 w-12 text-accent mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-3">Regenerar</h3>
                <p className="text-muted-foreground">
                  Contribuye a un planeta más sano reduciendo residuos y emisiones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Beneficios del Modelo Circular</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Únete a una comunidad que está creando un impacto positivo real en el medio ambiente y la sociedad.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">85%</h3>
              <p className="text-lg font-semibold mb-3">Reducción de Residuos</p>
              <p className="text-muted-foreground">
                Los usuarios de Greenriot reducen sus residuos domésticos hasta un 85% participando activamente en la economía circular.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">€500</h3>
              <p className="text-lg font-semibold mb-3">Ahorro Anual Promedio</p>
              <p className="text-muted-foreground">
                Las familias ahorran en promedio €500 al año reutilizando, donando e intercambiando objetos.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">50k+</h3>
              <p className="text-lg font-semibold mb-3">Comunidad Activa</p>
              <p className="text-muted-foreground">
                Más de 50,000 usuarios colaborando para crear un futuro más sostenible y conectado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-12">
            <Star className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Programa de Afiliados</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Invita a tus amigos y familiares a unirse al movimiento circular. Por cada persona que se registre 
              a través de tu enlace de afiliado, recibirás comisiones de sus suscripciones Premium.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-background rounded-xl p-6 border">
                <h3 className="text-2xl font-bold text-primary mb-2">25%</h3>
                <p className="font-semibold mb-2">Nivel 3</p>
                <p className="text-sm text-muted-foreground">Comisión por referido</p>
              </div>
              <div className="bg-background rounded-xl p-6 border">
                <h3 className="text-2xl font-bold text-secondary mb-2">50%</h3>
                <p className="font-semibold mb-2">Nivel 2</p>
                <p className="text-sm text-muted-foreground">Comisión por referido activo</p>
              </div>
              <div className="bg-background rounded-xl p-6 border">
                <h3 className="text-2xl font-bold text-accent mb-2">100%</h3>
                <p className="font-semibold mb-2">Nivel 1</p>
                <p className="text-sm text-muted-foreground">Comisión premium</p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link to="/affiliate">
                Comenzar como Afiliado <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para Cambiar el Mundo?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de personas que ya están creando un impacto positivo en su comunidad y el planeta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">
                Crear Cuenta Gratuita
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/abandons">
                Explorar Ahora
              </Link>
            </Button>
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