import { useState, useEffect } from "react";
import { Menu, X, User, WalletIcon, LogOut, Store, Settings, MessageCircle, DollarSign, Globe, Heart, ShoppingBag, Truck, Wrench, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userHasMarket, setUserHasMarket] = useState(false);
  const { signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserMarket = async () => {
      if (!user) {
        setUserHasMarket(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('circular_markets')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1);

        if (error) throw error;
        setUserHasMarket(data && data.length > 0);
      } catch (error) {
        console.error('Error checking user market:', error);
        setUserHasMarket(false);
      }
    };

    checkUserMarket();
  }, [user]);

  const handleWalletClick = () => {
    navigate('/wallet');
    setIsOpen(false);
  };

  const handleAccountClick = () => {
    navigate('/account');
    setIsOpen(false);
  };

  const handleCreateMarketClick = () => {
    navigate('/markets');
    setIsOpen(false);
    // Show create form automatically when navigating to markets
    setTimeout(() => {
      const createButton = document.querySelector('[data-create-market]') as HTMLButtonElement;
      if (createButton) {
        createButton.click();
      }
    }, 100);
  };

  const handleChatClick = () => {
    navigate('/chat');
    setIsOpen(false);
  };

  const handleMyMarketClick = () => {
    navigate('/my-market');
    setIsOpen(false);
  };

  const handleAffiliatesClick = () => {
    navigate('/affiliates');
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success(t('menu.signOut'));
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 p-0 border-0"
        style={{ background: 'linear-gradient(135deg, #729f31, #5d7d28)' }}
      >
        {/* Header with user profile */}
        <div className="p-6 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {user?.email?.split('@')[0] || 'Usuario'}
              </h3>
              <p className="text-white/80 text-sm">Comprador/vendedor</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start mt-3 text-white hover:bg-white/10"
            onClick={handleAccountClick}
          >
            Mi Perfil
          </Button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={handleChatClick}
          >
            <MessageCircle className="h-5 w-5 mr-3" />
            Chats
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={() => {navigate('/favorites'); setIsOpen(false);}}
          >
            <Heart className="h-5 w-5 mr-3" />
            Favoritos
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={() => {navigate('/my-ads'); setIsOpen(false);}}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Mis Anuncios
          </Button>

          {userHasMarket ? (
            <Button
              variant="ghost"
              className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
              onClick={handleMyMarketClick}
            >
              <Store className="h-5 w-5 mr-3" />
              Mi Tienda
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
              onClick={handleCreateMarketClick}
            >
              <Plus className="h-5 w-5 mr-3" />
              Crear Tienda
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={() => {navigate('/transport'); setIsOpen(false);}}
          >
            <Truck className="h-5 w-5 mr-3" />
            Ofrecer Transporte
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={() => {navigate('/repair'); setIsOpen(false);}}
          >
            <Wrench className="h-5 w-5 mr-3" />
            Ofrecer arreglar o restaurar
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={() => {navigate('/tutorial'); setIsOpen(false);}}
          >
            <BookOpen className="h-5 w-5 mr-3" />
            Tutorial
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={handleAffiliatesClick}
          >
            <DollarSign className="h-5 w-5 mr-3" />
            Trae un suscriptor y gana hasta $85!
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white hover:bg-white/10"
            onClick={handleWalletClick}
          >
            <WalletIcon className="h-5 w-5 mr-3" />
            Mi Wallet
          </Button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 h-12 text-white/80 hover:bg-white/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}