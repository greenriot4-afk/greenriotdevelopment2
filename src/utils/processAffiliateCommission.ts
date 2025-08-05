import { supabase } from '@/integrations/supabase/client';

export const processAffiliateCommission = async (referralId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('manual-commission-processing', {
      body: { referralId }
    });

    if (error) {
      console.error('Error processing commission:', error);
      throw error;
    }

    console.log('Commission processed successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to process commission:', error);
    throw error;
  }
};