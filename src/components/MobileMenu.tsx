import { useState, useEffect } from "react";
import { Menu, X, User, Settings, WalletIcon, LogOut, Store, MessageCircle, DollarSign, Plus, Heart, Globe, Megaphone, Languages, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuthAction } from "@/hooks/useAuthAction";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userHasMarket, setUserHasMarket] = useState(false);
  const {
    signOut,
    user
  } = useAuth();
  const {
    language,
    setLanguage,
    t
  } = useLanguage();
  const {
    requireAuth
  } = useAuthAction();
  const navigate = useNavigate();
  useEffect(() => {
    const checkUserMarket = async () => {
      if (!user) {
        setUserHasMarket(false);
        return;
      }
      try {
        const {
          data,
          error
        } = await supabase.from('circular_markets').select('id').eq('user_id', user.id).eq('is_active', true).limit(1);
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
    requireAuth(() => {
      navigate('/app/wallet');
      setIsOpen(false);
    });
  };
  const handleAccountClick = () => {
    requireAuth(() => {
      navigate('/app/account');
      setIsOpen(false);
    });
  };
  const handleCreateMarketClick = () => {
    requireAuth(() => {
      navigate('/app/markets');
      setIsOpen(false);
      // Show create form automatically when navigating to markets
      setTimeout(() => {
        const createButton = document.querySelector('[data-create-market]') as HTMLButtonElement;
        if (createButton) {
          createButton.click();
        }
      }, 100);
    });
  };
  const handleChatClick = () => {
    requireAuth(() => {
      navigate('/app/chat');
      setIsOpen(false);
    });
  };
  const handleMyMarketClick = () => {
    requireAuth(() => {
      navigate('/app/my-market');
      setIsOpen(false);
    });
  };
  const handleAffiliatesClick = () => {
    navigate('/app/affiliates');
    setIsOpen(false);
  };

  const handleAdminContentClick = () => {
    requireAuth(() => {
      navigate('/app/admin-content');
      setIsOpen(false);
    });
  };
  const handleFavoritesClick = () => {
    requireAuth(() => {
      navigate('/app/favorites');
      setIsOpen(false);
    });
  };
  const handleMyAdsClick = () => {
    requireAuth(() => {
      navigate('/app/my-ads');
      setIsOpen(false);
    });
  };
  const handleWebsiteClick = () => {
    navigate('/');
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
  const handleAuthRedirect = () => {
    navigate('/auth');
    setIsOpen(false);
  };
  return <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 border-0 bg-gradient-to-br from-primary to-primary/80">
        {/* Header with user profile or auth prompt */}
        <div className="p-6 bg-black/20 backdrop-blur-sm">
          {user ? <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
               <div>
                 <h3 className="text-white font-medium">
                   {user?.email?.split('@')[0] || t('menu.user')}
                 </h3>
               </div>
            </div> : <div className="text-center">
              <h3 className="text-white font-semibold mb-2">¡Únete a Greenriot!</h3>
              <Button variant="secondary" size="sm" onClick={handleAuthRedirect} className="w-full">
                Iniciar Sesión / Registro
              </Button>
            </div>}
          
          {user && <Button variant="ghost" className="w-full justify-start mt-3 text-white hover:bg-white/10" onClick={handleAccountClick}>
              <Settings className="h-5 w-5 mr-3" />
              {t('menu.myAccount')}
            </Button>}
        </div>


        {/* Menu Items */}
        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleWalletClick}>
            <WalletIcon className="h-5 w-5 mr-3" />
            {t('menu.myWallet')}
          </Button>

          <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleChatClick}>
            <MessageCircle className="h-5 w-5 mr-3" />
            {t('menu.chats')}
          </Button>

          <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleFavoritesClick}>
            <Heart className="h-5 w-5 mr-3" />
            {t('menu.favorites')}
          </Button>

          {!userHasMarket && <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleMyAdsClick}>
              <Megaphone className="h-5 w-5 mr-3" />
              {t('menu.myAds')}
            </Button>}

          {!userHasMarket && <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleCreateMarketClick}>
              <Plus className="h-5 w-5 mr-3" />
              {t('menu.createCircularMarket')}
            </Button>}

          {userHasMarket && <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleMyMarketClick}>
              <Store className="h-5 w-5 mr-3" />
              {t('menu.myCircularMarket')}
            </Button>}

          <Button variant="ghost" className="w-full justify-start px-4 py-3 text-white hover:bg-white/10 h-auto" onClick={handleAffiliatesClick}>
            <DollarSign className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
            <span className="text-left leading-tight whitespace-pre-line">
              {t('menu.affiliateProgram')}
            </span>
          </Button>

          {/* Admin and Website buttons */}
          <div className="pt-4 border-t border-white/10 space-y-2">
             {/* Show admin content only for specific user */}
             {user?.email === 'inigoloperena@gmail.com' && (
               <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleAdminContentClick}>
                 <Database className="h-5 w-5 mr-3" />
                 {t('admin.contentManagement')}
               </Button>
             )}

             <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={handleWebsiteClick}>
               <Globe className="h-5 w-5 mr-3" />
               Website
             </Button>

            <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white hover:bg-white/10" onClick={toggleLanguage}>
              <Languages className="h-5 w-5 mr-3" />
              {language === 'en' ? 'ES' : 'EN'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        {user ? <div className="absolute bottom-4 left-4 right-4">
            <Button variant="ghost" className="w-full justify-start px-4 h-12 text-white/80 hover:bg-white/10" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 mr-3" />
              {t('menu.signOut')}
            </Button>
          </div> : <div className="absolute bottom-4 left-4 right-4">
            <Button variant="secondary" className="w-full" onClick={handleAuthRedirect}>
              <User className="h-5 w-5 mr-3" />
              Crear Cuenta
            </Button>
          </div>}
      </SheetContent>
    </Sheet>;
}