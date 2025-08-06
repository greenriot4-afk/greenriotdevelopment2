import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users, ShoppingBag, Gift, DollarSign, Camera, Eye, Store, Plus, Languages, Globe, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/hooks/useLanguage";
export default function LandingPage() {
  const {
    t
  } = useLanguage();
  return <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <Navbar />

      {/* Header Image Section */}
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
        <img src="/lovable-uploads/ec2460b1-159d-4595-9308-5a371bae3751.png" alt="Header" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20"></div>
      </section>

      {/* Hero Content Section */}
      <section className="relative py-24 px-4 overflow-hidden" style={{
      backgroundColor: '#17503a'
    }}>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-impact text-rebel mb-8 animate-fade-in delay-100 drop-shadow-2xl">
            <span className="text-accent">{t('landing.hero.title')}</span>
            <br />
            <span className="text-accent">{t('landing.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-accent mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-200 font-impact">{t('landing.hero.description')}</p>
          
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
      <section className="py-20 px-2 sm:px-4 bg-background">
        <div className="container mx-auto max-w-6xl px-2 sm:px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-left lg:text-left">
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-impact text-rebel mb-6 sm:mb-8 leading-tight text-foreground text-left">
                {t('landing.coordinates.title')}
              </h2>
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 text-left">
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm sm:text-lg text-foreground font-impact text-left">{t('landing.coordinates.feature1')}</p>
                </div>
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm sm:text-lg text-foreground font-impact text-left">
                    {t('landing.coordinates.feature2')}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm sm:text-lg text-foreground font-impact text-left">{t('landing.coordinates.feature3')}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3">
                  <Link to="/app/abandons">
                    {t('landing.coordinates.cta')} <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:order-first">
              <div className="p-8">
                <div className="text-center">
                  <div className="mb-6">
                    <img src="/lovable-uploads/d555150b-d59d-46cf-ad9e-2a7883671574.png" alt="Buy Coordinates" className="w-96 h-auto mx-auto" />
                  </div>
                  <h3 className="text-2xl font-impact text-rebel mb-4 text-foreground">{t('landing.coordinates.cardTitle')}</h3>
                  <p className="text-foreground text-lg leading-relaxed font-impact">{t('landing.coordinates.cardDescription')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Markets Feature */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* App Screenshots - Aligned to left */}
              <div className="space-y-8">
                <div className="w-80 max-w-sm">
                  <img src="/lovable-uploads/72660b3e-2b63-423d-86c3-d5f90e52aa22.png" alt="GreenRiot app showing garage sale and market features" className="w-full h-auto rounded-3xl shadow-2xl" />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-5xl font-impact text-rebel mb-8 leading-tight text-white">{t('landing.markets.title')}</h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <Eye className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">{t('landing.markets.feature1')}</p>
                </div>
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">{t('landing.markets.feature2')}</p>
                </div>
                <div className="flex gap-4">
                  <Trash2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">{t('landing.markets.feature3')}</p>
                </div>
                <div className="flex gap-4">
                  <Plus className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-white font-impact">{t('landing.markets.feature4')}</p>
                </div>
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-impact text-rebel shadow-rebel">
                
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Program CTA */}
      

      {/* Final CTA */}

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              
              <p className="text-white mb-4 font-impact">
                {t('footer.description')}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="border-accent text-accent font-impact">{t('footer.badges.circular')}</Badge>
                <Badge variant="outline" className="border-accent text-accent font-impact">{t('footer.badges.profitable')}</Badge>
              </div>
              <div className="space-y-2">
                <Link to="/cookies" className="block hover:text-accent transition-colors font-impact text-white">
                  {t('footer.links.cookies')}
                </Link>
                <Link to="/privacy" className="block hover:text-accent transition-colors font-impact text-white">
                  {t('footer.links.privacy')}
                </Link>
                <Link to="/legal" className="block hover:text-accent transition-colors font-impact text-white">
                  {t('footer.links.legal')}
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-impact text-rebel mb-4 text-accent">{t('footer.affiliate.title')}</h3>
              <p className="text-white mb-4 font-impact">
                {t('footer.affiliate.description')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-accent text-accent font-impact flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {t('footer.badges.bringMarkets')}
                </Badge>
                <Badge variant="outline" className="border-accent text-accent font-impact flex items-center gap-1">
                  <Globe className="h-3 w-3 text-blue-500" />
                  {t('footer.badges.helpPlanet')}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="border-t border-accent mt-8 pt-8 text-center text-white">
            <p className="font-impact">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>;
}