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
const PREMIUM_PRICE_USD = 19;

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

  if (loading) {
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

          {/* Affiliate Code Section */}
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
                <label className="text-sm font-medium">{t('affiliate.yourCode')}</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-center text-lg font-bold">
                    {affiliateCode.code}
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

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('affiliate.recentReferrals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('affiliate.referredUser')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(referral.referred_at), {
                          addSuffix: true,
                          locale: language === 'es' ? es : enUS
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {referral.commission_paid ? (
                      <Badge variant="secondary" className="text-green-600">
                        {formatCurrency(referral.commission_amount)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {t('affiliate.pending')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Commission Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('affiliate.commissionLevels.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level 1 - Greenriot Ambassadors */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-green-800 dark:text-green-300">{t('affiliate.commissionLevels.level1.title')}</h4>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">{t('affiliate.commissionLevels.level1.commission')}</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400">{t('affiliate.commissionLevels.level1.description')}</p>
          </div>
          
          {/* Level 2 - Active Users */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300">{t('affiliate.commissionLevels.level2.title')}</h4>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{t('affiliate.commissionLevels.level2.commission')}</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">{t('affiliate.commissionLevels.level2.description')}</p>
          </div>
          
          {/* Level 3 - Default Users */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-800">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-300">{t('affiliate.commissionLevels.level3.title')}</h4>
              <span className="text-xl font-bold text-gray-600 dark:text-gray-400">{t('affiliate.commissionLevels.level3.commission')}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-400">{t('affiliate.commissionLevels.level3.description')}</p>
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