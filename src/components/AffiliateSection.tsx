import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAffiliates } from '@/hooks/useAffiliates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useWallet } from '@/hooks/useWallet';
import { Share2, Copy, Users, Euro, Calendar, Gift, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState } from 'react';

// Precio por defecto - se puede cambiar aquí
const PREMIUM_PRICE_USD = 20;

export const AffiliateSection = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { formatCurrency, selectedCurrency } = useWallet();
  const { 
    affiliateCode, 
    referrals, 
    commissions, 
    loading, 
    totalEarnings,
    createAffiliateCode,
    getAffiliateLink,
    copyAffiliateLink,
    getAffiliateLevelInfo
  } = useAffiliates();
  
  const [subscribing, setSubscribing] = useState(false);

  const handleCreatePremiumSubscription = async () => {
    if (!user) return;

    try {
      setSubscribing(true);
      
      const { data, error } = await supabase.functions.invoke('create-premium-subscription', {
        body: { 
          priceInCents: PREMIUM_PRICE_USD * 100 // Convert to cents
        }
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error(t('account.errorCreatingSubscription'));
    } finally {
      setSubscribing(false);
    }
  };

  // Show loading only for authenticated users
  if (loading && user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {t('affiliate.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">{t('affiliate.loadingData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For non-authenticated users, show promotional content
  if (!user) {
    return (
      <div className="space-y-6">
        {/* Header Section for Non-Authenticated Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              {t('affiliate.title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('affiliate.description')}
            </p>
            
            {/* Call to action for non-authenticated users */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Share2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    💰 ¡Únete al programa de afiliados!
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    Regístrate para acceder a tu código de afiliado personalizado y empezar a ganar comisiones por cada referido que se suscriba.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/auth'} 
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Registrarse Ahora
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Commission Levels - Always visible */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('affiliate.commissionLevels.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg bg-primary/5">
                <div>
                  <h4 className="font-semibold text-primary font-impact text-rebel">{t('affiliate.commissionLevels.level1.title')}</h4>
                  <span className="text-xl font-bold text-primary">{t('affiliate.commissionLevels.level1.commission')}</span>
                </div>
                <p className="text-sm text-primary/80">{t('affiliate.commissionLevels.level1.description')}</p>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-accent/20 rounded-lg bg-accent/5">
                <div>
                  <h4 className="font-semibold text-accent font-impact text-rebel">{t('affiliate.commissionLevels.level2.title')}</h4>
                  <span className="text-xl font-bold text-accent">{t('affiliate.commissionLevels.level2.commission')}</span>
                </div>
                <p className="text-sm text-accent/80">{t('affiliate.commissionLevels.level2.description')}</p>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-secondary/20 rounded-lg bg-secondary/5">
                <div>
                  <h4 className="font-semibold text-secondary font-impact text-rebel">{t('affiliate.commissionLevels.level3.title')}</h4>
                  <span className="text-xl font-bold text-secondary">{t('affiliate.commissionLevels.level3.commission')}</span>
                </div>
                <p className="text-sm text-secondary/80">{t('affiliate.commissionLevels.level3.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works - Always visible */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('affiliate.howItWorks')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold">1</span>
                <p className="text-sm">{t('affiliate.step1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold">2</span>
                <p className="text-sm">{t('affiliate.step2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold">3</span>
                <p className="text-sm">{t('affiliate.step3')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-bold">4</span>
                <p className="text-sm">{t('affiliate.step4')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {t('affiliate.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('affiliate.description')}
          </p>
          
          {/* Sección motivacional para compartir anuncios */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Share2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 mb-2">
                  💰 ¡Gana dinero compartiendo anuncios!
                </h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  <strong>Cada vez que compartes un anuncio o mercadillo puedes ganar dinero.</strong> 
                  Tu código de afiliado se incluye automáticamente en todos los enlaces que compartes. 
                  Cuando alguien se registra y compra una suscripción premium desde tu enlace, 
                  ¡recibes una comisión!
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <Gift className="w-4 h-4" />
                  <span className="font-medium">Comparte → Registros → Comisiones automáticas</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nivel del afiliado */}
          {affiliateCode && (
            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-secondary" />
                <span className="font-medium">Nivel de Afiliado</span>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-sm font-bold">
                  {getAffiliateLevelInfo(affiliateCode.level).name}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAffiliateLevelInfo(affiliateCode.level).percentage} comisión
                </p>
              </div>
            </div>
          )}

          {/* Ganancias totales */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              {selectedCurrency === 'EUR' ? 
                <Euro className="w-5 h-5 text-primary" /> : 
                <DollarSign className="w-5 h-5 text-primary" />
              }
              <span className="font-medium">{t('affiliate.totalEarnings')}</span>
            </div>
            <Badge variant="secondary" className="text-lg font-bold">
              {formatCurrency(totalEarnings)}
            </Badge>
          </div>

          {/* Affiliate link section */}
          {!affiliateCode ? (
            <div className="text-center py-6 border border-dashed border-muted-foreground/25 rounded-lg">
              <Gift className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-medium mb-2">{t('affiliate.startEarning')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('affiliate.createCode')}
              </p>
              <Button onClick={createAffiliateCode}>
                {t('affiliate.createAffiliateCode')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('affiliate.yourLink')}</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 p-3 bg-muted rounded-lg text-sm break-all">
                    {getAffiliateLink(affiliateCode.code)}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyAffiliateLink(affiliateCode.code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{referrals.length}</p>
                <p className="text-sm text-muted-foreground">{t('affiliate.totalReferrals')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {selectedCurrency === 'EUR' ? 
                <Euro className="w-8 h-8 text-primary" /> : 
                <DollarSign className="w-8 h-8 text-primary" />
              }
              <div>
                <p className="text-2xl font-bold">{commissions.filter(c => c.status === 'paid').length}</p>
                <p className="text-sm text-muted-foreground">{t('affiliate.paidCommissions')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Commission Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('affiliate.commissionLevels.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level 1 - Greenriot Ambassadors */}
          <div className="border border-primary/20 rounded-lg p-4 bg-gradient-to-r from-primary/10 to-accent/10 shadow-rebel">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-primary font-impact text-rebel">{t('affiliate.commissionLevels.level1.title')}</h4>
              <span className="text-xl font-bold text-primary">{t('affiliate.commissionLevels.level1.commission')}</span>
            </div>
            <p className="text-sm text-primary/80">{t('affiliate.commissionLevels.level1.description')}</p>
          </div>
          
          {/* Level 2 - Active Users */}
          <div className="border border-accent/30 rounded-lg p-4 bg-gradient-to-r from-accent/5 to-primary/5">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-accent font-impact text-rebel">{t('affiliate.commissionLevels.level2.title')}</h4>
              <span className="text-xl font-bold text-accent">{t('affiliate.commissionLevels.level2.commission')}</span>
            </div>
            <p className="text-sm text-accent/80">{t('affiliate.commissionLevels.level2.description')}</p>
          </div>
          
          {/* Level 3 - Default Users */}
          <div className="border border-secondary/20 rounded-lg p-4 bg-gradient-to-r from-secondary/5 to-muted/5">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-secondary font-impact text-rebel">{t('affiliate.commissionLevels.level3.title')}</h4>
              <span className="text-xl font-bold text-secondary">{t('affiliate.commissionLevels.level3.commission')}</span>
            </div>
            <p className="text-sm text-secondary/80">{t('affiliate.commissionLevels.level3.description')}</p>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('affiliate.howItWorks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-sm">{t('affiliate.step1')}</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-sm">{t('affiliate.step2')}</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-sm">{t('affiliate.step3')}</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <p className="text-sm">{t('affiliate.step4')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};