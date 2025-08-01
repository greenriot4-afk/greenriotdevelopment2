import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAffiliates } from '@/hooks/useAffiliates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Share2, Copy, Users, Euro, Calendar, Gift } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState } from 'react';

// Precio por defecto - se puede cambiar aquí
const PREMIUM_PRICE_USD = 19;

export const AffiliateSection = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { 
    affiliateCode, 
    referrals, 
    commissions, 
    loading, 
    totalEarnings,
    createAffiliateCode,
    getAffiliateLink,
    copyAffiliateLink 
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
          {/* Ganancias totales */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              <span className="font-medium">{t('affiliate.totalEarnings')}</span>
            </div>
            <Badge variant="secondary" className="text-lg font-bold">
              ${totalEarnings.toFixed(2)}
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
              <Euro className="w-8 h-8 text-primary" />
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
                        ${referral.commission_amount}
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

      {/* Premium Subscription CTA */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">{t('affiliate.tryPremium')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('affiliate.premiumDescription')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('affiliate.premiumPlan')}</p>
              <p className="text-sm text-muted-foreground">{t('affiliate.premiumPrice')}</p>
            </div>
            <Button 
              onClick={handleCreatePremiumSubscription}
              disabled={subscribing}
            >
              {subscribing ? t('affiliate.processing') : t('affiliate.subscribe')}
            </Button>
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