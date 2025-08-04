import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Languages, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex items-center justify-start md:justify-between h-16 sm:h-18 lg:h-20 gap-8 md:gap-0">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/lovable-uploads/fed4e95f-7ec0-41bc-b194-9781cdc063de.png" 
              alt="Greenriot" 
              className="h-8 sm:h-10 lg:h-12 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {/* CTA Button */}
            <Button asChild className="bg-accent hover:bg-accent/90 text-green-800 font-impact text-rebel shadow-rebel px-6 py-2.5 text-sm xl:text-base">
              <Link to="/app/abandons">
                {language === 'en' ? 'TRY BETA APP' : 'PRUEBA LA BETA'}
              </Link>
            </Button>

            {/* Language Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="text-white hover:text-accent hover:bg-white/10 font-impact px-3 py-2"
            >
              <Languages className="h-4 w-4 mr-1.5" />
              {language === 'en' ? 'ES' : 'EN'}
            </Button>
          </div>

          {/* Tablet Menu (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {/* CTA Button */}
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-green-800 font-impact text-xs px-4 py-2">
              <Link to="/app/abandons">
                {language === 'en' ? 'TRY BETA' : 'PRUEBA'}
              </Link>
            </Button>

            {/* Language Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="text-white hover:text-accent hover:bg-white/10 font-impact px-2 py-2"
            >
              <Languages className="h-4 w-4 mr-1" />
              {language === 'en' ? 'ES' : 'EN'}
            </Button>
          </div>

          {/* Mobile Menu (sm and below) */}
          <div className="md:hidden flex items-center space-x-0.5 ml-12">
            {/* Mobile CTA Button */}
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-green-800 font-impact text-xs px-2 sm:px-3 py-1.5 sm:py-2 min-w-0">
              <Link to="/app/abandons">
                {language === 'en' ? 'BETA' : 'BETA'}
              </Link>
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-accent hover:bg-white/10 p-2"
            >
              {isMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-white/10 bg-black/60 backdrop-blur-sm rounded-b-lg">
            <div className="flex flex-col space-y-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setLanguage(language === 'en' ? 'es' : 'en');
                  setIsMenuOpen(false);
                }}
                className="text-white hover:text-accent hover:bg-white/10 font-impact w-fit mx-auto px-4 py-2"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}