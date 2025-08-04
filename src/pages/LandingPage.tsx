import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, ShoppingBag, Gift, DollarSign, Camera, Eye, Store, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-urban py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <Badge variant="secondary" className="mb-8 text-lg px-6 py-2 animate-fade-in font-impact text-rebel shadow-rebel">
            🌍 ECONOMÍA CIRCULAR UNDERGROUND
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-impact text-rebel mb-8 animate-fade-in delay-100 text-white drop-shadow-2xl">
            <span className="text-white">
              STOOPING & THRIFTING
            </span>
            <br />
            <span className="text-primary-foreground">REBELIÓN URBANA</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-200 font-impact">
            <span className="font-black text-white text-rebel">ENCUENTRA TESOROS GRATIS CERCA DE TI</span> – dales una segunda vida – 
            <span className="font-black text-white text-rebel"> GANA O AHORRA DINERO</span> – salva el planeta
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in delay-300">
            <Button asChild size="lg" className="text-lg px-8 py-4 h-auto bg-white text-secondary hover:bg-gray-100 font-impact text-rebel shadow-rebel">
              <Link to="/auth">
                ÚNETE A LA REBELIÓN <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-secondary font-impact text-rebel">
              <Link to="/abandons">
                EXPLORA YA
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent rounded-full animate-pulse delay-500"></div>
        </div>
      </section>

      {/* Coordinates Feature - Money Making */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-primary text-primary-foreground font-impact text-rebel shadow-rebel">
                💰 GANA PASTA
              </Badge>
              <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-8 leading-tight text-foreground">
                <span className="text-primary">GANA PASTA</span> COMPARTIENDO FOTOS Y COORDENADAS 
                <br />DE TESOROS ABANDONADOS EN LA CALLE
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Camera className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">
                    CAZA MUEBLES, ELECTRÓNICOS O TESOROS ABANDONADOS EN LA CALLE
                  </p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">
                    COMPARTE LA UBICACIÓN APROXIMADA Y GANA PASTA CUANDO ALGUIEN COMPRE LAS COORDENADAS EXACTAS
                  </p>
                </div>
                <div className="flex gap-4">
                  <DollarSign className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">
                    CONVIERTE TUS PASEOS DIARIOS EN UNA OPORTUNIDAD DE NEGOCIO URBANO
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel">
                <Link to="/auth">
                  EMPEZAR A GANAR <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="lg:order-first">
              <Card className="p-8 bg-card border-primary shadow-rebel">
                <div className="text-center">
                  <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Eye className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-impact text-rebel mb-4 text-foreground">COMPRA COORDENADAS Y CONSIGUE CHOLLOS</h3>
                  <p className="text-foreground text-lg leading-relaxed font-impact">
                    Sabes que hay un <span className="font-black text-primary text-rebel">SOFÁ GRATIS</span> a 11 km de ti pero no exactamente dónde, 
                    <span className="font-black text-primary text-rebel"> compra las coordenadas</span> y consigue un 
                    <span className="font-black text-primary text-rebel"> SOFÁ DE 200€ POR 1€</span>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Markets Feature */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="p-8 bg-card border-primary shadow-rebel">
                <div className="text-center">
                  <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Store className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-impact text-rebel mb-4 text-foreground">EXPLORA TIENDAS CIRCULARES UNDERGROUND</h3>
                  <p className="text-foreground text-lg leading-relaxed font-impact">
                    <span className="font-black text-primary text-rebel">VE SU CATÁLOGO DESDE LA COMODIDAD DE TU CASA</span> 
                    <br />Y LUEGO VE A COMPRAR EN VIVO
                  </p>
                </div>
              </Card>
            </div>
            
            <div>
              <Badge className="mb-6 bg-primary text-primary-foreground font-impact text-rebel shadow-rebel">
                🏪 MERCADOS CIRCULARES
              </Badge>
              <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-8 leading-tight text-white">
                EXPLORA TIENDAS DE SEGUNDA MANO Y VENTAS DE GARAJE LOCALES
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Eye className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">
                    NAVEGA CATÁLOGOS DE TIENDAS LOCALES, VENTAS DE GARAJE Y MERCADOS CIRCULARES DESDE CASA
                  </p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">
                    VISITA SOLO LAS TIENDAS QUE TIENEN LO QUE BUSCAS, AHORRANDO TIEMPO Y GASOLINA
                  </p>
                </div>
                <div className="flex gap-4">
                  <Plus className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">
                    <span className="font-black text-primary text-rebel">CREA TU PROPIO MERCADO CIRCULAR,</span> gana dinero con cosas que no quieres y salva el planeta
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel">
                <Link to="/markets">
                  EXPLORAR MERCADOS <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-urban text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-6 drop-shadow-2xl">
            ¿LISTO PARA CONVERTIR BASURA EN DINERO?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto font-impact">
            ÚNETE A MILES DE USUARIOS QUE YA ESTÁN GANANDO DINERO, AHORRANDO DINERO Y AYUDANDO AL PLANETA A TRAVÉS DE LA ECONOMÍA CIRCULAR URBANA.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-4 h-auto bg-white text-secondary hover:bg-gray-100 font-impact text-rebel shadow-rebel">
              <Link to="/auth">
                ÚNETE GRATIS AHORA
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-secondary text-lg px-8 py-4 h-auto font-impact text-rebel">
              <Link to="/abandons">
                EMPEZAR A EXPLORAR
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-impact text-rebel mb-4 text-white">GREENRIOT</h3>
              <p className="text-white mb-4 font-impact">
                LA APP DE ECONOMÍA CIRCULAR QUE CONVIERTE TUS HALLAZGOS EN DINERO MIENTRAS SALVAS EL PLANETA.
              </p>
              <div className="flex space-x-4">
                <Badge variant="outline" className="border-primary text-primary font-impact">♻️ CIRCULAR</Badge>
                <Badge variant="outline" className="border-primary text-primary font-impact">💰 RENTABLE</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-impact text-rebel mb-4 text-white">FUNCIONES</h4>
              <ul className="space-y-2 text-white">
                <li><Link to="/abandons" className="hover:text-primary transition-colors font-impact">ENCONTRAR COSAS GRATIS</Link></li>
                <li><Link to="/markets" className="hover:text-primary transition-colors font-impact">MERCADOS CIRCULARES</Link></li>
                <li><Link to="/wallet" className="hover:text-primary transition-colors font-impact">GANANCIAS</Link></li>
                <li><Link to="/affiliate" className="hover:text-primary transition-colors font-impact">REFIERE Y GANA</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-impact text-rebel mb-4 text-white">COMUNIDAD</h4>
              <ul className="space-y-2 text-white">
                <li><Link to="/chat" className="hover:text-primary transition-colors font-impact">CHAT</Link></li>
                <li><Link to="/favorites" className="hover:text-primary transition-colors font-impact">FAVORITOS</Link></li>
                <li><Link to="/account" className="hover:text-primary transition-colors font-impact">MI CUENTA</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-impact text-rebel mb-4 text-white">IMPACTO</h4>
              <ul className="space-y-2 text-white font-impact">
                <li>50K+ USUARIOS ACTIVOS</li>
                <li>85% REDUCCIÓN DE RESIDUOS</li>
                <li>€500 AHORRO PROMEDIO</li>
                <li>COMUNIDAD CRECIENTE</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary mt-8 pt-8 text-center text-white">
            <p className="font-impact">&copy; 2024 GREENRIOT. TODOS LOS DERECHOS RESERVADOS. HACIENDO LA ECONOMÍA CIRCULAR RENTABLE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}