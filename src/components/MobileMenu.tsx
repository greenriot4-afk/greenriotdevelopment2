import { useState, useEffect } from "react";
import { Menu, X, User, WalletIcon, LogOut, Store, Settings, MessageCircle, DollarSign, Globe } from "lucide-react";
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
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left">{t('menu.title')}</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </Button>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-1">
          {/* User Info */}
          {user && (
            <div className="px-3 py-2 text-sm text-muted-foreground border-b mb-4">
              <p className="font-medium text-foreground">{user.email}</p>
              <p className="text-xs">{t('menu.activeUser')}</p>
            </div>
          )}

          {/* Menu Items */}
          <Button
            variant="ghost"
            className="w-full justify-start px-3 h-12"
            onClick={handleAccountClick}
          >
            <User className="h-4 w-4 mr-3" />
            {t('menu.myAccount')}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-3 h-12"
            onClick={handleWalletClick}
          >
            <WalletIcon className="h-4 w-4 mr-3" />
            {t('menu.wallet')}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-3 h-12"
            onClick={handleChatClick}
          >
            <MessageCircle className="h-4 w-4 mr-3" />
            {t('menu.myChats')}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-3 h-12"
            onClick={handleAffiliatesClick}
          >
            <DollarSign className="h-4 w-4 mr-3" />
            {t('menu.affiliateProgram')}
          </Button>

          {userHasMarket ? (
            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-12"
              onClick={handleMyMarketClick}
            >
              <Settings className="h-4 w-4 mr-3" />
              {t('menu.myCircularMarket')}
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-12"
              onClick={handleCreateMarketClick}
            >
              <Store className="h-4 w-4 mr-3" />
              {t('menu.createCircularMarket')}
            </Button>
          )}

          {/* Logout */}
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {t('menu.signOut')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}