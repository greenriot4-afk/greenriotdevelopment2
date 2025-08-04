import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Languages, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Remove website navigation items - they'll be in the hamburger menu instead

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/fed4e95f-7ec0-41bc-b194-9781cdc063de.png" 
              alt="Greenriot" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Menu - only show CTA button */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* CTA Button */}
            <Button asChild className="bg-accent hover:bg-accent/90 text-primary font-impact text-rebel shadow-rebel">
              <Link to="/app/abandons">
                {language === 'en' ? 'TRY BETA APP' : 'PRUEBA LA BETA'}
              </Link>
            </Button>

            {/* Language Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="text-white hover:text-accent hover:bg-white/10 font-impact"
            >
              <Languages className="h-4 w-4 mr-1" />
              {language === 'en' ? 'ES' : 'EN'}
            </Button>
          </div>

          {/* Mobile Menu - Show CTA button and Menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile CTA Button */}
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-primary font-impact text-xs px-3 py-2">
              <Link to="/app/abandons">
                {language === 'en' ? 'TRY BETA' : 'BETA'}
              </Link>
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-accent hover:bg-white/10"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - simplified, main navigation now in hamburger menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="text-white hover:text-accent hover:bg-white/10 font-impact w-fit"
              >
                <Languages className="h-4 w-4 mr-1" />
                {language === 'en' ? 'ES' : 'EN'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}