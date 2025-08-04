import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Languages, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: language === 'en' ? 'HOME' : 'INICIO', href: '/landing' },
    { label: language === 'en' ? 'STOOPING' : 'STOOPING', href: '/abandons' },
    { label: language === 'en' ? 'THRIFTING' : 'THRIFTING', href: '/markets' },
    { label: language === 'en' ? 'WALLET' : 'BILLETERA', href: '/wallet' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/landing" className="flex items-center">
            <img 
              src="/lovable-uploads/fed4e95f-7ec0-41bc-b194-9781cdc063de.png" 
              alt="Greenriot" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-white font-impact text-sm hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
            
            {/* CTA Button */}
            <Button asChild className="bg-accent hover:bg-accent/90 text-primary font-impact text-rebel shadow-rebel">
              <Link to="/auth">
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-accent hover:bg-white/10"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-white font-impact text-sm hover:text-accent transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <Button asChild className="bg-accent hover:bg-accent/90 text-primary font-impact text-rebel shadow-rebel w-fit">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  {language === 'en' ? 'TRY BETA APP' : 'PRUEBA LA BETA'}
                </Link>
              </Button>

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