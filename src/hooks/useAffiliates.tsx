import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AffiliateCode {
  id: string;
  code: string;
  created_at: string;
  is_active: boolean;
}

export interface Referral {
  id: string;
  referred_user_id: string;
  affiliate_code: string;
  referred_at: string;
  commission_paid: boolean;
  commission_amount: number;
  subscription_date: string | null;
}

export interface Commission {
  id: string;
  amount: number;
  status: string;
  processed_at: string | null;
  created_at: string;
  referral_id: string;
}

export const useAffiliates = () => {
  const { user } = useAuth();
  const [affiliateCode, setAffiliateCode] = useState<AffiliateCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const generateAffiliateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createAffiliateCode = async () => {
    if (!user) return;

    try {
      const code = generateAffiliateCode();
      
      const { data, error } = await supabase
        .from('affiliate_codes')
        .insert({
          user_id: user.id,
          code: code
        })
        .select()
        .single();

      if (error) throw error;

      setAffiliateCode(data);
      toast.success('Affiliate code created successfully');
      return data;
    } catch (error) {
      console.error('Error creating affiliate code:', error);
      toast.error('Error creating affiliate code');
      return null;
    }
  };

  const getAffiliateLink = (code: string) => {
    return `${window.location.origin}/auth?ref=${code}`;
  };

  const copyAffiliateLink = async (code: string) => {
    const link = getAffiliateLink(code);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Error copying link');
    }
  };

  const fetchAffiliateData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch affiliate code
      const { data: codeData, error: codeError } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (codeError && codeError.code !== 'PGRST116') {
        throw codeError;
      }

      setAffiliateCode(codeData);

      // Fetch referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_user_id', user.id)
        .order('referred_at', { ascending: false });

      if (referralsError) throw referralsError;
      setReferrals(referralsData || []);

      // Fetch commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_user_id', user.id)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;
      setCommissions(commissionsData || []);

      // Calculate total earnings
      const total = commissionsData?.reduce((sum, commission) => {
        return sum + (commission.status === 'paid' ? parseFloat(commission.amount.toString()) : 0);
      }, 0) || 0;
      setTotalEarnings(total);

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Error loading affiliate data');
    } finally {
      setLoading(false);
    }
  };

  // Handle referral registration during signup
  const processReferralSignup = async (affiliateCode: string, newUserId: string) => {
    try {
      // Find the affiliate user by code
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliate_codes')
        .select('user_id')
        .eq('code', affiliateCode)
        .eq('is_active', true)
        .single();

      if (affiliateError || !affiliate) {
        console.log('Invalid or inactive affiliate code:', affiliateCode);
        return;
      }

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          affiliate_user_id: affiliate.user_id,
          referred_user_id: newUserId,
          affiliate_code: affiliateCode
        });

      if (referralError) {
        console.error('Error creating referral record:', referralError);
      } else {
        console.log('Referral recorded successfully');
      }
    } catch (error) {
      console.error('Error processing referral signup:', error);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, [user]);

  return {
    affiliateCode,
    referrals,
    commissions,
    loading,
    totalEarnings,
    createAffiliateCode,
    getAffiliateLink,
    copyAffiliateLink,
    fetchAffiliateData,
    processReferralSignup
  };
};