import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, ShoppingBag, Gift, DollarSign, Camera, Eye, Store, Plus, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import Navbar from "@/components/Navbar";
export default function LandingPage() {
  const {
    t,
    language,
    setLanguage
  } = useLanguage();
  return <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <Navbar />

      {/* Header Image Section */}
      <section className="relative h-screen bg-cover bg-center bg-no-repeat overflow-hidden" style={{
      backgroundImage: "url('/lovable-uploads/33b0365e-92d9-4d4e-92b6-a0aa81533bb6.png')"
    }}>
        <div className="absolute inset-0 bg-black/20"></div>
      </section>

      {/* Hero Content Section */}
      <section className="relative py-24 px-4 overflow-hidden" style={{
      backgroundColor: '#17503a'
    }}>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-impact text-rebel mb-8 animate-fade-in delay-100 drop-shadow-2xl">
            <span className="text-accent">
              {t('landing.hero.title')}
            </span>
            <br />
            <span className="text-accent">{t('landing.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-accent mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-200 font-impact">
            {t('landing.hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in delay-300">
            <Button asChild size="lg" className="text-lg px-8 py-4 h-auto bg-white text-secondary hover:bg-gray-100 font-impact text-rebel shadow-rebel">
              
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-secondary font-impact text-rebel">
              
            </Button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5 bg-[#17503a]">
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
              
              <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-8 leading-tight text-foreground">
                {t('landing.coordinates.title')}
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Camera className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">
                    {t('landing.coordinates.feature1')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">
                    {t('landing.coordinates.feature2')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <DollarSign className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-impact">
                    {t('landing.coordinates.feature3')}
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel">
                
              </Button>
            </div>
            
            <div className="lg:order-first">
              <Card className="p-8 bg-card border-primary shadow-rebel">
                <div className="text-center">
                  <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Eye className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-impact text-rebel mb-4 text-foreground">{t('landing.coordinates.cardTitle')}</h3>
                  <p className="text-foreground text-lg leading-relaxed font-impact">
                    {t('landing.coordinates.cardDescription')}
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
                  <h3 className="text-2xl font-impact text-rebel mb-4 text-foreground">{t('landing.markets.cardTitle')}</h3>
                  <p className="text-foreground text-lg leading-relaxed font-impact">
                    {t('landing.markets.cardDescription')}
                  </p>
                </div>
              </Card>
            </div>
            
            <div>
              <Badge className="mb-6 bg-primary text-primary-foreground font-impact text-rebel shadow-rebel">
                {t('landing.markets.badge')}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-8 leading-tight text-white">
                {t('landing.markets.title')}
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Eye className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">
                    {t('landing.markets.feature1')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">
                    {t('landing.markets.feature2')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Plus className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">
                    {t('landing.markets.feature3')}
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel">
                <Link to="/markets">
                  {t('landing.markets.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-impact text-rebel mb-4 text-white">{t('landing.footer.title')}</h3>
              <p className="text-white mb-4 font-impact">
                {t('landing.footer.description')}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="border-accent text-accent font-impact">{t('landing.footer.circular')}</Badge>
                <Badge variant="outline" className="border-accent text-accent font-impact">{t('landing.footer.profitable')}</Badge>
              </div>
              <div className="space-y-2">
                <Link to="/cookies" className="block hover:text-accent transition-colors font-impact text-white">
                  Cookies Policy
                </Link>
                <Link to="/privacy" className="block hover:text-accent transition-colors font-impact text-white">
                  Privacy Policy
                </Link>
                <Link to="/legal" className="block hover:text-accent transition-colors font-impact text-white">
                  Legal Notice
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-impact text-rebel mb-4 text-white">Refer and Earn</h3>
              <p className="text-white mb-4 font-impact">
                Invita a tus amigos y gana recompensas por cada nuevo usuario que se registre. Construyamos juntos una comunidad más sostenible y próspera.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-accent text-accent font-impact">+10€ por referido</Badge>
                <Badge variant="outline" className="border-accent text-accent font-impact">Sin límites</Badge>
              </div>
            </div>
          </div>
          
          <div className="border-t border-accent mt-8 pt-8 text-center text-white">
            <p className="font-impact">{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>;
}